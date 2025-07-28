export interface Organization {
  id: number;
  name: string;
  type: OrganizationType;
  registrationNumber: string;
  taxId: string;
  description: string;
  website?: string;
  email: string;
  phoneNumber: string;
  faxNumber?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verificationDocuments?: string[];
  status: OrganizationStatus;
  logo?: string;
  users?: any[];
  tenders?: any[];
  bids?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export enum OrganizationType {
  GOVERNMENT = 'government',
  PRIVATE = 'private',
  NGO = 'ngo',
  INDIVIDUAL = 'individual',
  PARTNERSHIP = 'partnership',
  CORPORATION = 'corporation',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
}

export interface CreateOrganizationDto {
  name: string;
  type: OrganizationType;
  registrationNumber: string;
  taxId: string;
  description: string;
  website?: string;
  email: string;
  phoneNumber: string;
  faxNumber?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {
  status?: OrganizationStatus;
}

export interface OrganizationSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: OrganizationType;
  status?: OrganizationStatus;
  isVerified?: boolean;
  city?: string;
  state?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface OrganizationStatistics {
  totalTenders: number;
  activeTenders: number;
  totalBids: number;
  wonBids: number;
  totalValue: number;
  successRate: number;
  totalUsers: number;
  activeUsers: number;
}

export interface OrganizationDocument {
  id: number;
  organizationId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: OrganizationDocumentType;
  uploadedBy: number;
  uploadedAt: Date;
  downloadUrl: string;
  verified: boolean;
  verifiedBy?: number;
  verifiedAt?: Date;
}

export enum OrganizationDocumentType {
  REGISTRATION_CERTIFICATE = 'registration_certificate',
  TAX_CERTIFICATE = 'tax_certificate',
  BANK_STATEMENT = 'bank_statement',
  FINANCIAL_REPORT = 'financial_report',
  ISO_CERTIFICATE = 'iso_certificate',
  OTHER = 'other',
}

export interface OrganizationInvite {
  id: number;
  organizationId: number;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}
