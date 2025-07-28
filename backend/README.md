# Tender Management System - Backend

## Overview
This is the backend API for the Tender Management System built with NestJS, TypeORM, and PostgreSQL.

## Features
- JWT Authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-step workflow automation
- Email and SMS notifications
- Payment processing
- Document management
- Vendor management
- Contract lifecycle management
- Real-time notifications
- Comprehensive reporting

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Redis (optional, for caching)

## Installation

### 1. Install Dependencies
```bash
# Run the dependency update script
node update-dependencies.js

# Then install all dependencies
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Make sure to update:
# - Database credentials
# - JWT secrets
# - Email SMTP settings
# - Twilio credentials (if using SMS)
```

### 3. Database Setup
```bash
# Create the database
createdb tender_management

# Run migrations (if using TypeORM CLI)
npm run typeorm migration:run

# Or let TypeORM auto-sync in development
# (synchronize: true in typeorm.config.ts)
```

### 4. Create Required Directories
```bash
mkdir -p uploads logs src/templates/email
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## API Documentation
When the application is running, visit:
- Swagger UI: http://localhost:3000/api-docs
- API Base URL: http://localhost:3000/api/v1

## Project Structure
```
backend/
├── src/
│   ├── common/             # Common utilities, guards, decorators
│   │   ├── decorators/
│   │   ├── enums/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── config/             # Configuration files
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication & authorization
│   │   ├── bids/           # Bid management
│   │   ├── contracts/      # Contract management
│   │   ├── email/          # Email service
│   │   ├── notifications/  # In-app notifications
│   │   ├── payments/       # Payment processing
│   │   ├── security/       # Security deposits, guarantees
│   │   ├── sms/            # SMS service
│   │   ├── tenders/        # Tender management
│   │   ├── vendors/        # Vendor management
│   │   └── workflow/       # Workflow automation
│   ├── templates/          # Email templates
│   │   └── email/
│   ├── types/              # TypeScript type definitions
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── test/                   # Test files
├── uploads/                # File uploads directory
├── logs/                   # Application logs
└── package.json
```

## Key Modules

### Authentication (`/auth`)
- User registration and login
- JWT token management
- Password reset functionality
- Email verification
- Role-based access control

### Tenders (`/tenders`)
- Create, update, delete tenders
- Publish/unpublish tenders
- Search and filter
- Document attachments
- Tender timelines

### Bids (`/bids`)
- Submit bids
- Bid evaluation
- Bid ranking
- Technical/Financial scoring
- Bid documents

### Vendors (`/vendors`)
- Vendor registration
- Profile management
- Performance tracking
- Document verification
- Category management

### Contracts (`/contracts`)
- Contract creation
- E-signatures
- Milestone tracking
- Amendment management
- Performance monitoring

### Payments (`/payments`)
- Payment processing
- Invoice generation
- EMD management
- Refund processing
- Transaction history

### Workflow (`/workflow`)
- Multi-step approvals
- Conditional routing
- Escalation management
- Email/SMS notifications
- Audit trails

## Security Features
- JWT authentication
- Refresh token rotation
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection
- File upload validation

## Environment Variables
See `.env.example` for all configuration options. Key variables include:
- `NODE_ENV` - Environment (development/production)
- `DB_*` - Database configuration
- `JWT_*` - JWT authentication settings
- `EMAIL_*` - SMTP email configuration
- `TWILIO_*` - SMS service configuration
- `AWS_*` - S3 storage configuration (optional)

## Testing
```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Migrations
```bash
# Generate a new migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in .env
- Verify database exists

### Email Not Sending
- Check SMTP credentials
- For Gmail, use App Password
- Ensure EMAIL_SECURE matches your SMTP port

### File Upload Issues
- Check upload directory permissions
- Verify MAX_FILE_SIZE in .env
- Ensure multer middleware is configured

## Contributing
1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License
Proprietary - All rights reserved
