export enum OrganizationType {
  GOVERNMENT = 'GOVERNMENT',
  PRIVATE = 'PRIVATE',
  PUBLIC_SECTOR = 'PUBLIC_SECTOR',
  NON_PROFIT = 'NON_PROFIT',
  INTERNATIONAL = 'INTERNATIONAL',
  MUNICIPAL = 'MUNICIPAL',
  STATE = 'STATE',
  FEDERAL = 'FEDERAL',
}

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  REJECTED = 'REJECTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum OrganizationSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE',
}

export interface OrganizationContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department?: string;
  isPrimary: boolean;
}

export interface OrganizationAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: 'HEADQUARTERS' | 'BRANCH' | 'BILLING' | 'SHIPPING';
  isPrimary: boolean;
}

export interface OrganizationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
  expiryDate?: string;
  isVerified: boolean;
}

export interface OrganizationFinancials {
  annualRevenue?: number;
  currency: string;
  fiscalYearEnd: string;
  creditRating?: string;
  bankReferences: string[];
}

export interface OrganizationCertification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber: string;
  documentUrl?: string;
  isVerified: boolean;
}

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  type: OrganizationType;
  status: OrganizationStatus;
  size: OrganizationSize;
  
  // Registration details
  registrationNumber: string;
  taxId: string;
  vatNumber?: string;
  incorporationDate: string;
  incorporationCountry: string;
  
  // Contact information
  website?: string;
  email: string;
  phone: string;
  fax?: string;
  
  // Address information
  addresses: OrganizationAddress[];
  
  // Contact persons
  contacts: OrganizationContact[];
  
  // Business details
  industry: string;
  subIndustry?: string;
  description: string;
  businessActivities: string[];
  
  // Financial information
  financials?: OrganizationFinancials;
  
  // Documents
  documents: OrganizationDocument[];
  
  // Certifications
  certifications: OrganizationCertification[];
  
  // Compliance
  isCompliant: boolean;
  complianceNotes?: string;
  lastComplianceCheck?: string;
  
  // Verification
  isVerified: boolean;
  verificationDate?: string;
  verifiedBy?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Relations
  parentOrganization?: {
    id: string;
    name: string;
  };
  
  subsidiaries?: {
    id: string;
    name: string;
  }[];
  
  // Statistics
  totalTenders?: number;
  totalBids?: number;
  totalContracts?: number;
  successRate?: number;
}

export interface CreateOrganizationRequest {
  name: string;
  legalName: string;
  type: OrganizationType;
  size: OrganizationSize;
  registrationNumber: string;
  taxId: string;
  vatNumber?: string;
  incorporationDate: string;
  incorporationCountry: string;
  website?: string;
  email: string;
  phone: string;
  industry: string;
  subIndustry?: string;
  description: string;
  businessActivities: string[];
  addresses: Omit<OrganizationAddress, 'id'>[];
  contacts: Omit<OrganizationContact, 'id'>[];
  parentOrganizationId?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  legalName?: string;
  type?: OrganizationType;
  size?: OrganizationSize;
  website?: string;
  email?: string;
  phone?: string;
  fax?: string;
  industry?: string;
  subIndustry?: string;
  description?: string;
  businessActivities?: string[];
  status?: OrganizationStatus;
}

export interface OrganizationFilters {
  type?: OrganizationType[];
  status?: OrganizationStatus[];
  size?: OrganizationSize[];
  industry?: string[];
  country?: string[];
  isVerified?: boolean;
  isCompliant?: boolean;
  createdFrom?: string;
  createdTo?: string;
  search?: string;
}

export interface OrganizationSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'totalTenders' | 'successRate';
  direction: 'asc' | 'desc';
}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form interfaces for UI
export interface OrganizationFormData {
  basicInfo: {
    name: string;
    legalName: string;
    type: OrganizationType;
    size: OrganizationSize;
    registrationNumber: string;
    taxId: string;
    vatNumber?: string;
    incorporationDate: string;
    incorporationCountry: string;
  };
  contactInfo: {
    website?: string;
    email: string;
    phone: string;
    fax?: string;
  };
  businessInfo: {
    industry: string;
    subIndustry?: string;
    description: string;
    businessActivities: string[];
  };
  addresses: OrganizationAddress[];
  contacts: OrganizationContact[];
  documents: File[];
  parentOrganizationId?: string;
}

export interface OrganizationStepData {
  basicInfo: OrganizationFormData['basicInfo'];
  contactInfo: OrganizationFormData['contactInfo'];
  businessInfo: OrganizationFormData['businessInfo'];
  addresses: OrganizationAddress[];
  contacts: OrganizationContact[];
  documents: OrganizationDocument[];
}

// Validation interfaces
export interface OrganizationValidation {
  isValid: boolean;
  errors: {
    [key: string]: string[];
  };
}

// Statistics interfaces
export interface OrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
  verifiedOrganizations: number;
  organizationsByType: {
    [key in OrganizationType]: number;
  };
  organizationsByStatus: {
    [key in OrganizationStatus]: number;
  };
  organizationsBySize: {
    [key in OrganizationSize]: number;
  };
  topIndustries: {
    industry: string;
    count: number;
  }[];
}
