import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
// import { DataSource } from 'typeorm';
// import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   cache: true, // Cache config
    // }),
    // Database connection
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: false,
        migrationsTableName: 'migrations',
        autoLoadEntities: true,
        // ssl: {
        //   rejectUnauthorized: false,
        // },
        // Memory optimizations
        keepConnectionAlive: false,
        retryAttempts: 1,
        retryDelay: 1000,
        maxQueryExecutionTime: 5000,
        poolSize: 3, // Reduce connection pool
        extra: {
          max: 3, // Maximum pool size
          min: 1, // Minimum pool size
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
    }),
    ProductsModule,
    AttachmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
