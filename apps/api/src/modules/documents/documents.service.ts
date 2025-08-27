import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async create(createDocumentDto: any): Promise<Document> {
    const document = this.documentRepository.create(createDocumentDto);
    return this.documentRepository.save(document);
  }

  async findAll(orgId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { org_id: orgId },
      order: { updated_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Document | null> {
    return this.documentRepository.findOne({ where: { id } });
  }

  async update(id: string, updateDocumentDto: any): Promise<Document> {
    await this.documentRepository.update(id, updateDocumentDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.documentRepository.delete(id);
  }
}
