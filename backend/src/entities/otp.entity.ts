import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { AuditableEntity } from './base/auditable_entity';
import { User } from './user.entity';

export enum OtpType {
    REGISTER = 'REGISTER',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

@Entity({ tableName: 'otps' })
export class Otp extends AuditableEntity {
    @ManyToOne(() => User)
    user!: User;

    @Property({ type: 'varchar', length: 255, fieldName: 'otp_hash' })
    otpHash!: string;

    @Enum({ items: () => OtpType })
    type!: OtpType;

    @Property({ type: 'datetime', fieldName: 'expires_at' })
    expiresAt!: Date;

    @Property({ type: 'boolean', default: false, fieldName: 'is_used' })
    isUsed: boolean = false;
}