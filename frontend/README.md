# Tender Management System - Frontend

A comprehensive React-based frontend application for managing tenders, documents, and vendor relationships with advanced authentication and authorization features.

## 🚀 Features

### Authentication & Authorization
- **Multi-Factor Authentication (MFA)**
  - TOTP (Authenticator apps)
  - SMS verification
  - Email verification
  - Backup codes
- **Single Sign-On (SSO)**
  - SAML 2.0 support
  - OAuth 2.0 / OIDC support
  - Multiple provider management
- **Session Management**
  - Active session monitoring
  - Session termination
  - Device tracking
  - Location tracking
- **Password Policies**
  - Configurable complexity requirements
  - Password history tracking
  - Expiration management
  - Strength estimation
- **Account Lockout Policies**
  - Failed attempt tracking
  - Automatic lockout
  - Manual unlock capabilities

### Document Management
- **Version Control**
  - Full version history
  - Version comparison
  - Restore previous versions
  - Version comments and tags
- **Document Preview**
  - PDF viewer with search
  - Image viewer with zoom/rotate
  - Office file preview
  - Text file viewer
- **Bulk Operations**
  - Drag-and-drop upload
  - Progress tracking
  - Pause/resume uploads
  - Bulk download as ZIP
- **Document Templates**
  - Template creation and management
  - Variable substitution
  - Template categories and tags
  - Usage tracking
- **OCR Integration**
  - Optical Character Recognition for scanned documents
  - Multi-language support
  - Image enhancement and preprocessing
  - Confidence scoring
  - Export to multiple formats

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── MFASetup.tsx
│   │   │   ├── MFAVerification.tsx
│   │   │   ├── SSOConfiguration.tsx
│   │   │   ├── SessionManagement.tsx
│   │   │   ├── PasswordPolicies.tsx
│   │   │   └── AccountLockoutPolicies.tsx
│   │   └── documents/
│   │       ├── DocumentVersionControl.tsx
│   │       ├── DocumentPreview.tsx
│   │       ├── BulkDocumentManager.tsx
│   │       ├── DocumentTemplates.tsx
│   │       └── OCRDocumentScanner.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   └── documentService.ts
│   ├── utils/
│   │   └── fileUtils.ts
│   └── config/
│       └── api.ts
└── README.md
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tender-management/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

4. Start the development server:
```bash
npm start
```

## 📋 Components Documentation

### Authentication Components

#### MFASetup
Multi-factor authentication setup wizard supporting:
- QR code generation for authenticator apps
- SMS phone number verification
- Email verification setup
- Backup code generation and management

#### MFAVerification
Login-time MFA verification supporting:
- 6-digit code entry
- Backup code usage
- Code resend functionality
- Multi-attempt tracking

#### SSOConfiguration
SSO provider management interface for:
- SAML configuration (Entity ID, SSO URL, Certificate)
- OAuth/OIDC setup (Client ID/Secret, URLs)
- Provider testing
- Enable/disable functionality

#### SessionManagement
Active session monitoring dashboard with:
- Paginated session list
- Device and location information
- Session termination controls
- User blocking capabilities

#### PasswordPolicies
Password policy configuration including:
- Length and complexity requirements
- Common password prevention
- Password history settings
- Expiration management

#### AccountLockoutPolicies
Account security settings for:
- Failed login attempt thresholds
- Lockout duration configuration
- Observation window settings
- Alert configuration

### Document Management Components

#### DocumentVersionControl
Comprehensive version management with:
- Version timeline visualization
- Upload new versions
- Download/restore versions
- Version comparison
- Document locking

#### DocumentPreview
Universal document viewer supporting:
- PDF with navigation and search
- Images with zoom/rotate
- Office files via iframe
- Text files with syntax highlighting

#### BulkDocumentManager
Bulk file operations interface with:
- Drag-and-drop upload area
- Progress tracking per file
- Pause/resume/cancel uploads
- Bulk download as ZIP
- Image compression options

#### DocumentTemplates
Template management system featuring:
- Template creation/editing
- Variable definition (text, number, date, select, boolean)
- Template categorization and tagging
- Usage statistics
- Favorite templates

#### OCRDocumentScanner
OCR processing interface with:
- Drag-and-drop file upload for images and PDFs
- Real-time OCR processing with progress tracking
- Multi-language support (English, Spanish, French, German, Chinese, Japanese, Arabic)
- Image enhancement options (auto-rotate, deskew, noise removal)
- Text extraction with confidence scoring
- Search and highlight text in original document
- Edit extracted text before export
- Export to multiple formats (TXT, PDF, DOCX, JSON)
- Detailed analysis view with statistics and confidence metrics
- Batch OCR processing support

## 🔌 API Integration

### Authentication Service (`authService.ts`)
Handles all authentication-related API calls:
- Login/logout
- MFA setup and verification
- SSO provider management
- Session management
- Password and lockout policies

### Document Service (`documentService.ts`)
Manages document-related operations:
- Version control operations
- Document preview URLs
- Bulk upload/download
- Template management
- Search and filtering
- OCR processing and text extraction
- OCR export to multiple formats
- Batch OCR operations

### API Configuration (`config/api.ts`)
Central configuration for:
- API base URL
- Endpoint definitions
- Request timeouts
- File upload limits
- Pagination defaults

## 🎨 UI/UX Features

- **Material-UI Components**: Consistent design language
- **Responsive Design**: Mobile and desktop friendly
- **Real-time Updates**: Auto-refresh for dynamic content
- **Error Handling**: User-friendly error messages
- **Loading States**: Progress indicators for async operations
- **Accessibility**: ARIA labels and keyboard navigation

## 🔒 Security Features

- **Token-based Authentication**: JWT storage and management
- **Secure File Handling**: Client-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token validation
- **Session Timeout**: Automatic logout on inactivity

## 🚧 Development Guidelines

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Consistent naming conventions
- Comprehensive error handling

### State Management
- Local component state for UI
- Service layer for API calls
- Error and success feedback
- Loading state management

### Performance
- Lazy loading for large components
- Memoization for expensive operations
- Debounced search inputs
- Virtualized lists for large datasets

## 📝 Environment Variables

```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_SESSION_TIMEOUT=1800000
REACT_APP_REFRESH_INTERVAL=300000
REACT_APP_MAX_FILE_SIZE=52428800
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with authentication and document management features
  - Multi-factor authentication
  - SSO integration
  - Document version control
  - Bulk operations
  - Template management
  - OCR integration for scanned documents
