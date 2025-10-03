import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../../entities/products.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const product = this.repository.create(createProductDto);
    return await this.repository.save(product);
  }

  async findAll(): Promise<ProductEntity[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['attachments'],
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity | null> {
    await this.repository.update(id, updateProductDto);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}
