import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AttachmentsService } from './attachments.service';
import { AttachmentResponseDto } from './dto/attachment-response.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { TreeStructureResponseDto } from './dto/file.dto';
import { AttachmentEntity } from '../../entities/attachments.entity';

@ApiTags('Attachments')
@Controller('products/:productId/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file for a product' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        folderPath: {
          type: 'string',
          example: 'documents/invoices',
          description: 'Optional nested folder path',
        },
        folderId: {
          type: 'string',
          format: 'uuid',
          description: 'Optional existing folder ID',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File uploaded successfully',
    type: AttachmentResponseDto,
  })
  async uploadFile(
    @Param('productId', ParseUUIDPipe) productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<AttachmentResponseDto | undefined> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const folderPath = uploadFileDto.folderPath;
    const attachment = await this.attachmentsService.uploadFile(
      productId,
      file,
      folderPath,
    );

    return this.toAttachmentResponse(attachment);
  }

  @Get()
  @ApiOperation({ summary: 'List all attachments for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attachments retrieved successfully',
    type: [AttachmentResponseDto],
  })
  async getAttachments(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<AttachmentResponseDto[]> {
    const attachments =
      await this.attachmentsService.findByProductId(productId);

    return attachments.map((attachment) =>
      this.toAttachmentResponse(attachment),
    );
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get folder/file tree structure for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tree structure retrieved successfully',
    type: TreeStructureResponseDto,
  })
  async getTreeStructure(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<TreeStructureResponseDto> {
    return await this.attachmentsService.getTreeStructure(productId);
  }

  @Get(':attachmentId/metadata')
  @ApiOperation({ summary: 'Get cached metadata for an attachment' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Metadata retrieved successfully',
  })
  getFileMetadata(@Param('attachmentId', ParseUUIDPipe) attachmentId: string) {
    const metadata = this.attachmentsService.getFileMetadata(attachmentId);

    if (!metadata) {
      throw new NotFoundException(
        `Metadata for attachment ${attachmentId} not found`,
      );
    }

    return metadata;
  }

  @Delete(':attachmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment UUID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Attachment deleted successfully',
  })
  async deleteAttachment(
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<void> {
    await this.attachmentsService.deleteAttachment(attachmentId);
  }

  private toAttachmentResponse(
    attachment: AttachmentEntity,
  ): AttachmentResponseDto {
    return plainToInstance(AttachmentResponseDto, attachment, {
      enableImplicitConversion: true,
    });
  }
}
