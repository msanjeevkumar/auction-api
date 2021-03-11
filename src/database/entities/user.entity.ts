import { BaseEntity } from './base.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { Role } from '../../common/enums/role.enum';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  public email: string;

  @Column()
  @Exclude()
  public password: string;

  @Column('character varying')
  role: Role;
}
