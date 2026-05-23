import { Migration } from '@mikro-orm/migrations';

/**
 * Sprint 3–5 (Phong): inventory + cart + order tables.
 *
 * Generated migration was overwritten by hand because MikroORM diff was run
 * against an empty/placeholder DB and produced a full-schema rebuild. Here we
 * keep only the 7 tables owned by S3–S5; other modules (users/products/...)
 * are migrated elsewhere.
 */
export class Migration20260519141351 extends Migration {
  override async up(): Promise<void> {
    // ---------- INVENTORY ----------
    this.addSql(
      "create table `inventories` (" +
        "`id` varchar(36) not null," +
        "`created_at` datetime not null," +
        "`updated_at` datetime null," +
        "`variant_id` varchar(36) not null," +
        "`warehouse_id` varchar(36) null," +
        "`available` int not null default 0," +
        "`reserved` int not null default 0," +
        "`sold` int not null default 0," +
        "`low_stock_threshold` int not null default 10," +
        "primary key (`id`)" +
        ") default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      "alter table `inventories` add unique `inventories_variant_id_unique`(`variant_id`);",
    );

    this.addSql(
      "create table `inventory_movements` (" +
        "`id` varchar(36) not null," +
        "`created_at` datetime not null," +
        "`updated_at` datetime null," +
        "`variant_id` varchar(36) not null," +
        "`warehouse_id` varchar(36) null," +
        "`type` enum('IMPORT','RESERVE','RELEASE','SELL','ADJUST') not null," +
        "`quantity` int not null," +
        "`reference_id` varchar(36) null," +
        "`reference_type` varchar(50) null," +
        "`created_by` varchar(36) null," +
        "`note` text null," +
        "primary key (`id`)" +
        ") default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      "alter table `inventory_movements` add index `inventory_movements_variant_id_created_at_index`(`variant_id`, `created_at`);",
    );

    // ---------- CART ----------
    this.addSql(
      "create table `carts` (" +
        "`id` varchar(36) not null," +
        "`created_at` datetime not null," +
        "`updated_at` datetime null," +
        "`user_id` varchar(36) not null," +
        "`status` enum('ACTIVE','CHECKED_OUT') not null default 'ACTIVE'," +
        "`checked_out_at` datetime null," +
        "primary key (`id`)" +
        ") default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      "alter table `carts` add index `carts_user_id_status_index`(`user_id`, `status`);",
    );

    this.addSql(
      "create table `cart_items` (" +
        "`id` varchar(36) not null," +
        "`created_at` datetime not null," +
        "`updated_at` datetime null," +
        "`cart_id` varchar(36) not null," +
        "`variant_id` varchar(36) not null," +
        "`quantity` int not null," +
        "`price_at_time` numeric(12,2) not null," +
        "primary key (`id`)" +
        ") default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      "alter table `cart_items` add index `cart_items_cart_id_index`(`cart_id`);",
    );

    // ---------- ORDER ----------
    this.addSql(
      "create table `orders` (" +
        "`id` varchar(36) not null," +
        "`created_at` datetime not null," +
        "`updated_at` datetime null," +
        "`user_id` varchar(36) not null," +
        "`status` enum('PENDING','PAID','SHIPPED','COMPLETED','CANCELLED') not null default 'PENDING'," +
        "`subtotal` numeric(12,2) not null default '0.00'," +
        "`voucher_code` varchar(50) null," +
        "`discount_amount` numeric(12,2) not null default '0.00'," +
        "`total_price` numeric(12,2) not null default '0.00'," +
        "`shipping_address` text not null," +
        "`phone` varchar(20) not null," +
        "`note` text null," +
        "`paid_at` datetime null," +
        "`shipped_at` datetime null," +
        "`completed_at` datetime null," +
        "`cancelled_at` datetime null," +
        "primary key (`id`)" +
        ") default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      "alter table `orders` add index `orders_status_index`(`status`);",
    );
    this.addSql(
      "alter table `orders` add index `orders_user_id_created_at_index`(`user_id`, `created_at`);",
    );

    this.addSql(
      "create table `order_items` (" +
        "`id` varchar(36) not null," +
        "`created_at` datetime not null," +
        "`updated_at` datetime null," +
        "`order_id` varchar(36) not null," +
        "`variant_id` varchar(36) not null," +
        "`quantity` int not null," +
        "`price` numeric(12,2) not null," +
        "`subtotal` numeric(12,2) not null," +
        "primary key (`id`)" +
        ") default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      "alter table `order_items` add index `order_items_order_id_index`(`order_id`);",
    );

    this.addSql(
      "create table `order_status_history` (" +
        "`id` varchar(36) not null," +
        "`created_at` datetime not null," +
        "`updated_at` datetime null," +
        "`order_id` varchar(36) not null," +
        "`from_status` enum('PENDING','PAID','SHIPPED','COMPLETED','CANCELLED') null," +
        "`to_status` enum('PENDING','PAID','SHIPPED','COMPLETED','CANCELLED') not null," +
        "`changed_by_actor` enum('USER','ADMIN','SYSTEM') not null," +
        "`changed_by_user_id` varchar(36) null," +
        "`note` text null," +
        "primary key (`id`)" +
        ") default character set utf8mb4 engine = InnoDB;",
    );
    this.addSql(
      "alter table `order_status_history` add index `order_status_history_order_id_index`(`order_id`);",
    );

    // ---------- FOREIGN KEYS ----------
    this.addSql(
      "alter table `cart_items` add constraint `cart_items_cart_id_foreign` foreign key (`cart_id`) references `carts` (`id`) on update cascade on delete cascade;",
    );
    this.addSql(
      "alter table `order_items` add constraint `order_items_order_id_foreign` foreign key (`order_id`) references `orders` (`id`) on update cascade on delete cascade;",
    );
    this.addSql(
      "alter table `order_status_history` add constraint `order_status_history_order_id_foreign` foreign key (`order_id`) references `orders` (`id`) on update cascade on delete cascade;",
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      "alter table `cart_items` drop foreign key `cart_items_cart_id_foreign`;",
    );
    this.addSql(
      "alter table `order_items` drop foreign key `order_items_order_id_foreign`;",
    );
    this.addSql(
      "alter table `order_status_history` drop foreign key `order_status_history_order_id_foreign`;",
    );

    this.addSql("drop table if exists `cart_items`;");
    this.addSql("drop table if exists `carts`;");
    this.addSql("drop table if exists `inventory_movements`;");
    this.addSql("drop table if exists `inventories`;");
    this.addSql("drop table if exists `order_status_history`;");
    this.addSql("drop table if exists `order_items`;");
    this.addSql("drop table if exists `orders`;");
  }
}
