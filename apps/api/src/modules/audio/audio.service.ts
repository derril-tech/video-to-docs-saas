import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioBlob } from './audio-blob.entity';

@Injectable()
export class AudioService {
  constructor(
    @InjectRepository(AudioBlob)
    private audioBlobRepository: Repository<AudioBlob>,
  ) {}

  async create(createAudioBlobDto: any): Promise<AudioBlob> {
    const audioBlob = this.audioBlobRepository.create(createAudioBlobDto);
    return this.audioBlobRepository.save(audioBlob);
  }

  async findAll(orgId: string): Promise<AudioBlob[]> {
    return this.audioBlobRepository.find({
      where: { org_id: orgId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AudioBlob | null> {
    return this.audioBlobRepository.findOne({ where: { id } });
  }

  async update(id: string, updateAudioBlobDto: any): Promise<AudioBlob> {
    await this.audioBlobRepository.update(id, updateAudioBlobDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.audioBlobRepository.delete(id);
  }
}
