import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileNodeDto {
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

  @ApiProperty()
  createdAt!: Date;
}

export class FolderNodeDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'documents' })
  name!: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  parentId?: string;

  @ApiProperty({ type: [FolderNodeDto] })
  children!: FolderNodeDto[];

  @ApiProperty({ type: [FileNodeDto] })
  files!: FileNodeDto[];
}

export class TreeStructureResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  productId!: string;

  @ApiProperty({ type: [FolderNodeDto] })
  rootFolders!: FolderNodeDto[];

  @ApiProperty({ type: [FileNodeDto] })
  rootFiles!: FileNodeDto[];

  @ApiProperty({ example: 15 })
  totalFiles!: number;

  @ApiProperty({ example: 5 })
  totalFolders!: number;
}
