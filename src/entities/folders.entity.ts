import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AttachmentEntity } from './attachments.entity';

@Entity('folders')
export class FolderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent?: FolderEntity;

  @Column({ nullable: true })
  parentId?: string;

  @OneToMany(() => FolderEntity, (folder) => folder.parent)
  children!: FolderEntity[];

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.folder)
  attachments!: AttachmentEntity[];
}
