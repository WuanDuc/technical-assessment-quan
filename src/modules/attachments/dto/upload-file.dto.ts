import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadFileDto {
  @ApiPropertyOptional({
    description: 'Folder ID where file should be uploaded',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({
    description: 'Folder path (e.g., "documents/invoices")',
    example: 'documents/invoices',
  })
  @IsOptional()
  @IsString()
  folderPath?: string;
}
