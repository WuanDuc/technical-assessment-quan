import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // Define allowed origins
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

  // Add additional origins from environment variable if provided
  if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS.split(',');
    allowedOrigins.push(...envOrigins);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT ?? 3001);
  const swaggerEnabled =
    process.env.SWAGGER_ENABLED === 'true' || !isProduction;
  const swaggerPath = process.env.SWAGGER_PATH ?? 'api';
  const baseServerUrl = process.env.API_BASE_URL ?? `http://localhost:${port}`;

  const app: INestApplication = await NestFactory.create(
    AppModule,
    new ExpressAdapter(),
    {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'Accept',
          'Origin',
          'X-Requested-With',
          'Access-Control-Allow-Headers',
          'Access-Control-Request-Method',
          'Access-Control-Request-Headers',
        ],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
      },
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn']
          : ['log', 'debug', 'error', 'verbose', 'warn'],
    },
  );

  // Optimized validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Product Management API')
      .setDescription(
        'REST API for managing products, file attachments, and custom hashmap metadata.',
      )
      .setVersion(process.env.npm_package_version ?? '1.0.0')
      .setContact(
        'Product Platform Team',
        'https://example.com',
        'support@example.com',
      )
      .addServer(baseServerUrl, 'Primary API server')
      .addTag('Products', 'Product CRUD operations')
      .addTag('Attachments', 'Product attachment management')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      deepScanRoutes: true,
    });

    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
      customSiteTitle: 'Product Management API Docs',
    });
  }

  await app.listen(port);

  if (!isProduction) {
    console.log(`Application is running on: http://localhost:${port}`);
    if (swaggerEnabled) {
      console.log(
        `Swagger documentation: http://localhost:${port}/${swaggerPath}`,
      );
    }
    console.log('Allowed CORS origins:', allowedOrigins);
  }
}

bootstrap().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
