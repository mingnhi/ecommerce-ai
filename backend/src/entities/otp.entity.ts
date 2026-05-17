import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { User } from './user.entity';
import { OtpType } from '@modules/otp/otp.enum';



@Entity({ tableName: 'otps' })
export class Otp extends AuditableEntity {
    @ManyToOne(() => User)
    user!: User;

    @Property({ type: 'integer' })
    otp!: number;

    @Enum({ items: () => OtpType })
    type!: OtpType;

    @Property({ type: 'datetime', fieldName: 'expires_at' })
    expiresAt!: Date;

    @Property({ type: 'boolean', default: false, fieldName: 'is_used' })
    isUsed: boolean = false;
}