import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Export } from './export.entity';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(Export)
    private exportRepository: Repository<Export>,
  ) {}

  async create(createExportDto: any): Promise<Export> {
    const exportRecord = this.exportRepository.create(createExportDto);
    return this.exportRepository.save(exportRecord);
  }

  async findAll(): Promise<Export[]> {
    return this.exportRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Export | null> {
    return this.exportRepository.findOne({ where: { id } });
  }

  async update(id: string, updateExportDto: any): Promise<Export> {
    await this.exportRepository.update(id, updateExportDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.exportRepository.delete(id);
  }
}
