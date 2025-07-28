export interface Tender {
  id: number;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  type: TenderType;
  status: TenderStatus;
  estimatedValue: number;
  currency: string;
  publishedDate: Date;
  deadline: Date;
  openingDate?: Date;
  department: string;
  location: string;
  eligibilityCriteria: string;
  scopeOfWork: string;
  termsAndConditions: string;
  emdAmount: number;
  emdExempted: boolean;
  tenderFee: number;
  createdBy: number;
  organizationId: number;
  organization?: any;
  bids?: any[];
  documents?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TenderType {
  OPEN = 'open',
  LIMITED = 'limited',
  SINGLE = 'single',
  EOI = 'eoi',
  RFQ = 'rfq',
  RFP = 'rfp',
}

export enum TenderStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  AWARDED = 'awarded',
}

export interface CreateTenderDto {
  title: string;
  description: string;
  category: string;
  type: TenderType;
  estimatedValue: number;
  currency: string;
  deadline: Date;
  openingDate?: Date;
  department: string;
  location: string;
  eligibilityCriteria: string;
  scopeOfWork: string;
  termsAndConditions: string;
  emdAmount: number;
  emdExempted: boolean;
  tenderFee: number;
}

export interface UpdateTenderDto extends Partial<CreateTenderDto> {
  status?: TenderStatus;
}

export interface TenderSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TenderStatus;
  category?: string;
  type?: TenderType;
  minValue?: number;
  maxValue?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  organizationId?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface TenderStatistics {
  totalBids: number;
  submittedBids: number;
  shortlistedBids: number;
  averageBidAmount: number;
  lowestBid: number;
  highestBid: number;
  participatingOrganizations: number;
}

export interface TenderDocument {
  id: number;
  tenderId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  uploadedBy: number;
  uploadedAt: Date;
  downloadUrl: string;
}

export interface TenderTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  template: Partial<CreateTenderDto>;
  createdAt: Date;
  updatedAt: Date;
}
