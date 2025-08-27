import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('exports')
export class Export {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  document_id: string;

  @Column()
  format: string;

  @Column({ nullable: true })
  file_key: string;

  @Column({ type: 'bigint', nullable: true })
  file_size: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column()
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  completed_at: Date;
}
