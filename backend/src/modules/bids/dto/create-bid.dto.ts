import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsArray,
  IsObject,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class CreateBidDto {
  @IsUUID()
  @IsNotEmpty()
  tenderId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  quotedAmount: number;

  @IsString()
  @IsNotEmpty()
  deliveryPeriod: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(365)
  validityPeriod: number; // in days

  @IsString()
  @IsOptional()
  technicalProposal?: string;

  @IsString()
  @IsOptional()
  financialProposal?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deviations?: string[];

  @IsObject()
  @IsOptional()
  technicalDetails?: {
    specifications?: Record<string, any>;
    methodology?: string;
    workPlan?: string;
    teamComposition?: Array<{
      name: string;
      role: string;
      experience: string;
    }>;
  };

  @IsObject()
  @IsOptional()
  financialDetails?: {
    priceBreakdown?: Array<{
      item: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    paymentTerms?: string;
    currency?: string;
    taxes?: {
      gst?: number;
      otherTaxes?: number;
    };
  };

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  warranty?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankBranch?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  ifscCode?: string;

  @IsObject()
  @IsOptional()
  additionalInfo?: Record<string, any>;
}