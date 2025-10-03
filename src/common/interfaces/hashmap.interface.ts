/**
 * Interface for file metadata stored in Hashmap
 */
export interface FileMetadata {
  fileId: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  extension: string;
  productId: string;
  folderId?: string;
  uploadedAt: Date;
}

/**
 * Interface for folder structure in tree
 */
export interface FolderNode {
  id: string;
  name: string;
  parentId?: string;
  children: FolderNode[];
  files: FileMetadata[];
}
