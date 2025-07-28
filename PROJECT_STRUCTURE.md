# AVGC Tender Management Platform - Project Structure

## Overview
This document outlines the complete folder structure and file organization for the AVGC Tender Management Platform, following NestJS best practices and enterprise-level project organization.

## Root Directory Structure

```
TENDER MANAGEMENT/
├── src/                           # Main application source code
├── frontend/                      # Frontend application
├── infrastructure/                # Infrastructure as Code
├── docs/                         # Documentation
├── scripts/                      # Build and deployment scripts
├── tests/                        # Test files
├── uploads/                      # File uploads directory
├── logs/                         # Application logs
├── AVGC-TENDER-MANAGEMENT-PLATFORM/ # Legacy structure (to be migrated)
├── common/                       # Legacy common files (moved to src/)
├── modules/                      # Legacy modules (moved to src/)
├── package.json                  # Backend dependencies
├── package-lock.json            # Lock file
├── tsconfig.json                # TypeScript configuration
└── PROJECT_STRUCTURE.md         # This file
```

## Source Code Structure (`src/`)

```
src/
├── app.controller.ts             # Main application controller
├── app.service.ts               # Main application service
├── app.module.ts                # Root application module
├── main.ts                      # Application entry point
├── config/                      # Configuration files
│   ├── app.config.ts           # Application configuration
│   ├── database.config.ts      # Database configuration
│   ├── redis.config.ts         # Redis configuration
│   ├── jwt.config.ts           # JWT configuration
│   └── email.config.ts         # Email configuration
├── common/                      # Shared utilities and components
│   ├── decorators/             # Custom decorators
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── filters/                # Exception filters
│   │   ├── all-exceptions.filter.ts
│   │   └── http-exception.filter.ts
│   ├── guards/                 # Authentication/Authorization guards
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── interceptors/           # Request/Response interceptors
│       ├── logging.interceptor.ts
│       ├── timeout.interceptor.ts
│       └── transform.interceptor.ts
├── modules/                     # Feature modules
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── entities/
│   │   │   └── refresh-token.entity.ts
│   │   ├── guards/
│   │   │   └── local-auth.guard.ts
│   │   └── strategies/
│   │       ├── jwt.strategy.ts
│   │       ├── local.strategy.ts
│   │       └── refresh-token.strategy.ts
│   ├── users/                  # User management module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   ├── tenders/                # Tender management module
│   │   ├── tenders.controller.ts
│   │   ├── tenders.service.ts
│   │   ├── tenders.module.ts
│   │   ├── dto/
│   │   │   ├── create-tender.dto.ts
│   │   │   ├── update-tender.dto.ts
│   │   │   └── search-tender.dto.ts
│   │   └── entities/
│   │       └── tender.entity.ts
│   ├── bids/                   # Bid management module
│   │   ├── bids.controller.ts
│   │   ├── bids.service.ts
│   │   ├── bids.module.ts
│   │   ├── dto/
│   │   │   ├── create-bid.dto.ts
│   │   │   ├── update-bid.dto.ts
│   │   │   └── evaluate-bid.dto.ts
│   │   └── entities/
│   │       └── bid.entity.ts
│   ├── organizations/          # Organization management module
│   │   ├── organizations.controller.ts
│   │   ├── organizations.service.ts
│   │   ├── organizations.module.ts
│   │   ├── dto/
│   │   │   ├── create-organization.dto.ts
│   │   │   ├── update-organization.dto.ts
│   │   │   └── search-organization.dto.ts
│   │   └── entities/
│   │       └── organization.entity.ts
│   ├── documents/              # Document management module
│   │   ├── documents.controller.ts
│   │   ├── documents.service.ts
│   │   ├── documents.module.ts
│   │   └── entities/
│   │       └── document.entity.ts
│   ├── notifications/          # Notification module
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── notifications.module.ts
│   │   ├── email.service.ts
│   │   ├── dto/
│   │   │   └── create-notification.dto.ts
│   │   ├── entities/
│   │   │   └── notification.entity.ts
│   │   └── templates/
│   │       └── notification.hbs
│   └── security/               # Security module
│       ├── security.controller.ts
│       ├── security.service.ts
│       └── security.module.ts
└── database/                   # Database related files
    └── schemas/                # Database schemas
        ├── database-schema-emd.sql
        ├── database-schema-reporting.sql
        └── database-schema-security.sql
```

