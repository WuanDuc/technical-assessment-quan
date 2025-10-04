import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttachmentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'document.pdf' })
  filename!: string;

  @ApiProperty({ example: '/uploads/product-id/folder/document.pdf' })
  filepath!: string;

  @ApiProperty({ example: 'application/pdf' })
  mimetype!: string;

  @ApiProperty({ example: 1024000 })
  size!: number;

  @ApiProperty({ example: 'pdf' })
  extension!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  productId!: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  folderId?: string;

  @ApiProperty()
  createdAt!: Date;
}
