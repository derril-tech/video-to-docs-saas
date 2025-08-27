import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../documents/document.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async search(query: string, orgId: string): Promise<Document[]> {
    // Full-text search using PostgreSQL
    return this.documentRepository
      .createQueryBuilder('document')
      .where('document.org_id = :orgId', { orgId })
      .andWhere(
        'to_tsvector(\'english\', document.title || \' \' || document.content::text) @@ plainto_tsquery(\'english\', :query)',
        { query }
      )
      .orderBy(
        'ts_rank(to_tsvector(\'english\', document.title || \' \' || document.content::text), plainto_tsquery(\'english\', :query))',
        'DESC'
      )
      .setParameter('query', query)
      .getMany();
  }

  async searchByFilters(filters: any, orgId: string): Promise<Document[]> {
    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .where('document.org_id = :orgId', { orgId });

    if (filters.status) {
      queryBuilder.andWhere('document.status = :status', { status: filters.status });
    }

    if (filters.template_id) {
      queryBuilder.andWhere('document.template_id = :templateId', { templateId: filters.template_id });
    }

    if (filters.created_by) {
      queryBuilder.andWhere('document.created_by = :createdBy', { createdBy: filters.created_by });
    }

    return queryBuilder
      .orderBy('document.updated_at', 'DESC')
      .getMany();
  }
}
