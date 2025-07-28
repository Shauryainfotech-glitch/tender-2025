import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WorkflowTemplate, WorkflowType } from './entities/workflow-template.entity';
import { WorkflowInstance, WorkflowStatus } from './entities/workflow-instance.entity';
import { WorkflowStep, StepStatus, ActionType } from './entities/workflow-step.entity';
import { WorkflowAction, ActionStatus } from './entities/workflow-action.entity';
import { User } from '../auth/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Role } from '../../common/enums/role.enum';

interface WorkflowContext {
  entityType: string;
  entityId: string;
  initiatorId: string;
  metadata?: Record<string, any>;
}

interface StepCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin';
  value: any;
}

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(WorkflowTemplate)
    private workflowTemplateRepository: Repository<WorkflowTemplate>,
    @InjectRepository(WorkflowInstance)
    private workflowInstanceRepository: Repository<WorkflowInstance>,
    @InjectRepository(WorkflowStep)
    private workflowStepRepository: Repository<WorkflowStep>,
    @InjectRepository(WorkflowAction)
    private workflowActionRepository: Repository<WorkflowAction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private smsService: SmsService,
    private eventEmitter: EventEmitter2,
  ) {}

  // Workflow Template Management
  async createTemplate(data: {
    name: string;
    description: string;
    type: WorkflowType;
    entityType: string;
    steps: Array<{
      name: string;
      description: string;
      order: number;
      approverRole?: string;
      approverIds?: string[];
      autoApprove?: boolean;
      conditions?: StepCondition[];
      actions: Array<{
        type: ActionType;
        trigger: 'on_enter' | 'on_exit' | 'on_approve' | 'on_reject';
        config: Record<string, any>;
      }>;
      timeoutHours?: number;
      escalationConfig?: {
        escalateAfterHours: number;
        escalateToRole?: string;
        escalateToUserIds?: string[];
      };
    }>;
    metadata?: Record<string, any>;
  }): Promise<WorkflowTemplate> {
    const template = this.workflowTemplateRepository.create({
      name: data.name,
      description: data.description,
      type: data.type,
      entityType: data.entityType,
      isActive: true,
      version: 1,
      steps: data.steps,
      metadata: data.metadata,
    });

    return await this.workflowTemplateRepository.save(template);
  }

  async updateTemplate(
    templateId: string,
    updates: Partial<WorkflowTemplate>,
  ): Promise<WorkflowTemplate> {
    const template = await this.workflowTemplateRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Workflow template not found');
    }

    // Create a new version if template is active and has instances
    const hasActiveInstances = await this.workflowInstanceRepository.count({
      where: {
        templateId,
        status: In([WorkflowStatus.ACTIVE, WorkflowStatus.PENDING]),
      },
    });

    if (hasActiveInstances > 0) {
      // Create new version instead of updating
      const newTemplate = this.workflowTemplateRepository.create({
        ...template,
        ...updates,
        id: undefined,
        version: template.version + 1,
        createdAt: undefined,
        updatedAt: undefined,
      });

      template.isActive = false;
      await this.workflowTemplateRepository.save(template);

      return await this.workflowTemplateRepository.save(newTemplate);
    }

    Object.assign(template, updates);
    return await this.workflowTemplateRepository.save(template);
  }

  // Workflow Instance Management
  async startWorkflow(
    templateId: string,
    context: WorkflowContext,
  ): Promise<WorkflowInstance> {
    const template = await this.workflowTemplateRepository.findOne({
      where: { id: templateId, isActive: true },
    });

    if (!template) {
      throw new NotFoundException('Active workflow template not found');
    }

    // Create workflow instance
    const instance = this.workflowInstanceRepository.create({
      templateId: template.id,
      entityType: context.entityType,
      entityId: context.entityId,
      status: WorkflowStatus.ACTIVE,
      currentStepOrder: 1,
      initiatorId: context.initiatorId,
      context: context.metadata || {},
    });

    const savedInstance = await this.workflowInstanceRepository.save(instance);

    // Create workflow steps
    const steps = await this.createWorkflowSteps(savedInstance, template.steps);

    // Execute first step
    await this.executeStep(steps[0], savedInstance);

    // Emit workflow started event
    this.eventEmitter.emit('workflow.started', {
      instanceId: savedInstance.id,
      templateId: template.id,
      entityType: context.entityType,
      entityId: context.entityId,
    });

    return savedInstance;
  }

  private async createWorkflowSteps(
    instance: WorkflowInstance,
    templateSteps: any[],
  ): Promise<WorkflowStep[]> {
    const steps = templateSteps.map(templateStep => 
      this.workflowStepRepository.create({
        workflowInstanceId: instance.id,
        name: templateStep.name,
        description: templateStep.description,
        order: templateStep.order,
        status: templateStep.order === 1 ? StepStatus.ACTIVE : StepStatus.PENDING,
        approverRole: templateStep.approverRole,
        approverIds: templateStep.approverIds,
        autoApprove: templateStep.autoApprove,
        conditions: templateStep.conditions,
        actions: templateStep.actions,
        timeoutHours: templateStep.timeoutHours,
        escalationConfig: templateStep.escalationConfig,
      })
    );

    return await this.workflowStepRepository.save(steps);
  }

  private async executeStep(
    step: WorkflowStep,
    instance: WorkflowInstance,
  ): Promise<void> {
    // Check conditions
    if (step.conditions && step.conditions.length > 0) {
      const conditionsMet = await this.evaluateConditions(step.conditions, instance);
      if (!conditionsMet) {
        // Skip this step
        await this.skipStep(step, instance, 'Conditions not met');
        return;
      }
    }

    // Execute on_enter actions
    await this.executeActions(step, 'on_enter', instance);

    // Auto-approve if configured
    if (step.autoApprove) {
      await this.approveStep(step.id, 'system', 'Auto-approved', instance);
      return;
    }

    // Notify approvers
    await this.notifyApprovers(step, instance);

    // Set timeout if configured
    if (step.timeoutHours) {
      setTimeout(
        () => this.handleStepTimeout(step.id),
        step.timeoutHours * 60 * 60 * 1000
      );
    }
  }

  async approveStep(
    stepId: string,
    approverId: string,
    comments: string,
    instance?: WorkflowInstance,
  ): Promise<WorkflowStep> {
    const step = await this.workflowStepRepository.findOne({
      where: { id: stepId },
      relations: ['workflowInstance'],
    });

    if (!step) {
      throw new NotFoundException('Workflow step not found');
    }

    if (step.status !== StepStatus.ACTIVE) {
      throw new BadRequestException('Step is not active');
    }

    // Validate approver
    if (!step.autoApprove && approverId !== 'system') {
      const isAuthorized = await this.validateApprover(step, approverId);
      if (!isAuthorized) {
        throw new BadRequestException('User not authorized to approve this step');
      }
    }

    // Update step status
    step.status = StepStatus.APPROVED;
    step.approvedBy = approverId;
    step.approvedAt = new Date();
    step.comments = comments;
    await this.workflowStepRepository.save(step);

    // Create action record
    await this.createActionRecord(step, ActionType.APPROVAL, approverId, comments);

    // Execute on_approve actions
    const workflowInstance = instance || step.workflowInstance;
    await this.executeActions(step, 'on_approve', workflowInstance);

    // Move to next step
    await this.moveToNextStep(workflowInstance, step);

    return step;
  }

  async rejectStep(
    stepId: string,
    rejectorId: string,
    reason: string,
  ): Promise<WorkflowStep> {
    const step = await this.workflowStepRepository.findOne({
      where: { id: stepId },
      relations: ['workflowInstance'],
    });

    if (!step) {
      throw new NotFoundException('Workflow step not found');
    }

    if (step.status !== StepStatus.ACTIVE) {
      throw new BadRequestException('Step is not active');
    }

    // Validate rejector
    const isAuthorized = await this.validateApprover(step, rejectorId);
    if (!isAuthorized) {
      throw new BadRequestException('User not authorized to reject this step');
    }

    // Update step status
    step.status = StepStatus.REJECTED;
    step.rejectedBy = rejectorId;
    step.rejectedAt = new Date();
    step.rejectionReason = reason;
    await this.workflowStepRepository.save(step);

    // Create action record
    await this.createActionRecord(step, ActionType.REJECTION, rejectorId, reason);

    // Execute on_reject actions
    await this.executeActions(step, 'on_reject', step.workflowInstance);

    // Update workflow instance status
    const instance = step.workflowInstance;
    instance.status = WorkflowStatus.REJECTED;
    instance.completedAt = new Date();
    await this.workflowInstanceRepository.save(instance);

    // Emit workflow rejected event
    this.eventEmitter.emit('workflow.rejected', {
      instanceId: instance.id,
      stepId: step.id,
      reason,
    });

    return step;
  }

  private async skipStep(
    step: WorkflowStep,
    instance: WorkflowInstance,
    reason: string,
  ): Promise<void> {
    step.status = StepStatus.SKIPPED;
    step.comments = reason;
    await this.workflowStepRepository.save(step);

    await this.moveToNextStep(instance, step);
  }

  private async moveToNextStep(
    instance: WorkflowInstance,
    currentStep: WorkflowStep,
  ): Promise<void> {
    // Execute on_exit actions
    await this.executeActions(currentStep, 'on_exit', instance);

    // Find next step
    const nextStep = await this.workflowStepRepository.findOne({
      where: {
        workflowInstanceId: instance.id,
        order: currentStep.order + 1,
      },
    });

    if (!nextStep) {
      // Workflow completed
      instance.status = WorkflowStatus.COMPLETED;
      instance.completedAt = new Date();
      await this.workflowInstanceRepository.save(instance);

      // Emit workflow completed event
      this.eventEmitter.emit('workflow.completed', {
        instanceId: instance.id,
        entityType: instance.entityType,
        entityId: instance.entityId,
      });

      return;
    }

    // Activate next step
    nextStep.status = StepStatus.ACTIVE;
    nextStep.startedAt = new Date();
    await this.workflowStepRepository.save(nextStep);

    // Update instance current step
    instance.currentStepOrder = nextStep.order;
    await this.workflowInstanceRepository.save(instance);

    // Execute next step
    await this.executeStep(nextStep, instance);
  }

  // Notification Management
  private async notifyApprovers(
    step: WorkflowStep,
    instance: WorkflowInstance,
  ): Promise<void> {
    const approvers = await this.getApprovers(step);

    for (const approver of approvers) {
      // In-app notification
      await this.notificationsService.create({
        userId: approver.id,
        title: 'Workflow Approval Required',
        message: `Please review and approve: ${step.name}`,
        type: 'workflow_approval',
        data: {
          workflowInstanceId: instance.id,
          stepId: step.id,
          entityType: instance.entityType,
          entityId: instance.entityId,
        },
      });

      // Email notification
      if (approver.email) {
        await this.emailService.sendEmail({
          to: approver.email,
          subject: 'Workflow Approval Required',
          template: 'workflow-approval',
          context: {
            approverName: approver.name,
            stepName: step.name,
            stepDescription: step.description,
            entityType: instance.entityType,
            entityId: instance.entityId,
            approvalLink: `${process.env.FRONTEND_URL}/workflows/${instance.id}/steps/${step.id}`,
          },
        });
      }

      // SMS notification if configured
      if (approver.phone && step.metadata?.sendSms) {
        await this.smsService.sendSms({
          to: approver.phone,
          message: `Workflow approval required: ${step.name}. Check your email for details.`,
        });
      }
    }
  }

  private async getApprovers(step: WorkflowStep): Promise<User[]> {
    const approverIds = [];

    // Direct approver IDs
    if (step.approverIds && step.approverIds.length > 0) {
      approverIds.push(...step.approverIds);
    }

    // Role-based approvers
    if (step.approverRole) {
      const roleApprovers = await this.userRepository.find({
        where: { role: step.approverRole as Role },
      });
      approverIds.push(...roleApprovers.map(u => u.id));
    }

    // Remove duplicates
    const uniqueApproverIds = [...new Set(approverIds)];

    return await this.userRepository.find({
      where: { id: In(uniqueApproverIds) },
    });
  }

  // Action Execution
  private async executeActions(
    step: WorkflowStep,
    trigger: string,
    instance: WorkflowInstance,
  ): Promise<void> {
    const actions = step.actions.filter(action => action.trigger === trigger);

    for (const action of actions) {
      try {
        switch (action.type) {
          case ActionType.EMAIL:
            await this.executeEmailAction(action.config, instance);
            break;
          case ActionType.SMS:
            await this.executeSmsAction(action.config, instance);
            break;
          case ActionType.WEBHOOK:
            await this.executeWebhookAction(action.config, instance);
            break;
          case ActionType.UPDATE_FIELD:
            await this.executeUpdateFieldAction(action.config, instance);
            break;
          case ActionType.CREATE_TASK:
            await this.executeCreateTaskAction(action.config, instance);
            break;
          case ActionType.CUSTOM:
            await this.executeCustomAction(action.config, instance);
            break;
        }
      } catch (error) {
        this.logger.error(`Failed to execute action: ${action.type}`, error);
      }
    }
  }

  private async executeEmailAction(
    config: any,
    instance: WorkflowInstance,
  ): Promise<void> {
    await this.emailService.sendEmail({
      to: config.to,
      cc: config.cc,
      subject: this.interpolateTemplate(config.subject, instance),
      template: config.template,
      context: {
        ...instance.context,
        workflowInstanceId: instance.id,
      },
    });
  }

  private async executeSmsAction(
    config: any,
    instance: WorkflowInstance,
  ): Promise<void> {
    await this.smsService.sendSms({
      to: config.to,
      message: this.interpolateTemplate(config.message, instance),
    });
  }

  private async executeWebhookAction(
    config: any,
    instance: WorkflowInstance,
  ): Promise<void> {
    // Implement webhook execution
    const payload = {
      workflowInstanceId: instance.id,
      entityType: instance.entityType,
      entityId: instance.entityId,
      context: instance.context,
      ...config.payload,
    };

    // Make HTTP request to webhook URL
    // await this.httpService.post(config.url, payload);
  }

  private async executeUpdateFieldAction(
    config: any,
    instance: WorkflowInstance,
  ): Promise<void> {
    // Emit event for field update
    this.eventEmitter.emit('workflow.update_field', {
      entityType: instance.entityType,
      entityId: instance.entityId,
      field: config.field,
      value: config.value,
    });
  }

  private async executeCreateTaskAction(
    config: any,
    instance: WorkflowInstance,
  ): Promise<void> {
    // Emit event for task creation
    this.eventEmitter.emit('workflow.create_task', {
      title: config.title,
      description: config.description,
      assigneeId: config.assigneeId,
      dueDate: config.dueDate,
      context: {
        workflowInstanceId: instance.id,
        entityType: instance.entityType,
        entityId: instance.entityId,
      },
    });
  }

  private async executeCustomAction(
    config: any,
    instance: WorkflowInstance,
  ): Promise<void> {
    // Emit custom event
    this.eventEmitter.emit(config.eventName, {
      workflowInstanceId: instance.id,
      entityType: instance.entityType,
      entityId: instance.entityId,
      ...config.eventData,
    });
  }

  // Helper Methods
  private async evaluateConditions(
    conditions: StepCondition[],
    instance: WorkflowInstance,
  ): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = this.getFieldValue(condition.field, instance);
      
      switch (condition.operator) {
        case 'eq':
          if (fieldValue !== condition.value) return false;
          break;
        case 'ne':
          if (fieldValue === condition.value) return false;
          break;
        case 'gt':
          if (fieldValue <= condition.value) return false;
          break;
        case 'lt':
          if (fieldValue >= condition.value) return false;
          break;
        case 'gte':
          if (fieldValue < condition.value) return false;
          break;
        case 'lte':
          if (fieldValue > condition.value) return false;
          break;
        case 'in':
          if (!condition.value.includes(fieldValue)) return false;
          break;
        case 'nin':
          if (condition.value.includes(fieldValue)) return false;
          break;
      }
    }

    return true;
  }

  private getFieldValue(field: string, instance: WorkflowInstance): any {
    // Navigate through nested fields using dot notation
    return field.split('.').reduce((obj, key) => obj?.[key], instance.context);
  }

  private interpolateTemplate(template: string, instance: WorkflowInstance): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.getFieldValue(key, instance) || match;
    });
  }

  private async validateApprover(step: WorkflowStep, userId: string): Promise<boolean> {
    // Check direct approver IDs
    if (step.approverIds?.includes(userId)) {
      return true;
    }

    // Check role-based approval
    if (step.approverRole) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      return user?.role === step.approverRole as Role;
    }

    return false;
  }

  private async createActionRecord(
    step: WorkflowStep,
    actionType: ActionType,
    userId: string,
    comments: string,
  ): Promise<WorkflowAction> {
    const action = this.workflowActionRepository.create({
      workflowStepId: step.id,
      type: actionType,
      executedBy: userId,
      executedAt: new Date(),
      status: ActionStatus.COMPLETED,
      config: {},
      result: {
        success: true,
        message: comments,
      },
    });

    return await this.workflowActionRepository.save(action);
  }

  private async handleStepTimeout(stepId: string): Promise<void> {
    const step = await this.workflowStepRepository.findOne({
      where: { id: stepId, status: StepStatus.ACTIVE },
      relations: ['workflowInstance'],
    });

    if (!step) return;

    // Check if escalation is configured
    if (step.escalationConfig) {
      const timeElapsed = (Date.now() - step.startedAt.getTime()) / (1000 * 60 * 60);
      
      if (timeElapsed >= step.escalationConfig.escalateAfterHours) {
        // Escalate to configured users/roles
        await this.escalateStep(step);
      }
    } else {
      // Auto-reject if no escalation configured
      await this.rejectStep(stepId, 'system', 'Step timeout exceeded');
    }
  }

  private async escalateStep(step: WorkflowStep): Promise<void> {
    // Update approvers
    if (step.escalationConfig.escalateToRole) {
      step.approverRole = step.escalationConfig.escalateToRole;
    }

    if (step.escalationConfig.escalateToUserIds) {
      step.approverIds = step.escalationConfig.escalateToUserIds;
    }

    step.metadata = {
      ...step.metadata,
      escalated: true,
      escalatedAt: new Date(),
    };

    await this.workflowStepRepository.save(step);

    // Notify new approvers
    await this.notifyApprovers(step, step.workflowInstance);

    // Emit escalation event
    this.eventEmitter.emit('workflow.escalated', {
      stepId: step.id,
      workflowInstanceId: step.workflowInstance.id,
    });
  }

  // Query Methods
  async getWorkflowInstance(instanceId: string): Promise<WorkflowInstance> {
    const instance = await this.workflowInstanceRepository.findOne({
      where: { id: instanceId },
      relations: ['steps', 'template'],
    });

    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }

    return instance;
  }

  async getWorkflowsByEntity(
    entityType: string,
    entityId: string,
  ): Promise<WorkflowInstance[]> {
    return await this.workflowInstanceRepository.find({
      where: { entityType, entityId },
      relations: ['steps', 'template'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingApprovals(userId: string): Promise<WorkflowStep[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.workflowStepRepository.find({
      where: [
        { approverIds: In([userId]), status: StepStatus.ACTIVE },
        { approverRole: user.role, status: StepStatus.ACTIVE },
      ],
      relations: ['workflowInstance'],
      order: { createdAt: 'ASC' },
    });
  }

  // Additional methods for controller compatibility
  async create(createWorkflowDto: any, userId: string): Promise<WorkflowTemplate> {
    return this.createTemplate({
      name: createWorkflowDto.name,
      description: createWorkflowDto.description,
      type: createWorkflowDto.type,
      entityType: createWorkflowDto.entityType,
      steps: createWorkflowDto.steps || [],
      metadata: createWorkflowDto.metadata,
    });
  }

  async findAll(filters: any): Promise<{ data: WorkflowInstance[]; total: number }> {
    const query = this.workflowInstanceRepository.createQueryBuilder('instance')
      .leftJoinAndSelect('instance.template', 'template')
      .leftJoinAndSelect('instance.steps', 'steps');

    if (filters.status) {
      query.andWhere('instance.status = :status', { status: filters.status });
    }

    if (filters.entityType) {
      query.andWhere('instance.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters.templateId) {
      query.andWhere('instance.templateId = :templateId', { templateId: filters.templateId });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async getTemplates(): Promise<WorkflowTemplate[]> {
    return await this.workflowTemplateRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<WorkflowInstance> {
    return this.getWorkflowInstance(id);
  }

  async getStages(id: string): Promise<WorkflowStep[]> {
    const instance = await this.getWorkflowInstance(id);
    return instance.steps || [];
  }

  async getHistory(id: string): Promise<WorkflowAction[]> {
    const steps = await this.workflowStepRepository.find({
      where: { workflowInstanceId: id },
      order: { order: 'ASC' },
    });

    const stepIds = steps.map(s => s.id);
    
    return await this.workflowActionRepository.find({
      where: { workflowStepId: In(stepIds) },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, updateDto: any, userId: string): Promise<WorkflowTemplate> {
    // For workflow instances, we don't update them directly
    // For templates, use updateTemplate
    const template = await this.workflowTemplateRepository.findOne({
      where: { id },
    });

    if (template) {
      return this.updateTemplate(id, updateDto);
    }

    throw new NotFoundException('Workflow not found');
  }

  async advance(id: string, advanceData: any, user: any): Promise<WorkflowInstance> {
    const instance = await this.getWorkflowInstance(id);
    const currentStep = instance.steps.find(s => s.order === instance.currentStepOrder);

    if (!currentStep || currentStep.status !== StepStatus.ACTIVE) {
      throw new BadRequestException('No active step to advance');
    }

    // Approve current step to advance
    await this.approveStep(
      currentStep.id,
      user.id,
      advanceData.comments || 'Advanced to next step',
      instance,
    );

    return this.getWorkflowInstance(id);
  }

  async revert(id: string, revertData: any, userId: string): Promise<WorkflowInstance> {
    const instance = await this.getWorkflowInstance(id);
    
    if (instance.currentStepOrder <= 1) {
      throw new BadRequestException('Cannot revert from first step');
    }

    // Find previous step
    const previousStep = instance.steps.find(
      s => s.order === instance.currentStepOrder - 1
    );

    if (!previousStep) {
      throw new BadRequestException('Previous step not found');
    }

    // Reset current step
    const currentStep = instance.steps.find(
      s => s.order === instance.currentStepOrder
    );
    if (currentStep) {
      currentStep.status = StepStatus.PENDING;
      await this.workflowStepRepository.save(currentStep);
    }

    // Activate previous step
    previousStep.status = StepStatus.ACTIVE;
    previousStep.approvedBy = null;
    previousStep.approvedAt = null;
    await this.workflowStepRepository.save(previousStep);

    // Update instance
    instance.currentStepOrder = previousStep.order;
    await this.workflowInstanceRepository.save(instance);

    return instance;
  }

  async approve(id: string, approvalData: any, userId: string): Promise<WorkflowInstance> {
    const instance = await this.getWorkflowInstance(id);
    const currentStep = instance.steps.find(s => s.order === instance.currentStepOrder);

    if (!currentStep) {
      throw new BadRequestException('No current step found');
    }

    await this.approveStep(
      currentStep.id,
      userId,
      approvalData.comments || 'Approved',
      instance,
    );

    return this.getWorkflowInstance(id);
  }

  async reject(id: string, rejectionData: any, userId: string): Promise<WorkflowInstance> {
    const instance = await this.getWorkflowInstance(id);
    const currentStep = instance.steps.find(s => s.order === instance.currentStepOrder);

    if (!currentStep) {
      throw new BadRequestException('No current step found');
    }

    await this.rejectStep(
      currentStep.id,
      userId,
      rejectionData.reason || 'Rejected',
    );

    return this.getWorkflowInstance(id);
  }

  async assign(id: string, assignData: any, userId: string): Promise<WorkflowInstance> {
    const instance = await this.getWorkflowInstance(id);
    const currentStep = instance.steps.find(s => s.order === instance.currentStepOrder);

    if (!currentStep) {
      throw new BadRequestException('No current step found');
    }

    // Update approver IDs
    currentStep.approverIds = assignData.userIds || [];
    currentStep.approverRole = assignData.role;
    await this.workflowStepRepository.save(currentStep);

    // Notify new approvers
    await this.notifyApprovers(currentStep, instance);

    return instance;
  }

  async escalate(id: string, escalationData: any, userId: string): Promise<WorkflowInstance> {
    const instance = await this.getWorkflowInstance(id);
    const currentStep = instance.steps.find(s => s.order === instance.currentStepOrder);

    if (!currentStep || currentStep.status !== StepStatus.ACTIVE) {
      throw new BadRequestException('No active step to escalate');
    }

    await this.escalateStep(currentStep);

    return this.getWorkflowInstance(id);
  }

  async remove(id: string): Promise<void> {
    const instance = await this.workflowInstanceRepository.findOne({
      where: { id },
    });

    if (instance) {
      if (instance.status === WorkflowStatus.ACTIVE) {
        throw new BadRequestException('Cannot delete active workflow');
      }
      await this.workflowInstanceRepository.remove(instance);
      return;
    }

    const template = await this.workflowTemplateRepository.findOne({
      where: { id },
    });

    if (template) {
      template.isActive = false;
      await this.workflowTemplateRepository.save(template);
      return;
    }

    throw new NotFoundException('Workflow not found');
  }
}
