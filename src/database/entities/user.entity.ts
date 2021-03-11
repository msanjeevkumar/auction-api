import { Column, Entity, Generated } from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { BaseEntity } from './base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  public username: string;

  @Generated('uuid')
  @Column()
  public apiKey: string;

  @Column('character varying')
  role: Role;
}
