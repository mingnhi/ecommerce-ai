import { Migration } from '@mikro-orm/migrations';

export class Migration20260510081912 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`orders\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(255) not null, \`status\` enum('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED') not null default 'PENDING', \`total_price\` numeric(12,2) not null, \`shipping_address\` varchar(1000) null, \`phone\` varchar(20) null, \`note\` varchar(500) null, \`paid_at\` datetime null, \`shipped_at\` datetime null, \`completed_at\` datetime null, \`cancelled_at\` datetime null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`orders\` add index \`orders_status_created_at_index\`(\`status\`, \`created_at\`);`);
    this.addSql(`alter table \`orders\` add index \`orders_user_id_created_at_index\`(\`user_id\`, \`created_at\`);`);

    this.addSql(`create table \`order_items\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`order_id\` varchar(255) not null, \`variant_id\` varchar(255) not null, \`variant_snapshot\` varchar(1000) null, \`quantity\` int not null, \`price\` numeric(12,2) not null, \`subtotal\` numeric(12,2) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`order_items\` add index \`order_items_order_id_index\`(\`order_id\`);`);
    this.addSql(`alter table \`order_items\` add index \`order_items_variant_id_index\`(\`variant_id\`);`);

    this.addSql(`create table \`order_status_history\` (\`id\` varchar(255) not null, \`order_id\` varchar(255) not null, \`from_status\` enum('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED') null, \`to_status\` enum('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED') not null, \`changed_by_actor\` enum('SYSTEM', 'ADMIN', 'USER') not null, \`changed_by_user_id\` varchar(255) null, \`note\` varchar(500) null, \`created_at\` datetime not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`order_status_history\` add index \`order_status_history_order_id_index\`(\`order_id\`);`);

    this.addSql(`alter table \`order_items\` add constraint \`order_items_order_id_foreign\` foreign key (\`order_id\`) references \`orders\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`order_status_history\` add constraint \`order_status_history_order_id_foreign\` foreign key (\`order_id\`) references \`orders\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`order_items\` drop foreign key \`order_items_order_id_foreign\`;`);

    this.addSql(`alter table \`order_status_history\` drop foreign key \`order_status_history_order_id_foreign\`;`);

    this.addSql(`drop table if exists \`orders\`;`);

    this.addSql(`drop table if exists \`order_items\`;`);

    this.addSql(`drop table if exists \`order_status_history\`;`);
  }

}