## Infrastructure Structure (`infrastructure/`)

```
infrastructure/
├── docker/                     # Docker configurations
│   ├── docker-compose.yml     # Docker compose file
│   ├── Dockerfile.backend     # Backend Dockerfile
│   └── Dockerfile.frontend    # Frontend Dockerfile
├── kubernetes/                 # Kubernetes manifests
│   ├── k8s-api-gateway.txt
│   ├── k8s-cleanup-script.txt
│   ├── k8s-configmap.txt
│   ├── k8s-deploy-script.txt
│   ├── k8s-deployment.txt
│   ├── k8s-deployment1.txt
│   ├── k8s-document-service.txt
│   ├── k8s-elasticsearch.txt
│   ├── k8s-frontend.txt
│   ├── k8s-grafana.txt
│   ├── k8s-helm-values.txt
│   ├── k8s-ingress.txt
│   ├── k8s-kustomization.txt
│   ├── k8s-mongodb.txt
│   ├── k8s-namespace.txt
│   ├── k8s-network-policies.txt
│   ├── k8s-notification-service.txt
│   ├── k8s-postgres.txt
│   ├── k8s-prometheus.txt
│   ├── k8s-rabbitmq.txt
│   ├── k8s-rbac.txt
│   ├── k8s-redis.txt
│   ├── k8s-reporting-service.txt
│   ├── k8s-secrets.txt
│   ├── k8s-security-service.txt
│   └── k8s-tender-service.txt
└── monitoring/                 # Monitoring configurations
    ├── grafana-dashboard.json
    ├── prometheus-alerts.txt
    └── prometheus-config.txt
```

## Frontend Structure (`frontend/`)

```
frontend/
├── package.json               # Frontend dependencies
└── src/                      # Frontend source code (from AVGC-TENDER-MANAGEMENT-PLATFORM)
    ├── assets/
    ├── components/
    ├── contexts/
    ├── hooks/
    ├── layouts/
    ├── pages/
    ├── services/
    ├── store/
    ├── types/
    └── utils/
```

## Documentation Structure (`docs/`)

```
docs/
├── README.md                  # Main project documentation
├── CODEBASE_STRUCTURE.md     # Codebase structure documentation
├── AVGC Tender Management Platform.pdf
├── DETAIL.pdf
├── KUBER DEPL.pdf
├── TENDER.pdf
└── WORK FLOW.pdf
```

## Scripts Structure (`scripts/`)

```
scripts/
├── env-example.sh            # Environment setup script
└── env-example.txt           # Environment variables example
```

## Key Features of This Structure

### 1. **Separation of Concerns**
- Clear separation between source code, infrastructure, documentation, and scripts
- Each module is self-contained with its own controllers, services, DTOs, and entities

### 2. **Scalability**
- Modular architecture allows for easy addition of new features
- Infrastructure as Code for consistent deployments
- Separate frontend and backend concerns

### 3. **Maintainability**
- Consistent naming conventions
- Logical grouping of related files
- Clear dependency management

### 4. **Best Practices**
- Follows NestJS recommended structure
- Configuration management through dedicated config files
- Proper error handling with filters and interceptors
- Authentication and authorization through guards and strategies

### 5. **DevOps Ready**
- Docker configurations for containerization
- Kubernetes manifests for orchestration
- Monitoring setup with Grafana and Prometheus
- Environment configuration templates

## Migration Notes

The following files have been reorganized:
- Root-level TypeScript files moved to `src/`
- Configuration files centralized in `src/config/`
- Infrastructure files organized by type
- Documentation consolidated in `docs/`
- Database schemas moved to `src/database/schemas/`

## Next Steps

1. Update import paths in all TypeScript files
2. Configure build scripts in package.json
3. Set up environment variables
4. Configure database connections
5. Set up CI/CD pipelines
6. Configure monitoring and logging
