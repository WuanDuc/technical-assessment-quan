import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductRepository } from './repositories/products.repository';
import { ProductEntity } from '../../entities/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository],
  exports: [ProductsService, ProductRepository],
})
export class ProductsModule {}
