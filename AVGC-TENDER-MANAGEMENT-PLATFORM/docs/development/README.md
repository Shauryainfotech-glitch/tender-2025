# Tender Management System - Complete Setup Guide

## Project Overview

This repository contains a comprehensive Tender Management System built with modern technologies:

- **Backend**: NestJS, TypeORM, PostgreSQL, Redis
- **Frontend**: TypeScript, React/Next.js (components ready)
- **Infrastructure**: Docker, Kubernetes, Monitoring (Prometheus, Grafana)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- Docker & Docker Compose
- Git

### Backend Setup

1. **Clone and Install Dependencies**
```bash
cd "C:\Users\admin\Desktop\TENDER MNAGEMENT"
npm install
```

2. **Environment Configuration**
```bash
# Copy the example environment file
copy .env.example .env

# Update the .env file with your configurations
# Especially database credentials and JWT secrets
```

3. **Database Setup**
```bash
# Create PostgreSQL database
createdb tender_management

# Run migrations (after starting the app once)
npm run migration:run
```

4. **Start Redis**
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally and start
redis-server
```

5. **Start the Application**
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

6. **Access the Application**
- API: http://localhost:3000/api
- Swagger Documentation: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

## 📁 Project Structure

```
TENDER MANAGEMENT/
├── config/                 # Configuration files
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── ...
├── common/                 # Common utilities
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   └── interceptors/
├── modules/               # Feature modules
│   ├── auth/
│   ├── users/
│   ├── tenders/
│   ├── bids/
│   └── ...
├── database-schemas/      # SQL schemas
├── k8s files/            # Kubernetes manifests
└── docker files/         # Docker configurations
```

## 🔧 Available Scripts

```json
{
  "start": "Start the application",
  "start:dev": "Start in development mode with hot-reload",
  "start:debug": "Start in debug mode",
  "build": "Build the application",
  "test": "Run unit tests",
  "test:e2e": "Run end-to-end tests",
  "lint": "Lint the code",
  "format": "Format code with Prettier"
}
```

## 🐳 Docker Deployment

1. **Build Docker Image**
```bash
docker build -t tender-management:latest .
```

2. **Run with Docker Compose**
```bash
docker-compose -f docker-compose-full.txt up -d
```

## ☸️ Kubernetes Deployment

1. **Create Namespace**
```bash
kubectl apply -f k8s-namespace.txt
```

2. **Deploy All Services**
```bash
kubectl apply -f k8s-deployment.txt
kubectl apply -f k8s-service.txt
kubectl apply -f k8s-ingress.txt
```

3. **Check Status**
```bash
kubectl get all -n tender-management
```

## 🔐 Security Features

- JWT Authentication with refresh tokens
- Role-based access control (RBAC)
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

## 📊 Monitoring

- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **ELK Stack**: Log aggregation (optional)

## 🧪 Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📦 Module Overview

### Core Modules:
1. **Auth Module**: Authentication, JWT, refresh tokens
2. **Users Module**: User management, roles
3. **Tenders Module**: Tender creation and management
4. **Bids Module**: Bid submission and evaluation
5. **Documents Module**: File upload and management
6. **EMD Module**: Earnest Money Deposit calculations
7. **Security Module**: Additional security features
8. **Notifications Module**: Email and real-time notifications
9. **Analytics Module**: Business intelligence
10. **Reports Module**: Report generation

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/logout` - Logout

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tenders
- `GET /api/tenders` - List tenders
- `POST /api/tenders` - Create tender
- `GET /api/tenders/:id` - Get tender details
- `PATCH /api/tenders/:id` - Update tender
- `DELETE /api/tenders/:id` - Delete tender

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

Key environment variables to configure:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=tender_management

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials in .env
   - Ensure database exists

2. **Redis Connection Error**
   - Check Redis is running
   - Verify Redis credentials

3. **Port Already in Use**
   - Change PORT in .env file
   - Kill process using the port

## 📞 Support

For support and queries:
- Create an issue in the repository
- Email: support@tendermanagement.com

## 📄 License

This project is licensed under the MIT License.

---

## 🔗 Related Projects

### Employee Management System (H:\employee)

A Flutter-based employee management system with:
- Cross-platform support (iOS, Android, Web, Desktop)
- Real-time location tracking
- Leave management
- Attendance tracking
- Firebase backend

To work with the Employee Management System:
```bash
cd H:\employee
flutter pub get
flutter run
```

---

**Note**: This is a development setup. For production deployment, please ensure:
- Proper SSL certificates
- Secure environment variables
- Database backups
- Monitoring and alerting
- Load balancing
- Security hardening
