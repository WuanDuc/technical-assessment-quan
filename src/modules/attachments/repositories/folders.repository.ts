import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderEntity } from '../../../entities/folders.entity';

@Injectable()
export class FoldersRepository {
  constructor(
    @InjectRepository(FolderEntity)
    private readonly repository: Repository<FolderEntity>,
  ) {}

  async create(folderData: Partial<FolderEntity>): Promise<FolderEntity> {
    const folder = this.repository.create(folderData);
    return await this.repository.save(folder);
  }

  async findById(id: string): Promise<FolderEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['parent', 'children', 'attachments'],
    });
  }

  async findByName(
    name: string,
    parentId?: string,
  ): Promise<FolderEntity | null> {
    return await this.repository.findOne({
      where: { name, parentId: parentId || null },
    });
  }

  async findRootFolders(): Promise<FolderEntity[]> {
    return await this.repository.find({
      where: { parentId: null },
      relations: ['children', 'attachments'],
      order: { name: 'ASC' },
    });
  }

  async findAllFolders(): Promise<FolderEntity[]> {
    return await this.repository.find({
      relations: ['parent', 'children', 'attachments'],
      order: { name: 'ASC' },
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findOrCreateByPath(
    folderPath: string,
    parentId?: string,
  ): Promise<FolderEntity> {
    const parts = folderPath.split('/').filter((p) => p.length > 0);
    let currentParentId = parentId;

    for (const folderName of parts) {
      let folder = await this.findByName(folderName, currentParentId);

      if (!folder) {
        folder = await this.create({
          name: folderName,
          parentId: currentParentId,
        });
      }

      currentParentId = folder.id;
    }

    return await this.findById(currentParentId);
  }
}
