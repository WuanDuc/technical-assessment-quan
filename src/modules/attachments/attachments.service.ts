import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { extname, isAbsolute, join } from 'path';
import { AttachmentEntity } from 'src/entities/attachments.entity';
import { FileMetadata } from '../../common/interfaces/hashmap.interface';
import { ProductsService } from '../products/products.service';
import { TreeStructureResponseDto } from './dto/file.dto';
import { FileStorageService } from './file-storage.service';
import { AttachmentsRepository } from './repositories/attachments.repository';
import { FoldersRepository } from './repositories/folders.repository';
import { TreeStructureService } from './tree-structure.service';

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly foldersRepository: FoldersRepository,
    private readonly fileStorageService: FileStorageService,
    private readonly treeStructureService: TreeStructureService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Upload file attachment for a product
   */
  async uploadFile(
    productId: string,
    file: Express.Multer.File,
    folderPath?: string,
  ): Promise<AttachmentEntity> {
    await this.productsService.findOne(productId);

    if (!file || typeof file.originalname !== 'string') {
      throw new BadRequestException('Invalid file payload');
    }

    const originalName = file.originalname;
    const storedName = typeof file.filename === 'string' ? file.filename : '';
    if (!storedName) {
      throw new BadRequestException('Stored filename is missing');
    }

    const targetDirectory = await this.fileStorageService.ensureUploadDirectory(
      productId,
      folderPath,
    );

    let folderId: string | undefined;
    if (folderPath) {
      const targetFolder =
        await this.foldersRepository.findOrCreateByPath(folderPath);
      folderId = targetFolder.id;
    }

    const initialAbsolutePath = (() => {
      if (file.path) {
        return isAbsolute(file.path)
          ? file.path
          : join(process.cwd(), file.path);
      }

      const destination = file.destination ?? join('uploads', productId);
      const absoluteDestination = isAbsolute(destination)
        ? destination
        : join(process.cwd(), destination);
      return join(absoluteDestination, storedName);
    })();

    const finalAbsolutePath = join(targetDirectory, storedName);
    if (initialAbsolutePath !== finalAbsolutePath) {
      await this.fileStorageService.moveFile(
        initialAbsolutePath,
        finalAbsolutePath,
      );
    }

    const extension = extname(originalName).replace('.', '');
    const filepath = `/uploads/${productId}${
      folderPath ? `/${folderPath}` : ''
    }/${storedName}`;

    const attachment = await this.attachmentsRepository.create({
      filename: originalName,
      filepath,
      mimetype: file.mimetype ?? '',
      size: file.size ?? 0,
      extension,
      productId,
      folderId,
    });

    this.fileStorageService.storeFileMetadata(attachment.id, {
      fileId: attachment.id,
      filename: attachment.filename,
      filepath: attachment.filepath,
      mimetype: attachment.mimetype ?? '',
      size: Number(attachment.size) || 0,
      extension: attachment.extension ?? '',
      productId: attachment.productId,
      folderId: attachment.folderId,
      uploadedAt: attachment.createdAt,
    });

    return attachment;
  }

  /**
   * Get tree structure of attachments for a product
   */
  async getTreeStructure(productId: string): Promise<TreeStructureResponseDto> {
    // Verify product exists
    await this.productsService.findOne(productId);

    return await this.treeStructureService.generateTreeStructure(productId);
  }

  /**
   * Get all attachments for a product
   */
  async findByProductId(productId: string): Promise<AttachmentEntity[]> {
    return await this.attachmentsRepository.findByProductId(productId);
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(id: string): Promise<void> {
    const attachment = await this.attachmentsRepository.findById(id);
    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    // Delete file from filesystem
    await this.fileStorageService.deleteFile(attachment.filepath);

    // Delete from database
    await this.attachmentsRepository.delete(id);

    // Delete from Custom Hashmap
    this.fileStorageService.deleteFileMetadata(id);
  }

  /**
   * Get file metadata from Custom Hashmap
   */
  getFileMetadata(fileId: string): FileMetadata | undefined {
    return this.fileStorageService.getFileMetadata(fileId);
  }

  /**
   * Get Hashmap statistics
   */
  getHashmapStats() {
    return this.fileStorageService.getHashmapStats();
  }
}
