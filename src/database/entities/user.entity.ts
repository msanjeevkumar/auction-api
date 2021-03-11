import { Exclude } from 'class-transformer';
import { BaseEntity } from './base.entity';
import { BeforeInsert, Column, Entity, Generated } from 'typeorm';
import { Role } from '../../common/enums/role.enum';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  public username: string;

  @Generated('uuid')
  @Column()
  @Exclude()
  public apiKey: string;

  @Column('character varying')
  role: Role;
}
