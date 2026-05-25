import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { AuditableEntity } from "./base/auditable_entity";
import { PaymentMethod, PaymentStatus } from "@modules/payment/dto/payment.enum";
import { OrderEntity } from "./order.entity";

@Entity({ tableName: 'payments' })
export class Payment extends AuditableEntity {
    @ManyToOne(() => OrderEntity, { fieldName: 'order_id'})
    order!: OrderEntity

    @Enum(() => PaymentMethod)
    method!: PaymentMethod;

    @Enum(() => PaymentStatus)
    status: PaymentStatus = PaymentStatus.PENDING;

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    amount!: number;

    @Property({ nullable: true })
    transactionId?: string;

    @Property({ type: 'text', nullable: true })
    providerResponse?: string;

    @Property({ nullable: true })
    paidAt?: Date;
}