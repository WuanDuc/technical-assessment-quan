import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Laptop Dell XPS 15' })
  name!: string;

  @ApiPropertyOptional({ example: 'High-performance laptop' })
  description?: string;

  @ApiProperty({ example: 1299.99 })
  price!: number;

  @ApiProperty({ example: 50 })
  stock!: number;

  @ApiPropertyOptional({ example: 'Electronics' })
  category?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
