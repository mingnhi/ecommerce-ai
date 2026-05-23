import { Migration } from '@mikro-orm/migrations';

export class Migration20260521000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql('drop table if exists `order_status_history`;');

    this.addSql(
      'alter table `inventories` ' +
        'drop column `warehouse_id`, ' +
        'drop column `low_stock_threshold`;',
    );

    this.addSql(
      'alter table `inventory_movements` ' +
        'drop column `warehouse_id`, ' +
        'drop column `reference_type`, ' +
        'drop column `created_by`;',
    );

    this.addSql('alter table `carts` drop column `checked_out_at`;');

    this.addSql(
      'alter table `orders` ' +
        'drop column `subtotal`, ' +
        'drop column `voucher_code`, ' +
        'drop column `discount_amount`, ' +
        'drop column `paid_at`, ' +
        'drop column `shipped_at`, ' +
        'drop column `completed_at`, ' +
        'drop column `cancelled_at`;',
    );

    this.addSql('alter table `order_items` drop column `subtotal`;');
  }

  override async down(): Promise<void> {
    this.addSql(
      'alter table `order_items` ' +
        "add column `subtotal` numeric(12,2) not null default '0.00';",
    );

    this.addSql(
      'alter table `orders` ' +
        "add column `subtotal` numeric(12,2) not null default '0.00', " +
        'add column `voucher_code` varchar(50) null, ' +
        "add column `discount_amount` numeric(12,2) not null default '0.00', " +
        'add column `paid_at` datetime null, ' +
        'add column `shipped_at` datetime null, ' +
        'add column `completed_at` datetime null, ' +
        'add column `cancelled_at` datetime null;',
    );

    this.addSql(
      'alter table `carts` add column `checked_out_at` datetime null;',
    );

    this.addSql(
      'alter table `inventory_movements` ' +
        'add column `warehouse_id` varchar(36) null, ' +
        'add column `reference_type` varchar(50) null, ' +
        'add column `created_by` varchar(36) null;',
    );

    this.addSql(
      'alter table `inventories` ' +
        'add column `warehouse_id` varchar(36) null, ' +
        'add column `low_stock_threshold` int not null default 10;',
    );

    this.addSql(
      'create table `order_status_history` (' +
        '`id` varchar(36) not null, ' +
        '`created_at` datetime not null default current_timestamp, ' +
        '`updated_at` datetime not null default current_timestamp on update current_timestamp, ' +
        "`order_id` varchar(36) not null, " +
        "`from_status` enum('PENDING','PAID','SHIPPED','COMPLETED','CANCELLED') null, " +
        "`to_status` enum('PENDING','PAID','SHIPPED','COMPLETED','CANCELLED') not null, " +
        "`changed_by_actor` enum('USER','ADMIN','SYSTEM') not null, " +
        '`changed_by_user_id` varchar(36) null, ' +
        '`note` text null, ' +
        'primary key (`id`), ' +
        'constraint `order_status_history_order_id_foreign` ' +
        'foreign key (`order_id`) references `orders` (`id`) on update cascade' +
        ');',
    );
  }
}
