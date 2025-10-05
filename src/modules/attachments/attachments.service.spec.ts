import { BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { AttachmentEntity } from '../../entities/attachments.entity';
import { FolderEntity } from '../../entities/folders.entity';
import { ProductEntity } from '../../entities/products.entity';
import { ProductsService } from '../products/products.service';
import { AttachmentsService } from './attachments.service';
import { AttachmentsRepository } from './repositories/attachments.repository';
import { FoldersRepository } from './repositories/folders.repository';
import { FileStorageService } from './file-storage.service';
import { TreeStructureService } from './tree-structure.service';

type AttachmentsRepositoryLike = Pick<AttachmentsRepository, 'create'>;
type FoldersRepositoryLike = Pick<FoldersRepository, 'findOrCreateByPath'>;
type FileStorageServiceLike = Pick<
  FileStorageService,
  'ensureUploadDirectory' | 'moveFile' | 'storeFileMetadata'
>;
type TreeStructureServiceLike = Pick<
  TreeStructureService,
  'generateTreeStructure'
>;
type ProductsServiceLike = Pick<ProductsService, 'findOne'>;

const attachmentsCreateMock = jest.fn<
  ReturnType<AttachmentsRepository['create']>,
  Parameters<AttachmentsRepository['create']>
>();
const foldersFindOrCreateMock = jest.fn<
  ReturnType<FoldersRepository['findOrCreateByPath']>,
  Parameters<FoldersRepository['findOrCreateByPath']>
>();
const ensureUploadDirectoryMock = jest.fn<
  ReturnType<FileStorageService['ensureUploadDirectory']>,
  Parameters<FileStorageService['ensureUploadDirectory']>
>();
const moveFileMock = jest.fn<
  ReturnType<FileStorageService['moveFile']>,
  Parameters<FileStorageService['moveFile']>
>();
const storeFileMetadataMock = jest.fn<
  ReturnType<FileStorageService['storeFileMetadata']>,
  Parameters<FileStorageService['storeFileMetadata']>
>();
const generateTreeStructureMock = jest.fn<
  ReturnType<TreeStructureService['generateTreeStructure']>,
  Parameters<TreeStructureService['generateTreeStructure']>
>();
const productsFindOneMock = jest.fn<
  ReturnType<ProductsService['findOne']>,
  Parameters<ProductsService['findOne']>
>();

const createProductEntity = (id: string): ProductEntity => ({
  id,
  name: 'Test Product',
  description: 'Test Description',
  price: 0,
  stock: 0,
  category: 'Test',
  createdAt: new Date(),
  updatedAt: new Date(),
  attachments: [],
});

const createFolderEntity = (id: string, name = 'folder'): FolderEntity => ({
  id,
  name,
  parentId: undefined,
  parent: undefined,
  children: [],
  attachments: [],
});

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let attachmentsRepository: AttachmentsRepositoryLike;
  let foldersRepository: FoldersRepositoryLike;
  let fileStorageService: FileStorageServiceLike;
  let treeStructureService: TreeStructureServiceLike;
  let productsService: ProductsServiceLike;

  beforeEach(() => {
    attachmentsCreateMock.mockReset();
    foldersFindOrCreateMock.mockReset();
    ensureUploadDirectoryMock.mockReset();
    moveFileMock.mockReset();
    storeFileMetadataMock.mockReset();
    generateTreeStructureMock.mockReset();
    productsFindOneMock.mockReset();

    attachmentsRepository = {
      create: attachmentsCreateMock,
    };
    foldersRepository = {
      findOrCreateByPath: foldersFindOrCreateMock,
    };
    fileStorageService = {
      ensureUploadDirectory: ensureUploadDirectoryMock,
      moveFile: moveFileMock,
      storeFileMetadata: storeFileMetadataMock,
    };
    treeStructureService = {
      generateTreeStructure: generateTreeStructureMock,
    };
    productsService = {
      findOne: productsFindOneMock,
    };

    service = new AttachmentsService(
      attachmentsRepository as unknown as AttachmentsRepository,
      foldersRepository as unknown as FoldersRepository,
      fileStorageService as unknown as FileStorageService,
      treeStructureService as unknown as TreeStructureService,
      productsService as unknown as ProductsService,
    );
  });

  describe('uploadFile', () => {
    const productId = 'product-123';
    const storedName = 'invoice.jpg';
    const folderPath = 'documents/invoices';

    it('relocates nested uploads and caches metadata', async () => {
      const targetDirectory = join(
        process.cwd(),
        'uploads',
        productId,
        ...folderPath.split('/'),
      );

      const product = createProductEntity(productId);
      const folder = createFolderEntity('folder-789');
      productsFindOneMock.mockResolvedValue(product);
      ensureUploadDirectoryMock.mockResolvedValue(targetDirectory);
      foldersFindOrCreateMock.mockResolvedValue(folder);
      moveFileMock.mockResolvedValue(undefined);
      storeFileMetadataMock.mockImplementation(() => undefined);

      const createdAt = new Date();
      const attachment = {
        id: 'attachment-456',
        filename: 'invoice.jpg',
        filepath: `/uploads/${productId}/${folderPath}/${storedName}`,
        mimetype: 'image/jpeg',
        size: 2048,
        extension: 'jpg',
        productId,
        folderId: 'folder-789',
        createdAt,
        product,
        folder,
      } as AttachmentEntity;

      attachmentsCreateMock.mockResolvedValue(attachment);

      const file = {
        originalname: 'invoice.jpg',
        filename: storedName,
        mimetype: 'image/jpeg',
        size: 2048,
        path: join('uploads', productId, storedName),
      } as Express.Multer.File;

      const result = await service.uploadFile(productId, file, folderPath);

      expect(productsFindOneMock).toHaveBeenCalledWith(productId);
      expect(ensureUploadDirectoryMock).toHaveBeenCalledWith(
        productId,
        folderPath,
      );
      expect(foldersFindOrCreateMock).toHaveBeenCalledWith(folderPath);

      const expectedInitialPath = join(
        process.cwd(),
        'uploads',
        productId,
        storedName,
      );
      const expectedFinalPath = join(targetDirectory, storedName);
      expect(moveFileMock).toHaveBeenCalledWith(
        expectedInitialPath,
        expectedFinalPath,
      );

      expect(attachmentsCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'invoice.jpg',
          productId,
          folderId: 'folder-789',
          filepath: `/uploads/${productId}/${folderPath}/${storedName}`,
        }),
      );

      expect(storeFileMetadataMock).toHaveBeenCalledWith(
        'attachment-456',
        expect.objectContaining({
          fileId: 'attachment-456',
          filename: 'invoice.jpg',
          productId,
          folderId: 'folder-789',
          uploadedAt: createdAt,
        }),
      );

      expect(result).toBe(attachment);
    });

    it('skips relocation when file already resides in target directory', async () => {
      const targetDirectory = join(process.cwd(), 'uploads', productId);

      const product = createProductEntity(productId);
      productsFindOneMock.mockResolvedValue(product);
      ensureUploadDirectoryMock.mockResolvedValue(targetDirectory);
      moveFileMock.mockResolvedValue(undefined);
      storeFileMetadataMock.mockImplementation(() => undefined);

      const attachment = {
        id: 'attachment-001',
        filename: 'receipt.png',
        filepath: `/uploads/${productId}/${storedName}`,
        mimetype: 'image/png',
        size: 512,
        extension: 'png',
        productId,
        folderId: undefined,
        createdAt: new Date(),
        product,
        folder: undefined,
      } as AttachmentEntity;

      attachmentsCreateMock.mockResolvedValue(attachment);

      const file = {
        originalname: 'receipt.png',
        filename: storedName,
        mimetype: 'image/png',
        size: 512,
        path: join(process.cwd(), 'uploads', productId, storedName),
      } as Express.Multer.File;

      const result = await service.uploadFile(productId, file);

      expect(foldersFindOrCreateMock).not.toHaveBeenCalled();
      expect(moveFileMock).not.toHaveBeenCalled();
      expect(attachmentsCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          folderId: undefined,
          filepath: `/uploads/${productId}/${storedName}`,
        }),
      );
      expect(result).toBe(attachment);
    });

    it('throws when stored filename is missing', async () => {
      const product = createProductEntity(productId);
      productsFindOneMock.mockResolvedValue(product);

      const invalidFile = {
        originalname: 'broken.txt',
      } as unknown as Express.Multer.File;

      await expect(
        service.uploadFile(productId, invalidFile, folderPath),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(ensureUploadDirectoryMock).not.toHaveBeenCalled();
      expect(attachmentsCreateMock).not.toHaveBeenCalled();
    });
  });
});
