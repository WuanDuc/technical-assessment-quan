import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from './repositories/products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from '../../entities/products.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    return await this.productRepository.create(createProductDto);
  }

  async findAll(): Promise<ProductEntity[]> {
    return await this.productRepository.findAll();
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    const product = await this.productRepository.update(id, updateProductDto);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
