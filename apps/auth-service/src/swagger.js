const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      description: 'API documentation for the Auth Service',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:6001',
      },
    ],
    components: {
      schemas: {
        RegisterPayload: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              example: 'Nguyen Van A',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'password123',
            },
          },
        },
        VerifyUserPayload: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            otp: {
              type: 'string',
              example: '123456',
            },
          },
        },
        LoginPayload: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              example: 'password123',
            },
          },
        },
        ForgotPasswordPayload: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
          },
        },
        VerifyResetOtpPayload: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            otp: {
              type: 'string',
              example: '123456',
            },
          },
        },
        ResetPasswordPayload: {
          type: 'object',
          required: ['email', 'resetToken', 'newPassword'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            resetToken: {
              type: 'string',
              example: 'a1b2c3d4e5f6',
            },
            newPassword: {
              type: 'string',
              example: 'newPassword123',
            },
          },
        },
      },
    },
  },
  apis: ['apps/auth-service/src/routes/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

if (require.main === module) {
  const outputPath = path.join(__dirname, 'swagger-output.json');
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
  console.log(`Swagger spec written to ${outputPath}`);
}
