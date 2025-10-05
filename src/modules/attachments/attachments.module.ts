import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { AttachmentEntity } from '../../entities/attachments.entity';
import { FolderEntity } from '../../entities/folders.entity';
import { ProductEntity } from '../../entities/products.entity';
import { ProductsModule } from '../products/products.module';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileStorageService } from './file-storage.service';
import { AttachmentsRepository } from './repositories/attachments.repository';
import { FoldersRepository } from './repositories/folders.repository';
import { TreeStructureService } from './tree-structure.service';
import { existsSync, mkdirSync } from 'fs';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttachmentEntity, FolderEntity, ProductEntity]),
    ProductsModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const productId = req.params.productId;
          if (!productId) {
            return cb(new Error('Missing productId route parameter'), '');
          }

          const uploadPath = `./uploads/${productId}`;
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  ],
  controllers: [AttachmentsController],
  providers: [
    AttachmentsService,
    FileStorageService,
    TreeStructureService,
    AttachmentsRepository,
    FoldersRepository,
  ],
  exports: [AttachmentsService, FileStorageService, TreeStructureService],
})
export class AttachmentsModule {}
