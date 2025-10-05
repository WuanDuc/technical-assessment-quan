import { NotFoundException } from '@nestjs/common';
import { ProductEntity } from '../../entities/products.entity';
import { ProductRepository } from './repositories/products.repository';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

type ProductRepositoryMock = {
  create: jest.Mock<
    ReturnType<ProductRepository['create']>,
    Parameters<ProductRepository['create']>
  >;
  findAll: jest.Mock<
    ReturnType<ProductRepository['findAll']>,
    Parameters<ProductRepository['findAll']>
  >;
  findById: jest.Mock<
    ReturnType<ProductRepository['findById']>,
    Parameters<ProductRepository['findById']>
  >;
  update: jest.Mock<
    ReturnType<ProductRepository['update']>,
    Parameters<ProductRepository['update']>
  >;
  delete: jest.Mock<
    ReturnType<ProductRepository['delete']>,
    Parameters<ProductRepository['delete']>
  >;
};

const createProduct = (
  overrides: Partial<ProductEntity> = {},
): ProductEntity => ({
  id: 'product-id',
  name: 'Sample Product',
  description: 'Sample description',
  price: 19.99,
  stock: 10,
  category: 'general',
  createdAt: new Date(),
  updatedAt: new Date(),
  attachments: [],
  ...overrides,
});

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: ProductRepositoryMock;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as ProductRepositoryMock;

    service = new ProductsService(repository as unknown as ProductRepository);
  });

  it('creates a product', async () => {
    const dto: CreateProductDto = {
      name: 'New Product',
      description: 'Brand new',
      price: 49.99,
      stock: 5,
      category: 'gadgets',
    };
    const createdProduct = createProduct({ id: 'new-id', ...dto });

    repository.create.mockResolvedValue(createdProduct);

    await expect(service.create(dto)).resolves.toBe(createdProduct);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  it('returns all products', async () => {
    const products = [createProduct({ id: 'a' }), createProduct({ id: 'b' })];
    repository.findAll.mockResolvedValue(products);

    await expect(service.findAll()).resolves.toEqual(products);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('finds a product by id', async () => {
    const product = createProduct({ id: 'target' });
    repository.findById.mockResolvedValue(product);

    await expect(service.findOne('target')).resolves.toBe(product);
    expect(repository.findById).toHaveBeenCalledWith('target');
  });

  it('throws when product not found on findOne', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a product when repository succeeds', async () => {
    const updatedProduct = createProduct({ name: 'Updated' });
    const dto: UpdateProductDto = { name: 'Updated' };
    repository.update.mockResolvedValue(updatedProduct);

    await expect(service.update('product-id', dto)).resolves.toBe(
      updatedProduct,
    );
    expect(repository.update).toHaveBeenCalledWith('product-id', dto);
  });

  it('throws when updating a missing product', async () => {
    repository.update.mockResolvedValue(null);

    await expect(
      service.update('missing', { name: 'Nope' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes a product when repository confirms deletion', async () => {
    repository.delete.mockResolvedValue(true);

    await expect(service.remove('product-id')).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith('product-id');
  });

  it('throws when deleting a missing product', async () => {
    repository.delete.mockResolvedValue(false);

    await expect(service.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
