import { Injectable } from '@nestjs/common';
import { AttachmentEntity } from 'src/entities/attachments.entity';
import {
  TreeStructureResponseDto,
  FolderNodeDto,
  FileNodeDto,
} from './dto/file.dto';
import { AttachmentsRepository } from './repositories/attachments.repository';
import { FoldersRepository } from './repositories/folders.repository';

/**
 * Service for generating tree structure of folders and files
 * Implements nested tree structure as required by technical assessment
 */
@Injectable()
export class TreeStructureService {
  constructor(
    private readonly foldersRepository: FoldersRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
  ) {}

  /**
   * Generate tree structure for a product's attachments
   */
  async generateTreeStructure(
    productId: string,
  ): Promise<TreeStructureResponseDto> {
    // Get all attachments for the product
    const attachments =
      await this.attachmentsRepository.findByProductId(productId);

    // Get all folders
    const allFolders = await this.foldersRepository.findAllFolders();

    // Build folder tree
    const folderMap = new Map<string, FolderNodeDto>();
    const rootFolders: FolderNodeDto[] = [];
    const rootFiles: FileNodeDto[] = [];

    // Initialize folder nodes
    for (const folder of allFolders) {
      folderMap.set(folder.id, {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        children: [],
        files: [],
      });
    }

    // Build folder hierarchy
    for (const folder of allFolders) {
      const folderNode = folderMap.get(folder.id);

      if (folder.parentId) {
        const parentNode = folderMap.get(folder.parentId);
        if (parentNode) {
          parentNode.children.push(folderNode);
        }
      } else {
        rootFolders.push(folderNode);
      }
    }

    // Add files to their respective folders or root
    for (const attachment of attachments) {
      const fileNode = this.mapAttachmentToFileNode(attachment);

      if (attachment.folderId) {
        const folderNode = folderMap.get(attachment.folderId);
        if (folderNode) {
          folderNode.files.push(fileNode);
        }
      } else {
        rootFiles.push(fileNode);
      }
    }

    // Sort folders and files
    this.sortTreeStructure(rootFolders);

    return {
      productId,
      rootFolders,
      rootFiles,
      totalFiles: attachments.length,
      totalFolders: allFolders.length,
    };
  }

  /**
   * Map AttachmentEntity to FileNodeDto
   */
  private mapAttachmentToFileNode(attachment: AttachmentEntity): FileNodeDto {
    return {
      id: attachment.id,
      filename: attachment.filename,
      filepath: attachment.filepath,
      mimetype: attachment.mimetype || '',
      size: Number(attachment.size) || 0,
      extension: attachment.extension || '',
      createdAt: attachment.createdAt,
    };
  }

  /**
   * Recursively sort folders and files alphabetically
   */
  private sortTreeStructure(folders: FolderNodeDto[]): void {
    folders.sort((a, b) => a.name.localeCompare(b.name));

    for (const folder of folders) {
      folder.files.sort((a, b) => a.filename.localeCompare(b.filename));
      this.sortTreeStructure(folder.children);
    }
  }
}
