# Application Configuration
NODE_ENV=development
PORT=3000
API_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=avgc_tender
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=false
DATABASE_POOL_SIZE=20

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/avgc_documents
MONGODB_USER=mongo_user
MONGODB_PASSWORD=mongo_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
REDIS_DB=0

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=rabbitmq
RABBITMQ_PASSWORD=rabbitmq_password
RABBITMQ_VHOST=/

# Elasticsearch Configuration
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASSWORD=elastic_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d

# MFA Configuration
MFA_SECRET=your_mfa_secret_key
MFA_ISSUER=AVGC Tender Management
MFA_WINDOW=1

# Payment Gateway Configuration
PAYMENT_GATEWAY_URL=https://api.paymentgateway.com
PAYMENT_GATEWAY_KEY=your_payment_gateway_key
PAYMENT_GATEWAY_SECRET=your_payment_gateway_secret
PAYMENT_WEBHOOK_SECRET=your_webhook_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=noreply@avgctender.com

# SMS Configuration
SMS_API_URL=https://api.smsgateway.com
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=AVGCTM

# File Storage Configuration
STORAGE_TYPE=local
STORAGE_PATH=./uploads
AWS_S3_BUCKET=avgc-tender-documents
AWS_S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE_PATH=./logs
LOG_MAX_SIZE=10m
LOG_MAX_FILES=14d

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831

# External APIs
TENDER_DISCOVERY_API_URL=https://api.tenderdiscovery.com
TENDER_DISCOVERY_API_KEY=your_api_key

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key
ENCRYPTION_IV=your_16_char_iv

# Feature Flags
ENABLE_MFA=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_WEBSOCKET=true
ENABLE_RATE_LIMITING=true

# Development Tools
SWAGGER_ENABLED=true
GRAPHQL_PLAYGROUND_ENABLED=true

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=avgc-tender-backups

# Audit Configuration
AUDIT_LOG_ENABLED=true
AUDIT_LOG_RETENTION_DAYS=90

# Performance
CACHE_TTL=3600
QUERY_TIMEOUT=30000
MAX_FILE_SIZE=52428800

# Third Party Services
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret

# Webhook URLs
WEBHOOK_TENDER_UPDATE=https://your-webhook-url.com/tender-update
WEBHOOK_BID_SUBMISSION=https://your-webhook-url.com/bid-submission