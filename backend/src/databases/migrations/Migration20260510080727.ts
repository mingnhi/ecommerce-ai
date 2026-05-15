import { Migration } from '@mikro-orm/migrations';

export class Migration20260510080727 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`carts\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(255) not null, \`status\` enum('ACTIVE', 'CHECKED_OUT', 'ABANDONED') not null default 'ACTIVE', \`checked_out_at\` datetime null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`carts\` add index \`carts_user_id_status_index\`(\`user_id\`, \`status\`);`);

    this.addSql(`create table \`cart_items\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`cart_id\` varchar(255) not null, \`variant_id\` varchar(255) not null, \`quantity\` int not null, \`price_at_time\` numeric(12,2) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`cart_items\` add index \`cart_items_cart_id_index\`(\`cart_id\`);`);
    this.addSql(`alter table \`cart_items\` add unique \`cart_items_cart_id_variant_id_unique\`(\`cart_id\`, \`variant_id\`);`);

    this.addSql(`create table \`inventories\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`variant_id\` varchar(255) not null, \`warehouse_id\` varchar(255) null, \`available\` int not null default 0, \`reserved\` int not null default 0, \`sold\` int not null default 0, \`low_stock_threshold\` int not null default 10, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`inventories\` add index \`inventories_available_index\`(\`available\`);`);
    this.addSql(`alter table \`inventories\` add unique \`inventories_variant_id_warehouse_id_unique\`(\`variant_id\`, \`warehouse_id\`);`);

    this.addSql(`create table \`inventory_movements\` (\`id\` varchar(255) not null, \`variant_id\` varchar(255) not null, \`warehouse_id\` varchar(255) null, \`type\` enum('IMPORT', 'RESERVE', 'RELEASE', 'SELL', 'ADJUST') not null, \`quantity\` int not null, \`reference_id\` varchar(255) null, \`reference_type\` varchar(255) null, \`created_by\` varchar(255) null, \`note\` varchar(500) null, \`created_at\` datetime not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`inventory_movements\` add index \`inventory_movements_reference_id_type_index\`(\`reference_id\`, \`type\`);`);
    this.addSql(`alter table \`inventory_movements\` add index \`inventory_movements_variant_id_created_at_index\`(\`variant_id\`, \`created_at\`);`);

    this.addSql(`create table \`Users\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`email\` varchar(255) not null, \`username\` varchar(255) null, \`password\` varchar(255) not null, \`is_email_confirmed\` tinyint(1) not null default false, \`last_login_at\` date null, \`is_active\` tinyint(1) not null default true, \`is_deleted\` tinyint(1) not null default false, \`display_name\` varchar(255) null, \`avatar_url\` varchar(255) null, \`preferred_locale\` varchar(255) null, \`google_id\` varchar(255) null, \`linked_in_id\` varchar(255) null, \`refresh_token\` varchar(1000) null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`Users\` add unique \`Users_email_unique\`(\`email\`);`);

    this.addSql(`alter table \`cart_items\` add constraint \`cart_items_cart_id_foreign\` foreign key (\`cart_id\`) references \`carts\` (\`id\`) on update cascade;`);
  }

}
