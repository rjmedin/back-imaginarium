import { config } from "./config";

export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Imaginarium AI Conversations API",
    version: "1.0.0",
    description: "API para gestionar conversaciones con inteligencia artificial - Compatible con n8n"
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: "Servidor de desarrollo"
    },
    {
      url: "https://tu-api.vercel.app",
      description: "Servidor de producción"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Conversation: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          messageCount: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Message: {
        type: "object",
        properties: {
          id: { type: "string" },
          content: { type: "string" },
          messageType: { type: "string", enum: ["user", "ai", "system"] },
          timestamp: { type: "string", format: "date-time" },
          conversationId: { type: "string" }
        }
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          error: { type: "string" },
          timestamp: { type: "string", format: "date-time" }
        }
      }
    }
  }
};

export const swaggerOptions = {
  definition: swaggerConfig,
  apis: process.env.NODE_ENV === 'production' 
    ? ["./dist/presentation/routes/*.js"]
    : ["./src/presentation/routes/*.ts"]
}; 