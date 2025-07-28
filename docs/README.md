# AVGC Tender Management Platform

A comprehensive, enterprise-grade tender management system designed specifically for the Animation, Visual Effects, Gaming, and Comics (AVGC) industry. Built with modern microservices architecture, featuring advanced EMD/DD management, security management, and real-time analytics.

## 🏗️ Architecture Overview

The platform follows a microservices architecture pattern with the following key components:

- **Frontend**: React 18 with TypeScript, Redux Toolkit, and Material-UI
- **API Gateway**: Kong/Nginx for routing and load balancing
- **Microservices**:
  - Auth Service: Authentication, authorization, and MFA
  - Tender Service: Tender discovery, management, and bidding
  - EMD Service: EMD calculations, payments, and refunds
  - Security Service: Bank guarantees, insurance, and compliance
  - Reporting Service: Analytics, dashboards, and scheduled reports
- **Databases**: PostgreSQL (primary), MongoDB (documents), Redis (caching)
- **Message Queue**: RabbitMQ for async processing
- **Search**: Elasticsearch for full-text search
- **Monitoring**: Prometheus, Grafana, and ELK stack

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis 7+
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/avgc/tender-management.git
   cd tender-management
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend services
   cd ../backend
   npm install
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start development servers**
   ```bash
   # Frontend (in frontend directory)
   npm start

   # Backend (in backend directory)
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8080
   - Grafana: http://localhost:3001
   - RabbitMQ Management: http://localhost:15672

## 📁 Project Structure

```
avgc-tender-management/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   ├── components/      # Shared components
│   │   ├── services/        # API services
│   │   ├── hooks/          # Custom React hooks
│   │   └── store/          # Redux store
│   └── public/
├── backend/
│   ├── api-gateway/         # API Gateway service
│   ├── services/           # Microservices
│   │   ├── auth-service/
│   │   ├── tender-service/
│   │   ├── emd-service/
│   │   ├── security-service/
│   │   └── reporting-service/
│   └── shared/             # Shared utilities
├── database/               # Database schemas and migrations
├── monitoring/            # Monitoring configurations
├── k8s/                  # Kubernetes manifests
└── docker-compose.yml    # Docker compose configuration
```

## 🛠️ Key Features

### Tender Management
- **Discovery**: Automated tender discovery from multiple sources
- **Search & Filter**: Advanced search with category, location, and value filters
- **Bid Preparation**: Collaborative bid preparation with document management
- **Tracking**: Real-time status tracking and notifications

### EMD & Payment Management
- **Calculation**: Automated EMD calculation with exemptions
- **Payment**: Multiple payment modes (Online, DD, BG)
- **Refunds**: Automated refund processing and tracking
- **Compliance**: Complete audit trail and compliance reporting

### Security Management
- **Bank Guarantees**: BG generation, tracking, and renewal
- **Insurance**: Policy management and claim tracking
- **Validity Tracking**: Automated alerts for expiring securities
- **Performance Security**: Contract-based security management

### Analytics & Reporting
- **Dashboards**: Real-time executive and operational dashboards
- **Custom Reports**: Template-based report generation
- **Scheduled Reports**: Automated report distribution
- **Data Export**: Multiple export formats (PDF, Excel, CSV)

### Security Features
- **Authentication**: JWT-based authentication with refresh tokens
- **MFA**: Two-factor authentication support
- **Role-Based Access**: Granular permission management
- **Audit Logging**: Comprehensive audit trail
- **Data Encryption**: At-rest and in-transit encryption

## 🔧 Configuration

### Environment Variables

Key environment variables that need to be configured:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PAYMENT_GATEWAY_KEY`: Payment gateway API key
- `ELASTICSEARCH_URL`: Elasticsearch connection URL

See `.env.example` for complete list.

### Database Setup

```bash
# Create databases
createdb avgc_tender_auth
createdb avgc_tender_main
createdb avgc_tender_emd
createdb avgc_tender_security
createdb avgc_tender_reporting

# Run migrations
npm run migrate:all
```

## 📊 Monitoring & Logging

### Metrics
- Prometheus metrics available at `/metrics` endpoint
- Grafana dashboards for system and business metrics
- Custom alerts for critical events

### Logging
- Structured JSON logging with Winston
- Centralized logging with Elasticsearch
- Log aggregation with Fluentd/Logstash

### Tracing
- Distributed tracing with Jaeger
- Request correlation across microservices

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📦 Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Deploy
docker-compose up -d
```

### Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/

# Check status
kubectl get pods -n avgc-tender-system
```

### Production Considerations

- Use managed databases (RDS, Cloud SQL)
- Configure auto-scaling for services
- Set up CDN for static assets
- Enable backup and disaster recovery
- Configure monitoring alerts
- Implement rate limiting
- Set up WAF rules

## 🔐 Security

- Regular security audits
- Dependency scanning with Snyk
- Container scanning
- OWASP compliance
- PCI DSS compliance for payment processing

## 📝 API Documentation

API documentation is available at:
- Swagger UI: http://localhost:8080/api-docs
- Postman Collection: `/docs/postman-collection.json`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Documentation: [docs.avgctender.com](https://docs.avgctender.com)
- Issues: [GitHub Issues](https://github.com/avgc/tender-management/issues)
- Email: support@avgctender.com

## 🙏 Acknowledgments

- Ministry of Information and Broadcasting, Government of India
- AVGC Task Force
- Open source community

---

Built with ❤️ for the AVGC industry