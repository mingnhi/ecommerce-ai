import { Migration } from '@mikro-orm/migrations';

export class Migration20260526002053 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop table if exists \`addresses\`;`);

    this.addSql(`drop table if exists \`cart_items\`;`);

    this.addSql(`drop table if exists \`carts\`;`);

    this.addSql(`drop table if exists \`inventories\`;`);

    this.addSql(`drop table if exists \`inventory_movements\`;`);

    this.addSql(`drop table if exists \`order_items\`;`);

    this.addSql(`drop table if exists \`orders\`;`);

    this.addSql(`drop table if exists \`payments\`;`);

    this.addSql(`drop table if exists \`user_events\`;`);

    this.addSql(`alter table \`permissions\` modify \`description\` nvarchar(255);`);

    this.addSql(`alter table \`products\` add \`thumbnail\` varchar(255) null;`);

    this.addSql(`alter table \`product_prices\` modify \`currency\` varchar(255) not null default 'VND';`);

    this.addSql(`alter table \`Addresses\` add constraint \`Addresses_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table \`addresses\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(36) not null, \`full_name\` varchar(100) not null, \`phone\` varchar(20) not null, \`address_line\` varchar(500) not null, \`ward\` varchar(100) null, \`district\` varchar(100) not null, \`province\` varchar(100) not null, \`is_default\` tinyint(1) not null default false, \`is_deleted\` tinyint(1) not null default false, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`addresses\` add index \`Addresses_user_id_index\`(\`user_id\`);`);
    this.addSql(`alter table \`addresses\` add index \`Addresses_user_id_is_default_index\`(\`user_id\`, \`is_default\`);`);

    this.addSql(`create table \`cart_items\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`cart_id\` varchar(36) not null, \`variant_id\` varchar(36) not null, \`quantity\` int not null, \`price_at_time\` decimal(12,2) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`cart_items\` add index \`cart_items_cart_id_index\`(\`cart_id\`);`);
    this.addSql(`alter table \`cart_items\` add index \`cart_items_variant_id_index\`(\`variant_id\`);`);

    this.addSql(`create table \`carts\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(36) not null, \`status\` enum('ACTIVE', 'CHECKED_OUT') not null default 'ACTIVE', primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`carts\` add index \`carts_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`inventories\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`variant_id\` varchar(36) not null, \`available\` int not null default 0, \`reserved\` int not null default 0, \`sold\` int not null default 0, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`inventories\` add index \`inventories_variant_id_index\`(\`variant_id\`);`);
    this.addSql(`alter table \`inventories\` add unique \`inventories_variant_id_unique\`(\`variant_id\`);`);

    this.addSql(`create table \`inventory_movements\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`variant_id\` varchar(36) not null, \`type\` enum('IMPORT', 'RESERVE', 'RELEASE', 'SELL', 'ADJUST') not null, \`quantity\` int not null, \`reference_id\` varchar(36) null, \`note\` text null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`inventory_movements\` add index \`inventory_movements_variant_id_created_at_index\`(\`variant_id\`, \`created_at\`);`);
    this.addSql(`alter table \`inventory_movements\` add index \`inventory_movements_variant_id_index\`(\`variant_id\`);`);

    this.addSql(`create table \`order_items\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`order_id\` varchar(36) not null, \`variant_id\` varchar(36) not null, \`quantity\` int not null, \`price\` decimal(12,2) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`order_items\` add index \`order_items_order_id_index\`(\`order_id\`);`);
    this.addSql(`alter table \`order_items\` add index \`order_items_variant_id_index\`(\`variant_id\`);`);

    this.addSql(`create table \`orders\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(36) not null, \`status\` enum('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED') not null default 'PENDING', \`total_price\` decimal(12,2) not null default 0.00, \`shipping_address\` text not null, \`phone\` varchar(20) not null, \`note\` text null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`orders\` add index \`orders_status_index\`(\`status\`);`);
    this.addSql(`alter table \`orders\` add index \`orders_user_id_created_at_index\`(\`user_id\`, \`created_at\`);`);
    this.addSql(`alter table \`orders\` add index \`orders_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`payments\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`order_id\` varchar(36) not null, \`method\` enum('VNPAY', 'CASH') not null, \`status\` enum('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') not null default 'PENDING', \`amount\` decimal(12,2) not null, \`transaction_id\` varchar(255) null, \`provider_response\` text null, \`paid_at\` datetime null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`payments\` add index \`payments_order_id_index\`(\`order_id\`);`);

    this.addSql(`create table \`user_events\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(255) not null, \`product_id\` varchar(255) not null, \`event_type\` enum('VIEW', 'CLICK', 'ADD_TO_CART', 'PURCHASE', 'REVIEW') not null, \`score\` float not null default 1, \`category_id\` varchar(255) not null, \`price\` decimal(12,2) not null default 0.00, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`alter table \`addresses\` add constraint \`Addresses_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`cart_items\` add constraint \`cart_items_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade on delete no action;`);

    this.addSql(`alter table \`carts\` add constraint \`carts_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete no action;`);

    this.addSql(`alter table \`inventories\` add constraint \`inventories_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`inventory_movements\` add constraint \`inventory_movements_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade on delete no action;`);

    this.addSql(`alter table \`order_items\` add constraint \`order_items_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade on delete no action;`);

    this.addSql(`alter table \`orders\` add constraint \`orders_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete no action;`);

    this.addSql(`alter table \`Addresses\` drop foreign key \`Addresses_user_id_foreign\`;`);

    this.addSql(`alter table \`permissions\` modify \`description\` varchar(255);`);

    this.addSql(`alter table \`product_prices\` modify \`currency\` varchar(10) not null default 'VND';`);

    this.addSql(`alter table \`products\` drop column \`thumbnail\`;`);
  }

}
