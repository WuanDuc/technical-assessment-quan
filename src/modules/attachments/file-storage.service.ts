import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { CustomHashmap } from 'src/common/data-structures/hashmap';
import { HashmapFactory } from 'src/common/factories/hashmap-factory';
import { FileMetadata } from 'src/common/interfaces/hashmap.interface';

/**
 * Service for managing file storage using Custom Hashmap
 * Implements file metadata caching and management
 */
@Injectable()
export class FileStorageService {
  // Custom Hashmap to store file metadata
  private readonly fileMetadataCache: CustomHashmap<string, FileMetadata>;

  constructor() {
    // Initialize Custom Hashmap using Factory pattern
    this.fileMetadataCache = HashmapFactory.createFileMetadataHashmap<
      string,
      FileMetadata
    >(32, 0.75);
  }

  /**
   * Ensure upload directory exists
   */
  async ensureUploadDirectory(
    productId: string,
    folderPath?: string,
  ): Promise<string> {
    const basePath = join(process.cwd(), 'uploads', productId);
    const fullPath = folderPath ? join(basePath, folderPath) : basePath;

    try {
      await fs.mkdir(fullPath, { recursive: true });
      return fullPath;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create upload directory: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
    }
  }

  /**
   * Store file metadata in Custom Hashmap
   */
  storeFileMetadata(fileId: string, metadata: FileMetadata): void {
    this.fileMetadataCache.insert(fileId, metadata);
  }

  /**
   * Get file metadata from Custom Hashmap
   */
  getFileMetadata(fileId: string): FileMetadata | undefined {
    return this.fileMetadataCache.get(fileId);
  }

  /**
   * Delete file metadata from Custom Hashmap
   */
  deleteFileMetadata(fileId: string): boolean {
    return this.fileMetadataCache.delete(fileId);
  }

  /**
   * Get all file metadata from Custom Hashmap
   */
  getAllFileMetadata(): FileMetadata[] {
    return this.fileMetadataCache.values();
  }

  /**
   * Get file metadata by product ID from Custom Hashmap
   */
  getFileMetadataByProductId(productId: string): FileMetadata[] {
    return this.fileMetadataCache
      .values()
      .filter((metadata) => metadata.productId === productId);
  }

  /**
   * Clear all file metadata from Custom Hashmap
   */
  clearFileMetadataCache(): void {
    this.fileMetadataCache.clear();
  }

  /**
   * Get Hashmap statistics
   */
  getHashmapStats(): {
    size: number;
    capacity: number;
    loadFactor: number;
  } {
    return {
      size: this.fileMetadataCache.getSize(),
      capacity: this.fileMetadataCache.getCapacity(),
      loadFactor: this.fileMetadataCache.getLoadFactor(),
    };
  }

  /**
   * Delete file from filesystem
   */
  async deleteFile(filepath: string): Promise<void> {
    try {
      const fullPath = join(process.cwd(), filepath);
      await fs.unlink(fullPath);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete file: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filepath: string): Promise<boolean> {
    try {
      const fullPath = join(process.cwd(), filepath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
