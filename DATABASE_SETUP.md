# Database Setup Guide for Tender Management System

## Overview
This guide provides step-by-step instructions for setting up the PostgreSQL database for the Tender Management System using NeonDB.

## Files Created

1. **`database-schema.sql`** - Complete database schema with all tables, indexes, and constraints
2. **`seed-data.sql`** - Initial seed data for testing and development
3. **`src/modules/payments/entities/payment.entity.ts`** - Payment entity for handling financial transactions
4. **`src/modules/workflow/entities/workflow.entity.ts`** - Workflow entity for approval processes
5. **`src/migrations/1706250000000-InitialSchema.ts`** - TypeORM migration file

## Database Setup Steps

### 1. Using Raw SQL Files (Recommended for Production)

```bash
# Connect to your NeonDB instance and run the schema
psql -h <your-neon-host> -U <your-username> -d <your-database> -f database-schema.sql

# Load seed data (optional, for development/testing)
psql -h <your-neon-host> -U <your-username> -d <your-database> -f seed-data.sql
```

### 2. Using TypeORM Migrations

```bash
# Install dependencies first
npm install

# Run migrations
npm run typeorm migration:run

# Or if you have a custom script
npm run migrate:up
```

### 3. Using TypeORM Synchronization (Development Only)

The application is configured with `synchronize: true` in development mode, which will automatically create/update tables based on entity definitions.

```typescript
// In your database.config.ts
export const databaseConfig = {
  // ... other config
  synchronize: process.env.NODE_ENV === 'development', // Only in development!
};
```

## Database Schema Overview

### Core Tables
- **organizations** - Company/organization information
- **users** - User accounts with role-based access
- **tenders** - Tender/RFP management
- **bids** - Bid submissions and evaluations
- **vendors** - Vendor profiles and verification

### Financial Tables
- **payments** - Payment transactions and processing
- **emds** - Earnest Money Deposits
- **contracts** - Contract lifecycle management
- **bank_guarantees** - Bank guarantee tracking

### System Tables
- **workflows** - Approval workflow definitions
- **workflow_instances** - Active workflow instances
- **notifications** - User notifications
- **audit_logs** - Comprehensive audit trail
- **custom_fields** - Dynamic field management

### AI/Analytics Tables
- **knowledge_bases** - AI training data
- **analytics_metrics** - Performance metrics
- **processing_templates** - Document processing

## Entity Relationships

```
Organizations
  ├── Users
  ├── Vendors
  └── Tenders
       ├── Bids
       ├── Documents
       └── EMDs

Workflows
  └── Workflow Instances
       └── Step Instances

Payments
  ├── Organizations
  ├── Tenders
  └── Contracts
```

## Default Seed Data

The seed data includes:

### Organizations
- Ministry of Infrastructure (Government)
- TechBuild Solutions Pvt Ltd (Vendor)
- Global Constructions Ltd (Vendor)
- Smart Infrastructure Corp (Pending Verification)

### Users (Password: `Password123!`)
- **admin@infrastructure.gov** - Super Admin
- **manager@infrastructure.gov** - Procurement Manager
- **vendor1@techbuild.com** - Vendor User
- **vendor2@globalconstructions.com** - Vendor User
- **auditor@infrastructure.gov** - Auditor

### Sample Tenders
- Construction of Highway Bridge
- IT Infrastructure Upgrade
- Annual Maintenance Contract

### Workflow Templates
- Standard Tender Approval
- Vendor Verification Process
- Payment Approval Workflow

## Environment Variables

Ensure these are set in your `.env` file:

```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
DATABASE_SSL=true
NODE_ENV=development
```

## Troubleshooting

### Common Issues

1. **ENUM type already exists**
   ```sql
   -- Drop all enum types before recreating
   DROP TYPE IF EXISTS user_role CASCADE;
   ```

2. **Foreign key constraint errors**
   ```sql
   -- Disable foreign key checks temporarily
   SET CONSTRAINTS ALL DEFERRED;
   ```

3. **TypeORM sync issues**
   - Clear the database and let TypeORM recreate
   - Or disable sync and use migrations

### Verification Queries

```sql
-- Check all tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check user count
SELECT COUNT(*) FROM users;

-- Check tender count
SELECT COUNT(*) FROM tenders;

-- Verify enum types
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;
```

## Next Steps

1. **Configure TypeORM**: Update `ormconfig.json` or environment variables
2. **Run Application**: Start the NestJS application
3. **Test APIs**: Use the provided seed data to test functionality
4. **Set up Backups**: Configure regular database backups in Neon

## Security Considerations

1. **Production Settings**:
   - Set `synchronize: false` in production
   - Use migrations for schema changes
   - Enable SSL for database connections

2. **Access Control**:
   - Create separate database users with limited permissions
   - Use connection pooling
   - Enable query logging for audit

3. **Data Protection**:
   - Enable encryption at rest in Neon
   - Implement field-level encryption for sensitive data
   - Regular security audits

## Maintenance

### Regular Tasks
- Monitor database performance
- Analyze slow queries
- Update statistics: `ANALYZE;`
- Vacuum regularly: `VACUUM ANALYZE;`

### Backup Strategy
```bash
# Backup database
pg_dump -h <host> -U <user> -d <database> -f backup_$(date +%Y%m%d).sql

# Restore database
psql -h <host> -U <user> -d <database> -f backup_20240126.sql
```

## Support

For issues or questions:
1. Check Neon documentation: https://neon.tech/docs
2. Review TypeORM documentation: https://typeorm.io
3. Check application logs for detailed error messages
