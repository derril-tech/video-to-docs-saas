import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async create(createTemplateDto: any): Promise<Template> {
    const template = this.templateRepository.create(createTemplateDto);
    return this.templateRepository.save(template);
  }

  async findAll(orgId?: string): Promise<Template[]> {
    const where: any = {};
    if (orgId) {
      where.org_id = orgId;
    } else {
      where.is_public = true;
    }
    
    return this.templateRepository.find({
      where,
      order: { updated_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Template | null> {
    return this.templateRepository.findOne({ where: { id } });
  }

  async update(id: string, updateTemplateDto: any): Promise<Template> {
    await this.templateRepository.update(id, updateTemplateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.templateRepository.delete(id);
  }
}
