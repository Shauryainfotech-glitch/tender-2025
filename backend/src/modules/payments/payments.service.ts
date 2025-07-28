import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod, PaymentType } from './entities/payment.entity';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { Contract } from '../contracts/entities/contract.entity';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

// Payment Gateway Interfaces
interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  status: string;
  message?: string;
  data?: any;
}

interface GatewayConfig {
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
  environment: 'test' | 'live';
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private gatewayConfigs: Map<string, GatewayConfig> = new Map();

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    private configService: ConfigService,
  ) {
    this.initializeGateways();
  }

  private initializeGateways() {
    // Initialize payment gateway configurations
    this.gatewayConfigs.set('stripe', {
      apiKey: this.configService.get('STRIPE_API_KEY'),
      secretKey: this.configService.get('STRIPE_SECRET_KEY'),
      webhookSecret: this.configService.get('STRIPE_WEBHOOK_SECRET'),
      environment: this.configService.get('PAYMENT_ENV', 'test'),
    });

    this.gatewayConfigs.set('razorpay', {
      apiKey: this.configService.get('RAZORPAY_KEY_ID'),
      secretKey: this.configService.get('RAZORPAY_KEY_SECRET'),
      webhookSecret: this.configService.get('RAZORPAY_WEBHOOK_SECRET'),
      environment: this.configService.get('PAYMENT_ENV', 'test'),
    });

    // Add more gateways as needed
  }

  // Add alias for controller compatibility
  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    return this.createPayment(createPaymentDto, { id: userId });
  }

  // Payment Processing
  async createPayment(createPaymentDto: CreatePaymentDto, user: any): Promise<Payment> {
    // Validate contract if provided
    if (createPaymentDto.contractId) {
      const contract = await this.contractRepository.findOne({
        where: { id: createPaymentDto.contractId },
      });

      if (!contract) {
        throw new NotFoundException('Contract not found');
      }

      // Validate payment amount against contract
      if (createPaymentDto.amount > contract.contractValue) {
        throw new BadRequestException('Payment amount exceeds contract value');
      }
    }

    const paymentNumber = await this.generatePaymentNumber();

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      paymentNumber,
      status: PaymentStatus.PENDING,
      createdById: user.id,
    } as any);

    const savedPayment = await this.paymentRepository.save(payment as any) as Payment;

    // Create initial transaction
    await this.createTransaction({
      paymentId: savedPayment.id,
      type: TransactionType.PAYMENT,
      amount: savedPayment.amount,
      currency: savedPayment.currency,
      status: TransactionStatus.PENDING,
      gateway: savedPayment.paymentMethod,
    });

    // Process payment with gateway
    if (createPaymentDto.processImmediately) {
      await this.processPayment(savedPayment.id, user);
    }

    return savedPayment;
  }

  async processPayment(processPaymentDto: any, userId: string): Promise<Payment> {
    const paymentId = processPaymentDto.paymentId || processPaymentDto.id;
    return this.processPaymentById(paymentId, { id: userId });
  }

  async processPaymentById(paymentId: string, user: any): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['transactions'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment already processed');
    }

    try {
      // Process with payment gateway
      const gatewayResponse = await this.processWithGateway(payment);

      if (gatewayResponse.success) {
        payment.status = PaymentStatus.COMPLETED;
        payment.completedAt = new Date();
        payment.gatewayTransactionId = gatewayResponse.transactionId;

        // Update transaction
        await this.updateTransaction(payment.transactions[0].id, {
          status: TransactionStatus.SUCCESS,
          gatewayTransactionId: gatewayResponse.transactionId,
          gatewayResponse: gatewayResponse.data,
        });

        // Update invoice if linked
        if (payment.invoiceId) {
          await this.updateInvoiceStatus(payment.invoiceId, InvoiceStatus.PAID);
        }
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = gatewayResponse.message;

        // Update transaction
        await this.updateTransaction(payment.transactions[0].id, {
          status: TransactionStatus.FAILED,
          failureReason: gatewayResponse.message,
        });
      }
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = error.message;

      await this.updateTransaction(payment.transactions[0].id, {
        status: TransactionStatus.FAILED,
        failureReason: error.message,
      });

      this.logger.error(`Payment processing failed: ${error.message}`, error.stack);
    }

    return await this.paymentRepository.save(payment);
  }

  private async processWithGateway(payment: Payment): Promise<PaymentGatewayResponse> {
    const gateway = payment.paymentMethod;
    const config = this.gatewayConfigs.get(gateway);

    if (!config) {
      throw new BadRequestException(`Payment gateway ${gateway} not configured`);
    }

    // Implement actual gateway integration here
    // This is a mock implementation
    const mockSuccess = Math.random() > 0.1; // 90% success rate for testing

    if (mockSuccess) {
      return {
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        data: {
          processedAt: new Date(),
          gateway,
        },
      };
    } else {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        message: 'Insufficient funds',
      };
    }
  }

  // Invoice Generation
  async createInvoice(createInvoiceDto: CreateInvoiceDto, user: any): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    const subtotal = createInvoiceDto.lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * (createInvoiceDto.taxRate || 0)) / 100;
    const totalAmount = subtotal + taxAmount - (createInvoiceDto.discountAmount || 0);

    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      invoiceNumber,
      subtotal,
      taxAmount,
      totalAmount,
      status: InvoiceStatus.DRAFT,
      createdById: user.id,
    });

    return await this.invoiceRepository.save(invoice);
  }

  async sendInvoice(invoiceId: string, user: any): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    invoice.status = InvoiceStatus.SENT;
    invoice.sentAt = new Date();

    // Send email notification
    // await this.emailService.sendInvoice(invoice);

    return await this.invoiceRepository.save(invoice);
  }

  async cancelInvoice(invoiceId: string, reason: string, user: any): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Paid invoices cannot be cancelled');
    }

    invoice.status = InvoiceStatus.CANCELLED;
    invoice.cancellationReason = reason;
    invoice.cancelledAt = new Date();

    return await this.invoiceRepository.save(invoice);
  }

  // Refund Processing
  async processRefund(processRefundDto: ProcessRefundDto, user: any): Promise<Transaction> {
    const payment = await this.paymentRepository.findOne({
      where: { id: processRefundDto.paymentId },
      relations: ['transactions'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // Calculate total refunded amount
    const refundedAmount = payment.transactions
      .filter(t => t.type === TransactionType.REFUND && t.status === TransactionStatus.SUCCESS)
      .reduce((sum, t) => sum + t.amount, 0);

    const remainingAmount = payment.amount - refundedAmount;

    if (processRefundDto.amount > remainingAmount) {
      throw new BadRequestException('Refund amount exceeds remaining payment amount');
    }

    // Create refund transaction
    const refundTransaction = await this.createTransaction({
      paymentId: payment.id,
      type: TransactionType.REFUND,
      amount: processRefundDto.amount,
      currency: payment.currency,
      status: TransactionStatus.PENDING,
      gateway: payment.paymentMethod,
      metadata: {
        reason: processRefundDto.reason,
        originalTransactionId: payment.gatewayTransactionId,
      },
    });

    try {
      // Process refund with gateway
      const gatewayResponse = await this.processRefundWithGateway(payment, processRefundDto.amount);

      if (gatewayResponse.success) {
        refundTransaction.status = TransactionStatus.SUCCESS;
        refundTransaction.gatewayTransactionId = gatewayResponse.transactionId;
        refundTransaction.completedAt = new Date();

        // Update payment status if fully refunded
        if (processRefundDto.amount === remainingAmount) {
          payment.status = PaymentStatus.REFUNDED;
          payment.refundedAt = new Date();
          await this.paymentRepository.save(payment);
        }
      } else {
        refundTransaction.status = TransactionStatus.FAILED;
        refundTransaction.failureReason = gatewayResponse.message;
      }
    } catch (error) {
      refundTransaction.status = TransactionStatus.FAILED;
      refundTransaction.failureReason = error.message;
      this.logger.error(`Refund processing failed: ${error.message}`, error.stack);
    }

    return await this.transactionRepository.save(refundTransaction);
  }

  private async processRefundWithGateway(
    payment: Payment,
    amount: number,
  ): Promise<PaymentGatewayResponse> {
    // Implement actual gateway refund integration here
    // This is a mock implementation
    return {
      success: true,
      transactionId: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      data: {
        refundedAt: new Date(),
        originalPaymentId: payment.gatewayTransactionId,
      },
    };
  }

  // Transaction Management
  private async createTransaction(data: any): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      ...data,
      transactionNumber: await this.generateTransactionNumber(),
    });

    return await this.transactionRepository.save(transaction as any) as Transaction;
  }

  private async updateTransaction(id: string, data: any): Promise<Transaction> {
    await this.transactionRepository.update(id, data);
    return await this.transactionRepository.findOne({ where: { id } });
  }

  async getTransactions(filters: any): Promise<{ data: Transaction[]; total: number }> {
    const query = this.transactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.payment', 'payment');

    if (filters.paymentId) {
      query.andWhere('transaction.paymentId = :paymentId', { paymentId: filters.paymentId });
    }

    if (filters.type) {
      query.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query.andWhere('transaction.status = :status', { status: filters.status });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  // Payment Reconciliation
  async reconcilePayments(startDate: Date, endDate: Date): Promise<any> {
    const payments = await this.paymentRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['transactions'],
    });

    const reconciliationReport = {
      period: { startDate, endDate },
      totalPayments: payments.length,
      totalAmount: 0,
      successfulPayments: 0,
      failedPayments: 0,
      refundedAmount: 0,
      pendingPayments: 0,
      gatewayBreakdown: {},
    };

    payments.forEach(payment => {
      reconciliationReport.totalAmount += payment.amount;

      switch (payment.status) {
        case PaymentStatus.COMPLETED:
          reconciliationReport.successfulPayments++;
          break;
        case PaymentStatus.FAILED:
          reconciliationReport.failedPayments++;
          break;
        case PaymentStatus.PENDING:
          reconciliationReport.pendingPayments++;
          break;
      }

      // Calculate refunds
      const refunds = payment.transactions.filter(
        t => t.type === TransactionType.REFUND && t.status === TransactionStatus.SUCCESS
      );
      reconciliationReport.refundedAmount += refunds.reduce((sum, r) => sum + r.amount, 0);

      // Gateway breakdown
      if (!reconciliationReport.gatewayBreakdown[payment.paymentMethod]) {
        reconciliationReport.gatewayBreakdown[payment.paymentMethod] = {
          count: 0,
          amount: 0,
        };
      }
      reconciliationReport.gatewayBreakdown[payment.paymentMethod].count++;
      reconciliationReport.gatewayBreakdown[payment.paymentMethod].amount += payment.amount;
    });

    return reconciliationReport;
  }

  // Webhook Handling
  async handleWebhook(gateway: string, payload: any, signature: string): Promise<void> {
    const config = this.gatewayConfigs.get(gateway);

    if (!config) {
      throw new BadRequestException(`Unknown gateway: ${gateway}`);
    }

    // Verify webhook signature
    const isValid = this.verifyWebhookSignature(gateway, payload, signature, config.webhookSecret);

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process webhook based on event type
    switch (payload.event) {
      case 'payment.success':
        await this.handlePaymentSuccess(payload);
        break;
      case 'payment.failed':
        await this.handlePaymentFailure(payload);
        break;
      case 'refund.success':
        await this.handleRefundSuccess(payload);
        break;
      default:
        this.logger.warn(`Unhandled webhook event: ${payload.event}`);
    }
  }

  private verifyWebhookSignature(
    gateway: string,
    payload: any,
    signature: string,
    secret: string,
  ): boolean {
    // Implement gateway-specific signature verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return expectedSignature === signature;
  }

  private async handlePaymentSuccess(payload: any): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: { gatewayTransactionId: payload.transactionId },
      relations: ['payment'],
    });

    if (transaction) {
      transaction.status = TransactionStatus.SUCCESS;
      transaction.completedAt = new Date();
      await this.transactionRepository.save(transaction);

      const payment = transaction.payment;
      payment.status = PaymentStatus.COMPLETED;
      payment.completedAt = new Date();
      await this.paymentRepository.save(payment);
    }
  }

  private async handlePaymentFailure(payload: any): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: { gatewayTransactionId: payload.transactionId },
      relations: ['payment'],
    });

    if (transaction) {
      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason = payload.reason;
      await this.transactionRepository.save(transaction);

      const payment = transaction.payment;
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = payload.reason;
      await this.paymentRepository.save(payment);
    }
  }

  private async handleRefundSuccess(payload: any): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: { gatewayTransactionId: payload.transactionId },
    });

    if (transaction) {
      transaction.status = TransactionStatus.SUCCESS;
      transaction.completedAt = new Date();
      await this.transactionRepository.save(transaction);
    }
  }

  // Analytics
  async getPaymentStats(filters: any): Promise<any> {
    const query = this.paymentRepository.createQueryBuilder('payment');

    if (filters.startDate && filters.endDate) {
      query.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const totalPayments = await query.getCount();

    const statusBreakdown = await query
      .select('payment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .groupBy('payment.status')
      .getRawMany();

    const methodBreakdown = await query
      .select('payment.paymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .groupBy('payment.paymentMethod')
      .getRawMany();

    const dailyTrends = await query
      .select('DATE(payment.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .groupBy('DATE(payment.createdAt)')
      .orderBy('DATE(payment.createdAt)', 'ASC')
      .getRawMany();

    return {
      totalPayments,
      statusBreakdown,
      methodBreakdown,
      dailyTrends,
    };
  }

  // Add alias for controller compatibility
  async getStatistics(filters: any): Promise<any> {
    return this.getPaymentStats(filters);
  }

  // Query Methods
  async findAll(filters: any): Promise<{ data: Payment[]; total: number }> {
    const query = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('payment.contract', 'contract')
      .leftJoinAndSelect('payment.createdBy', 'createdBy');

    if (filters.organizationId) {
      query.andWhere('payment.organizationId = :organizationId', {
        organizationId: filters.organizationId
      });
    }

    if (filters.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters.paymentMethod) {
      query.andWhere('payment.paymentMethod = :paymentMethod', {
        paymentMethod: filters.paymentMethod
      });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string, user: any): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['invoice', 'contract', 'transactions', 'createdBy'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check access permissions
    if (user.role !== 'admin' && payment.organizationId !== user.organizationId) {
      throw new BadRequestException('Access denied');
    }

    return payment;
  }

  async findByTransactionId(transactionId: string, user: any): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { gatewayTransactionId: transactionId },
      relations: ['invoice', 'contract', 'transactions', 'createdBy'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check access permissions
    if (user.role !== 'admin' && payment.organizationId !== user.organizationId) {
      throw new BadRequestException('Access denied');
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: any): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    Object.assign(payment, updatePaymentDto);
    return await this.paymentRepository.save(payment);
  }

  async verifyPayment(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }

    // Verify payment status with gateway
    const gatewayResponse = await this.verifyWithGateway(payment);

    if (gatewayResponse.success && gatewayResponse.status === 'completed') {
      payment.status = PaymentStatus.COMPLETED;
      payment.completedAt = new Date();
      payment.verifiedAt = new Date();
      payment.verifiedById = userId;
    }

    return await this.paymentRepository.save(payment);
  }

  private async verifyWithGateway(payment: Payment): Promise<PaymentGatewayResponse> {
    // Mock implementation - replace with actual gateway verification
    return {
      success: true,
      transactionId: payment.gatewayTransactionId,
      status: 'completed',
      data: { verified: true },
    };
  }

  async refundPayment(id: string, refundDto: any, userId: string): Promise<Transaction> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.processRefund({
      paymentId: id,
      amount: refundDto.amount,
      reason: refundDto.reason,
    }, { id: userId });
  }

  async generateReceipt(id: string, user: any): Promise<any> {
    const payment = await this.findOne(id, user);

    const receipt = {
      receiptNumber: `RCP-${payment.paymentNumber}`,
      paymentDetails: {
        paymentNumber: payment.paymentNumber,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.paymentMethod,
        status: payment.status,
        date: payment.createdAt,
        completedAt: payment.completedAt,
      },
      payer: payment.payerDetails,
      payee: payment.payeeDetails,
      description: payment.description,
      generatedAt: new Date(),
      generatedBy: user.email,
    };

    // In a real implementation, you might generate a PDF here
    return receipt;
  }

  async findByOrganization(organizationId: string, filters: any): Promise<{ data: Payment[]; total: number }> {
    return this.findAll({ ...filters, organizationId });
  }

  async findByTender(tenderId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { tenderId },
      relations: ['invoice', 'contract', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async handleWebhookFromController(provider: string, payload: any, headers: any): Promise<void> {
    const signature = headers['x-webhook-signature'] || headers['stripe-signature'] || headers['razorpay-signature'];
    return this.handleWebhook(provider, payload, signature);
  }

  // Helper Methods
  private async generatePaymentNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.paymentRepository.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `PAY-${year}${month}-${sequence}`;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const count = await this.invoiceRepository.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `INV-${year}-${sequence}`;
  }

  private async generateTransactionNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `TXN-${timestamp}-${random}`;
  }

  private async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<void> {
    await this.invoiceRepository.update(invoiceId, {
      status,
      paidAt: status === InvoiceStatus.PAID ? new Date() : null,
    });
  }
}
