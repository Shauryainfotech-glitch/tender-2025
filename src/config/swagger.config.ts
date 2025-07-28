import { registerAs } from '@nestjs/config';

const swaggerConfig = registerAs('swagger', () => ({
  title: process.env.SWAGGER_TITLE || 'AVGC Tender Management Platform API',
  description: process.env.SWAGGER_DESCRIPTION || 'Comprehensive API documentation for the AVGC Tender Management Platform',
  version: process.env.SWAGGER_VERSION || '1.0.0',
  path: process.env.SWAGGER_PATH || 'api-docs',
  
  // Authentication
  auth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
  
  // Contact Information
  contact: {
    name: 'AVGC Development Team',
    email: 'support@avgc-tender.com',
    url: 'https://avgc-tender.com',
  },
  
  // License
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT',
  },
  
  // Server Configuration
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: process.env.API_PROD_URL || 'https://api.avgc-tender.com',
      description: 'Production server',
    },
  ],
  
  // Tags for organization
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication and authorization operations',
    },
    {
      name: 'Users',
      description: 'User management operations',
    },
    {
      name: 'Organizations',
      description: 'Organization management operations',
    },
    {
      name: 'Tenders',
      description: 'Tender management operations',
    },
    {
      name: 'Bids',
      description: 'Bid management operations',
    },
    {
      name: 'Documents',
      description: 'Document management operations',
    },
    {
      name: 'Security',
      description: 'Security and compliance operations',
    },
    {
      name: 'Notifications',
      description: 'Notification management operations',
    },
  ],
}));

export default swaggerConfig;
