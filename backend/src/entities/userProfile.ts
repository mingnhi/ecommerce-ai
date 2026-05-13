import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { User } from './user.entity';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity({ tableName: 'user_profiles' })
export class UserProfile extends AuditableEntity {
  @OneToOne(() => User, {
    owner: true,
    unique: true,
    fieldName: 'user_id',
  })
  user!: User;

  @Property({ type: 'varchar', length: 20, nullable: true })
  phone?: string;
}
