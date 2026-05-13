import { Entity, Enum, OneToMany, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = ' BANNED',
}
@Entity({ tableName: 'users' })
export class User extends AuditableEntity {
  @Property({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Property({ type: 'varchar', length: 255, fieldName: 'password_hash' })
  passwordHash!: string;

  @Property({
    type: 'varchar',
    length: 255,
    nullable: true,
    fieldName: 'full_name',
  })
  fullName?: string;

  @Enum({ items: () => UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus = UserStatus.ACTIVE;

  @Property({ type: 'datetime', nullable: true, fieldName: 'last_login_at' })
  lastLoginAt?: Date;

  // @OneToMany(())
}
