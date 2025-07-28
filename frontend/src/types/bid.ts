export interface Bid {
  id: number;
  bidNumber: string;
  tenderId: number;
  tender?: any;
  bidderId: number;
  bidder?: any;
  organizationId: number;
  organization?: any;
  amount: number;
  currency: string;
  validityPeriod: number;
  technicalProposal: string;
  financialProposal: string;
  deliveryTime: string;
  paymentTerms: string;
  warranties: string;
  status: BidStatus;
  submittedAt?: Date;
  evaluationScore?: number;
  evaluationComments?: string;
  rejectionReason?: string;
  emdDetails?: EMDDetails;
  documents?: BidDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export enum BidStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  AWARDED = 'awarded',
  WITHDRAWN = 'withdrawn',
}

export interface EMDDetails {
  amount: number;
  paymentMethod: 'bank_guarantee' | 'demand_draft' | 'online_payment';
  referenceNumber: string;
  bankName?: string;
  validityDate: Date;
  verified: boolean;
}

export interface CreateBidDto {
  tenderId: number;
  amount: number;
  currency: string;
  validityPeriod: number;
  technicalProposal: string;
  financialProposal: string;
  deliveryTime: string;
  paymentTerms: string;
  warranties: string;
  emdDetails?: EMDDetails;
}

export interface UpdateBidDto extends Partial<CreateBidDto> {}

export interface BidSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BidStatus;
  tenderId?: number;
  organizationId?: number;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BidDocument {
  id: number;
  bidId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  uploadedBy: number;
  uploadedAt: Date;
  downloadUrl: string;
}

export interface BidEvaluation {
  technicalScore: number;
  financialScore: number;
  totalScore: number;
  technicalComments: string;
  financialComments: string;
  recommendation: 'shortlist' | 'reject' | 'award';
  evaluatedBy: number;
  evaluatedAt: Date;
}

export interface BidHistory {
  id: number;
  bidId: number;
  action: string;
  description: string;
  performedBy: number;
  performedAt: Date;
  oldStatus?: BidStatus;
  newStatus?: BidStatus;
}
