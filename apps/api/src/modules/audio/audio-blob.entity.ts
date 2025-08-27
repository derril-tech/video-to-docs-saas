import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audio_blobs')
export class AudioBlob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  org_id: string;

  @Column({ nullable: true })
  document_id: string;

  @Column()
  file_key: string;

  @Column('bigint')
  file_size: number;

  @Column({ type: 'float', nullable: true })
  duration: number;

  @Column({ nullable: true })
  sample_rate: number;

  @Column({ nullable: true })
  channels: number;

  @Column({ nullable: true })
  format: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
