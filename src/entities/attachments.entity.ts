import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from './products.entity';
import { FolderEntity } from './folders.entity';

@Entity('attachments')
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  filename!: string;

  @Column()
  filepath!: string; // đường dẫn local: /uploads/productId/folder/file.ext

  @Column({ nullable: true })
  mimetype?: string;

  @Column({ type: 'bigint', nullable: true })
  size?: number;

  @Column({ nullable: true })
  extension?: string;

  @ManyToOne(() => ProductEntity, (product) => product.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: ProductEntity;

  @Column()
  productId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => FolderEntity, (folder) => folder.attachments, {
    nullable: true,
  })
  @JoinColumn({ name: 'folderId' })
  folder?: FolderEntity;

  @Column({ nullable: true })
  folderId?: string;
}
