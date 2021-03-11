import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAtUtc: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @UpdateDateColumn({ nullable: true, type: 'timestamp with time zone' })
  modifiedAtUtc: Date;
}
