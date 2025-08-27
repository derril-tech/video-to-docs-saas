import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './integration.entity';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) {}

  async create(createIntegrationDto: any): Promise<Integration> {
    const integration = this.integrationRepository.create(createIntegrationDto);
    return this.integrationRepository.save(integration);
  }

  async findAll(orgId: string): Promise<Integration[]> {
    return this.integrationRepository.find({
      where: { org_id: orgId },
      order: { updated_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Integration | null> {
    return this.integrationRepository.findOne({ where: { id } });
  }

  async update(id: string, updateIntegrationDto: any): Promise<Integration> {
    await this.integrationRepository.update(id, updateIntegrationDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.integrationRepository.delete(id);
  }
}
