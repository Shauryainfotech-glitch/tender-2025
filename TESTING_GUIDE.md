# Tender Management System - Testing Guide

## Pre-Testing Setup

### 1. Backend Setup
```bash
cd backend
node update-dependencies.js
npm install
cp .env.example .env
# Edit .env with your configuration
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb tender_management

# Start backend (will auto-create tables)
cd backend
npm run start:dev
```

## API Testing Checklist

### 1. Authentication Module (/api/v1/auth)
- [ ] **POST /register** - Register new user
  ```json
  {
    "email": "test@example.com",
    "password": "Test@123",
    "name": "Test User",
    "role": "BUYER",
    "organizationName": "Test Corp"
  }
  ```
- [ ] **POST /login** - User login
- [ ] **POST /refresh** - Refresh JWT token
- [ ] **POST /logout** - Logout user
- [ ] **POST /forgot-password** - Request password reset
- [ ] **POST /reset-password** - Reset password with token
- [ ] **POST /verify-email** - Verify email address
- [ ] **GET /profile** - Get user profile
- [ ] **PUT /profile** - Update user profile
- [ ] **POST /change-password** - Change password

### 2. Tenders Module (/api/v1/tenders)
- [ ] **POST /** - Create tender (BUYER/ADMIN only)
- [ ] **GET /** - List all tenders with filters
- [ ] **GET /:id** - Get tender details
- [ ] **PUT /:id** - Update tender
- [ ] **DELETE /:id** - Delete tender
- [ ] **POST /:id/publish** - Publish tender
- [ ] **POST /:id/documents** - Upload documents
- [ ] **GET /:id/documents** - List documents
- [ ] **GET /:id/bids** - Get tender bids

### 3. Bids Module (/api/v1/bids)
- [ ] **POST /** - Submit bid (VENDOR only)
- [ ] **GET /** - List bids
- [ ] **GET /:id** - Get bid details
- [ ] **PUT /:id** - Update bid
- [ ] **DELETE /:id** - Withdraw bid
- [ ] **POST /:id/documents** - Upload bid documents
- [ ] **GET /:id/ranking** - Get bid ranking
- [ ] **POST /:id/evaluate** - Evaluate bid (BUYER only)

### 4. Vendors Module (/api/v1/vendors)
- [ ] **POST /** - Create vendor profile
- [ ] **GET /** - List vendors
- [ ] **GET /:id** - Get vendor details
- [ ] **PUT /:id** - Update vendor profile
- [ ] **POST /:id/verify** - Verify vendor (ADMIN only)
- [ ] **GET /:id/performance** - Get performance metrics
- [ ] **GET /:id/documents** - List vendor documents
- [ ] **GET /categories** - Get vendor categories
- [ ] **GET /search** - Search vendors

### 5. Contracts Module (/api/v1/contracts)
- [ ] **POST /** - Create contract
- [ ] **GET /** - List contracts
- [ ] **GET /:id** - Get contract details
- [ ] **PUT /:id** - Update contract
- [ ] **POST /:id/sign** - Sign contract
- [ ] **POST /:id/approve** - Approve contract
- [ ] **POST /:id/reject** - Reject contract
- [ ] **GET /:id/milestones** - Get milestones
- [ ] **POST /:id/amendments** - Create amendment
- [ ] **GET /templates** - Get contract templates

### 6. Payments Module (/api/v1/payments)
- [ ] **POST /** - Create payment
- [ ] **GET /** - List payments
- [ ] **GET /:id** - Get payment details
- [ ] **POST /:id/process** - Process payment
- [ ] **POST /:id/refund** - Refund payment
- [ ] **GET /:id/receipt** - Download receipt
- [ ] **GET /invoices** - List invoices
- [ ] **GET /transactions** - List transactions

### 7. Security Module (/api/v1/security)
- [ ] **POST /deposits** - Create security deposit
- [ ] **GET /deposits** - List deposits
- [ ] **POST /deposits/:id/refund** - Refund deposit
- [ ] **POST /insurance** - Create insurance policy
- [ ] **GET /insurance** - List policies
- [ ] **POST /guarantees** - Create bank guarantee
- [ ] **GET /guarantees** - List guarantees

### 8. Workflow Module (/api/v1/workflow)
- [ ] **POST /** - Create workflow
- [ ] **GET /** - List workflows
- [ ] **GET /:id** - Get workflow details
- [ ] **POST /:id/approve** - Approve step
- [ ] **POST /:id/reject** - Reject step
- [ ] **GET /:id/history** - Get workflow history
- [ ] **POST /:id/escalate** - Escalate workflow
- [ ] **GET /templates** - Get workflow templates

### 9. Notifications Module (/api/v1/notifications)
- [ ] **GET /** - List notifications
- [ ] **GET /:id** - Get notification details
- [ ] **PUT /:id/read** - Mark as read
- [ ] **PUT /read-all** - Mark all as read
- [ ] **DELETE /:id** - Delete notification
- [ ] **GET /unread-count** - Get unread count

## Frontend Testing Checklist

### 1. Authentication Pages
- [ ] **Login Page** - Test login with valid/invalid credentials
- [ ] **Register Page** - Test registration with all roles
- [ ] **Forgot Password** - Test email submission
- [ ] **Reset Password** - Test password reset with token
- [ ] **Email Verification** - Test email verification flow

### 2. User Pages
- [ ] **Profile Page** - Test all tabs (Personal, Security, Notifications)
- [ ] **Settings Page** - Test theme switching, language selection
- [ ] **Dashboard** - Verify role-based dashboard content

### 3. Tender Management
- [ ] **Tender List** - Test filters, search, pagination
- [ ] **Create Tender** - Test form validation, document upload
- [ ] **Tender Details** - Test all information displays correctly
- [ ] **Edit Tender** - Test update functionality
- [ ] **Publish Tender** - Test publishing workflow

### 4. Bid Management
- [ ] **Submit Bid** - Test bid submission with documents
- [ ] **Bid List** - Test filtering by status
- [ ] **Bid Details** - Verify all information displays
- [ ] **Bid Evaluation** - Test scoring and ranking

### 5. Vendor Management
- [ ] **Vendor Registration** - Test profile creation
- [ ] **Vendor List** - Test search and filters
- [ ] **Vendor Profile** - Test document upload
- [ ] **Performance Metrics** - Verify charts and data

### 6. Contract Management
- [ ] **Contract Creation** - Test from bid acceptance
- [ ] **Contract List** - Test status filters
- [ ] **E-Signature** - Test signing process
- [ ] **Milestones** - Test milestone tracking

### 7. Payment Processing
- [ ] **Payment List** - Test transaction history
- [ ] **Process Payment** - Test payment flow
- [ ] **Invoice Generation** - Test PDF download
- [ ] **Refund Process** - Test refund workflow

### 8. Workflow Testing
- [ ] **Approval Queue** - Test pending approvals
- [ ] **Workflow History** - Verify audit trail
- [ ] **Escalation** - Test timeout and escalation

### 9. Notifications
- [ ] **Notification Center** - Test real-time updates
- [ ] **Email Notifications** - Verify email delivery
- [ ] **SMS Notifications** - Test SMS delivery (if enabled)

## Integration Testing

### 1. End-to-End Flows
- [ ] **Complete Tender Cycle**
  1. Create and publish tender (BUYER)
  2. Submit bid (VENDOR)
  3. Evaluate bids (BUYER)
  4. Award contract
  5. Process payment

- [ ] **Workflow Approval Flow**
  1. Create item requiring approval
  2. Send notification to approver
  3. Approve/reject with comments
  4. Verify status updates

### 2. Role-Based Access Testing
- [ ] **ADMIN** - Verify full system access
- [ ] **BUYER** - Test tender creation, bid evaluation
- [ ] **VENDOR** - Test bid submission, profile management
- [ ] **AUDITOR** - Test read-only access to all modules

### 3. Security Testing
- [ ] **Authentication** - Test JWT expiry, refresh token
- [ ] **Authorization** - Verify role-based restrictions
- [ ] **Input Validation** - Test XSS, SQL injection prevention
- [ ] **File Upload** - Test file type/size restrictions

## Performance Testing

### 1. Load Testing
- [ ] Test with 100 concurrent users
- [ ] Test tender list with 1000+ records
- [ ] Test file upload with large files (up to 10MB)

### 2. API Response Times
- [ ] All GET requests < 200ms
- [ ] POST/PUT requests < 500ms
- [ ] File uploads < 5 seconds

## Error Handling

### 1. Backend Errors
- [ ] Invalid input returns 400 with clear message
- [ ] Unauthorized access returns 401
- [ ] Forbidden actions return 403
- [ ] Not found resources return 404
- [ ] Server errors return 500 with generic message

### 2. Frontend Errors
- [ ] Network errors show retry option
- [ ] Form validation shows inline errors
- [ ] API errors display user-friendly messages
- [ ] Loading states for all async operations

## Deployment Testing

### 1. Environment Variables
- [ ] All required env variables documented
- [ ] Sensitive data not exposed in logs
- [ ] Different configs for dev/staging/prod

### 2. Database
- [ ] Migrations run successfully
- [ ] Indexes created for performance
- [ ] Backup and restore procedures work

### 3. External Services
- [ ] Email service connected and working
- [ ] SMS service connected (if enabled)
- [ ] File storage configured
- [ ] Payment gateway integrated

## Accessibility Testing

- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG standards
- [ ] Forms have proper labels
- [ ] Error messages are descriptive

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

## Documentation Verification

- [ ] API documentation matches implementation
- [ ] README has accurate setup instructions
- [ ] Environment variables documented
- [ ] Deployment guide is complete

## Sign-off Checklist

- [ ] All critical paths tested
- [ ] No console errors in browser
- [ ] No unhandled promise rejections
- [ ] API returns consistent response format
- [ ] Proper error messages for all edge cases
- [ ] Performance meets requirements
- [ ] Security best practices followed
- [ ] Code review completed
- [ ] Documentation updated