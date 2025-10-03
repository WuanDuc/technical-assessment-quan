import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsPositive,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    example: 'Laptop Dell XPS 15',
    description: 'Product name',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    example: 'High-performance laptop for professionals',
    description: 'Detailed product description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 1299.99,
    description: 'Product price in USD',
    minimum: 0,
    maximum: 999999.99,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0)
  @Max(999999.99)
  price!: number;

  @ApiProperty({
    example: 50,
    description: 'Available stock quantity',
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiPropertyOptional({
    example: 'Electronics',
    description: 'Product category',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;
}
