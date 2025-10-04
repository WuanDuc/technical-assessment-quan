import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttachmentEntity } from '../../../entities/attachments.entity';

@Injectable()
export class AttachmentsRepository {
  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly repository: Repository<AttachmentEntity>,
  ) {}

  async create(
    attachmentData: Partial<AttachmentEntity>,
  ): Promise<AttachmentEntity> {
    const attachment = this.repository.create(attachmentData);
    return await this.repository.save(attachment);
  }

  async findByProductId(productId: string): Promise<AttachmentEntity[]> {
    return await this.repository.find({
      where: { productId },
      relations: ['folder'],
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<AttachmentEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['folder', 'product'],
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByFolderId(folderId: string): Promise<AttachmentEntity[]> {
    return await this.repository.find({
      where: { folderId },
      order: { createdAt: 'ASC' },
    });
  }
}
