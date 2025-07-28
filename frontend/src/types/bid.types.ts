export enum BidStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED',
}

export enum BidType {
  TECHNICAL = 'TECHNICAL',
  FINANCIAL = 'FINANCIAL',
  TECHNICAL_FINANCIAL = 'TECHNICAL_FINANCIAL',
}

export interface BidDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface BidItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
}

export interface TechnicalProposal {
  methodology: string;
  timeline: string;
  teamComposition: string;
  experience: string;
  qualifications: string;
}

export interface FinancialProposal {
  totalAmount: number;
  currency: string;
  breakdown: BidItem[];
  paymentTerms: string;
  validityPeriod: number;
}

export interface Bid {
  id: string;
  tenderId: string;
  vendorId: string;
  title: string;
  description: string;
  status: BidStatus;
  type: BidType;
  submittedAt?: string;
  validUntil: string;
  
  // Technical details
  technicalProposal?: TechnicalProposal;
  
  // Financial details
  financialProposal?: FinancialProposal;
  
  // Documents
  documents: BidDocument[];
  
  // Evaluation
  technicalScore?: number;
  financialScore?: number;
  totalScore?: number;
  evaluationComments?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Relations
  tender?: {
    id: string;
    title: string;
    referenceNumber: string;
    closingDate: string;
  };
  
  vendor?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface CreateBidRequest {
  tenderId: string;
  title: string;
  description: string;
  type: BidType;
  validUntil: string;
  technicalProposal?: Partial<TechnicalProposal>;
  financialProposal?: Partial<FinancialProposal>;
}

export interface UpdateBidRequest {
  title?: string;
  description?: string;
  validUntil?: string;
  technicalProposal?: Partial<TechnicalProposal>;
  financialProposal?: Partial<FinancialProposal>;
}

export interface BidEvaluation {
  bidId: string;
  technicalScore: number;
  financialScore: number;
  totalScore: number;
  comments: string;
  evaluatedBy: string;
  evaluatedAt: string;
}

export interface BidFilters {
  status?: BidStatus[];
  type?: BidType[];
  tenderId?: string;
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface BidSortOptions {
  field: 'submittedAt' | 'validUntil' | 'totalScore' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface BidListResponse {
  bids: Bid[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form interfaces for UI
export interface BidFormData {
  title: string;
  description: string;
  type: BidType;
  validUntil: string;
  technicalProposal: TechnicalProposal;
  financialProposal: FinancialProposal;
  documents: File[];
}

export interface BidStepData {
  basicInfo: {
    title: string;
    description: string;
    type: BidType;
    validUntil: string;
  };
  technicalProposal: TechnicalProposal;
  financialProposal: FinancialProposal;
  documents: BidDocument[];
}
