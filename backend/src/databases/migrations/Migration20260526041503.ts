import { Migration } from '@mikro-orm/migrations';

export class Migration20260526041503 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`categories\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`name\` varchar(255) not null, \`slug\` varchar(255) not null, \`is_active\` tinyint(1) not null default true, \`parent_id\` varchar(36) null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`categories\` add unique \`categories_slug_unique\`(\`slug\`);`);
    this.addSql(`alter table \`categories\` add index \`categories_parent_id_index\`(\`parent_id\`);`);

    this.addSql(`create table \`permissions\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`name\` varchar(100) not null, \`resource\` varchar(100) not null, \`action\` varchar(50) not null, \`description\` nvarchar(255) null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`permissions\` add unique \`permissions_name_unique\`(\`name\`);`);

    this.addSql(`create table \`products\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`category_id\` varchar(36) not null, \`name\` varchar(255) not null, \`slug\` varchar(255) not null, \`short_description\` text null, \`description\` text null, \`seo_title\` varchar(255) null, \`seo_description\` text null, \`thumbnail\` varchar(255) null, \`view_count\` int not null default 0, \`is_active\` tinyint(1) not null default true, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`products\` add index \`products_category_id_index\`(\`category_id\`);`);
    this.addSql(`alter table \`products\` add unique \`products_slug_unique\`(\`slug\`);`);

    this.addSql(`create table \`product_attributes\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`product_id\` varchar(36) not null, \`name\` varchar(255) not null, \`value\` varchar(255) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`product_attributes\` add index \`product_attributes_product_id_index\`(\`product_id\`);`);

    this.addSql(`create table \`product_images\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`product_id\` varchar(36) not null, \`image_url\` varchar(255) not null, \`public_id\` varchar(255) not null, \`type\` enum('THUMBNAIL', 'GALLERY', 'ZOOM') not null default 'GALLERY', \`sort_order\` int not null default 0, \`is_primary\` tinyint(1) not null default false, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`product_images\` add index \`product_images_product_id_index\`(\`product_id\`);`);

    this.addSql(`create table \`product_prices\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`product_id\` varchar(36) not null, \`price\` numeric(12,2) not null, \`original_price\` numeric(12,2) null, \`discount_percent\` int null, \`currency\` varchar(255) not null default 'VND', \`is_active\` tinyint(1) not null default true, \`start_at\` datetime null, \`end_at\` datetime null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`product_prices\` add index \`product_prices_product_id_index\`(\`product_id\`);`);

    this.addSql(`create table \`product_variants\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`product_id\` varchar(36) not null, \`title\` varchar(255) not null, \`sku\` varchar(255) not null, \`attributes\` json null, \`stock\` int not null default 0, \`image\` varchar(255) null, \`price\` numeric(12,2) null, \`is_active\` tinyint(1) not null default true, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`product_variants\` add index \`product_variants_product_id_index\`(\`product_id\`);`);
    this.addSql(`alter table \`product_variants\` add unique \`product_variants_sku_unique\`(\`sku\`);`);

    this.addSql(`create table \`inventory_movements\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`variant_id\` varchar(36) not null, \`type\` enum('IMPORT', 'RESERVE', 'RELEASE', 'SELL', 'ADJUST') not null, \`quantity\` int not null, \`reference_id\` varchar(36) null, \`note\` text null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`inventory_movements\` add index \`inventory_movements_variant_id_index\`(\`variant_id\`);`);
    this.addSql(`alter table \`inventory_movements\` add index \`inventory_movements_variant_id_created_at_index\`(\`variant_id\`, \`created_at\`);`);

    this.addSql(`create table \`inventories\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`variant_id\` varchar(36) not null, \`available\` int not null default 0, \`reserved\` int not null default 0, \`sold\` int not null default 0, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`inventories\` add index \`inventories_variant_id_index\`(\`variant_id\`);`);
    this.addSql(`alter table \`inventories\` add unique \`inventories_variant_id_unique\`(\`variant_id\`);`);

    this.addSql(`create table \`roles\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`name\` varchar(100) null, \`description\` varchar(255) null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`role_permissions\` (\`role_id\` varchar(36) not null, \`permission_id\` varchar(36) not null, primary key (\`role_id\`, \`permission_id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`role_permissions\` add index \`role_permissions_role_id_index\`(\`role_id\`);`);
    this.addSql(`alter table \`role_permissions\` add index \`role_permissions_permission_id_index\`(\`permission_id\`);`);

    this.addSql(`create table \`users\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`email\` varchar(255) not null, \`password_hash\` varchar(255) not null, \`full_name\` varchar(255) null, \`status\` enum('ACTIVE', 'INACTIVE', 'BANNED') not null default 'ACTIVE', \`last_login_at\` datetime null, \`refresh_token\` varchar(255) null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`users\` add unique \`users_email_unique\`(\`email\`);`);

    this.addSql(`create table \`product_reviews\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`product_id\` varchar(36) not null, \`user_id\` varchar(36) not null, \`rating\` int not null, \`comment\` text null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`product_reviews\` add index \`product_reviews_product_id_index\`(\`product_id\`);`);
    this.addSql(`alter table \`product_reviews\` add index \`product_reviews_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`otps\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(36) not null, \`otp\` int not null, \`type\` enum('REGISTER', 'FORGOT_PASSWORD') not null, \`expires_at\` datetime not null, \`is_used\` tinyint(1) not null default false, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`otps\` add index \`otps_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`orders\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(36) not null, \`status\` enum('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED') not null default 'PENDING', \`total_price\` numeric(12,2) not null default '0.00', \`shipping_address\` text not null, \`phone\` varchar(20) not null, \`note\` text null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`orders\` add index \`orders_user_id_index\`(\`user_id\`);`);
    this.addSql(`alter table \`orders\` add index \`orders_status_index\`(\`status\`);`);
    this.addSql(`alter table \`orders\` add index \`orders_user_id_created_at_index\`(\`user_id\`, \`created_at\`);`);

    this.addSql(`create table \`payments\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`order_id\` varchar(36) not null, \`method\` enum('VNPAY', 'CASH') not null, \`status\` enum('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') not null default 'PENDING', \`amount\` numeric(12,2) not null, \`transaction_id\` varchar(255) null, \`provider_response\` text null, \`paid_at\` datetime null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`payments\` add index \`payments_order_id_index\`(\`order_id\`);`);

    this.addSql(`create table \`order_items\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`order_id\` varchar(36) not null, \`variant_id\` varchar(36) not null, \`quantity\` int not null, \`price\` numeric(12,2) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`order_items\` add index \`order_items_order_id_index\`(\`order_id\`);`);
    this.addSql(`alter table \`order_items\` add index \`order_items_variant_id_index\`(\`variant_id\`);`);

    this.addSql(`create table \`carts\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(36) not null, \`status\` enum('ACTIVE', 'CHECKED_OUT') not null default 'ACTIVE', primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`carts\` add index \`carts_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`cart_items\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`cart_id\` varchar(36) not null, \`variant_id\` varchar(36) not null, \`quantity\` int not null, \`price_at_time\` numeric(12,2) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`cart_items\` add index \`cart_items_cart_id_index\`(\`cart_id\`);`);
    this.addSql(`alter table \`cart_items\` add index \`cart_items_variant_id_index\`(\`variant_id\`);`);

    this.addSql(`create table \`addresses\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(36) not null, \`full_name\` varchar(100) not null, \`phone\` varchar(20) not null, \`address_line\` varchar(500) not null, \`ward\` varchar(100) null, \`district\` varchar(100) not null, \`province\` varchar(100) not null, \`is_default\` tinyint(1) not null default false, \`is_deleted\` tinyint(1) not null default false, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`addresses\` add index \`addresses_user_id_index\`(\`user_id\`);`);
    this.addSql(`alter table \`addresses\` add index \`addresses_user_id_is_default_index\`(\`user_id\`, \`is_default\`);`);

    this.addSql(`create table \`user_events\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(255) not null, \`product_id\` varchar(255) not null, \`category_id\` varchar(255) not null, \`price\` numeric(12,2) not null, \`event_type\` enum('VIEW', 'CLICK', 'ADD_TO_CART', 'PURCHASE', 'REVIEW') not null, \`score\` float not null default 1, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`user_profiles\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(36) not null, \`phone\` varchar(20) null, \`address\` text null, \`avatar_url\` varchar(500) null, \`date_of_birth\` date null, \`gender\` enum('MALE', 'FEMALE', 'OTHER') null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`user_profiles\` add unique \`user_profiles_user_id_unique\`(\`user_id\`);`);

    this.addSql(`create table \`user_roles\` (\`id\` varchar(36) not null, \`user_id\` varchar(36) not null, \`role_id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, primary key (\`id\`, \`user_id\`, \`role_id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`user_roles\` add index \`user_roles_user_id_index\`(\`user_id\`);`);
    this.addSql(`alter table \`user_roles\` add index \`user_roles_role_id_index\`(\`role_id\`);`);

    this.addSql(`alter table \`categories\` add constraint \`categories_parent_id_foreign\` foreign key (\`parent_id\`) references \`categories\` (\`id\`) on update cascade on delete set null;`);

    this.addSql(`alter table \`products\` add constraint \`products_category_id_foreign\` foreign key (\`category_id\`) references \`categories\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`product_attributes\` add constraint \`product_attributes_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`product_images\` add constraint \`product_images_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`product_prices\` add constraint \`product_prices_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`product_variants\` add constraint \`product_variants_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`inventory_movements\` add constraint \`inventory_movements_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`inventories\` add constraint \`inventories_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`role_permissions\` add constraint \`role_permissions_role_id_foreign\` foreign key (\`role_id\`) references \`roles\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`role_permissions\` add constraint \`role_permissions_permission_id_foreign\` foreign key (\`permission_id\`) references \`permissions\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`product_reviews\` add constraint \`product_reviews_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`product_reviews\` add constraint \`product_reviews_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`otps\` add constraint \`otps_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`orders\` add constraint \`orders_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`payments\` add constraint \`payments_order_id_foreign\` foreign key (\`order_id\`) references \`orders\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`order_items\` add constraint \`order_items_order_id_foreign\` foreign key (\`order_id\`) references \`orders\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`order_items\` add constraint \`order_items_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`carts\` add constraint \`carts_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`cart_items\` add constraint \`cart_items_cart_id_foreign\` foreign key (\`cart_id\`) references \`carts\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`cart_items\` add constraint \`cart_items_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`addresses\` add constraint \`addresses_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`user_profiles\` add constraint \`user_profiles_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`user_roles\` add constraint \`user_roles_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`user_roles\` add constraint \`user_roles_role_id_foreign\` foreign key (\`role_id\`) references \`roles\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`categories\` drop foreign key \`categories_parent_id_foreign\`;`);

    this.addSql(`alter table \`products\` drop foreign key \`products_category_id_foreign\`;`);

    this.addSql(`alter table \`role_permissions\` drop foreign key \`role_permissions_permission_id_foreign\`;`);

    this.addSql(`alter table \`product_attributes\` drop foreign key \`product_attributes_product_id_foreign\`;`);

    this.addSql(`alter table \`product_images\` drop foreign key \`product_images_product_id_foreign\`;`);

    this.addSql(`alter table \`product_prices\` drop foreign key \`product_prices_product_id_foreign\`;`);

    this.addSql(`alter table \`product_variants\` drop foreign key \`product_variants_product_id_foreign\`;`);

    this.addSql(`alter table \`product_reviews\` drop foreign key \`product_reviews_product_id_foreign\`;`);

    this.addSql(`alter table \`inventory_movements\` drop foreign key \`inventory_movements_variant_id_foreign\`;`);

    this.addSql(`alter table \`inventories\` drop foreign key \`inventories_variant_id_foreign\`;`);

    this.addSql(`alter table \`order_items\` drop foreign key \`order_items_variant_id_foreign\`;`);

    this.addSql(`alter table \`cart_items\` drop foreign key \`cart_items_variant_id_foreign\`;`);

    this.addSql(`alter table \`role_permissions\` drop foreign key \`role_permissions_role_id_foreign\`;`);

    this.addSql(`alter table \`user_roles\` drop foreign key \`user_roles_role_id_foreign\`;`);

    this.addSql(`alter table \`product_reviews\` drop foreign key \`product_reviews_user_id_foreign\`;`);

    this.addSql(`alter table \`otps\` drop foreign key \`otps_user_id_foreign\`;`);

    this.addSql(`alter table \`orders\` drop foreign key \`orders_user_id_foreign\`;`);

    this.addSql(`alter table \`carts\` drop foreign key \`carts_user_id_foreign\`;`);

    this.addSql(`alter table \`addresses\` drop foreign key \`addresses_user_id_foreign\`;`);

    this.addSql(`alter table \`user_profiles\` drop foreign key \`user_profiles_user_id_foreign\`;`);

    this.addSql(`alter table \`user_roles\` drop foreign key \`user_roles_user_id_foreign\`;`);

    this.addSql(`alter table \`payments\` drop foreign key \`payments_order_id_foreign\`;`);

    this.addSql(`alter table \`order_items\` drop foreign key \`order_items_order_id_foreign\`;`);

    this.addSql(`alter table \`cart_items\` drop foreign key \`cart_items_cart_id_foreign\`;`);

    this.addSql(`drop table if exists \`categories\`;`);

    this.addSql(`drop table if exists \`permissions\`;`);

    this.addSql(`drop table if exists \`products\`;`);

    this.addSql(`drop table if exists \`product_attributes\`;`);

    this.addSql(`drop table if exists \`product_images\`;`);

    this.addSql(`drop table if exists \`product_prices\`;`);

    this.addSql(`drop table if exists \`product_variants\`;`);

    this.addSql(`drop table if exists \`inventory_movements\`;`);

    this.addSql(`drop table if exists \`inventories\`;`);

    this.addSql(`drop table if exists \`roles\`;`);

    this.addSql(`drop table if exists \`role_permissions\`;`);

    this.addSql(`drop table if exists \`users\`;`);

    this.addSql(`drop table if exists \`product_reviews\`;`);

    this.addSql(`drop table if exists \`otps\`;`);

    this.addSql(`drop table if exists \`orders\`;`);

    this.addSql(`drop table if exists \`payments\`;`);

    this.addSql(`drop table if exists \`order_items\`;`);

    this.addSql(`drop table if exists \`carts\`;`);

    this.addSql(`drop table if exists \`cart_items\`;`);

    this.addSql(`drop table if exists \`addresses\`;`);

    this.addSql(`drop table if exists \`user_events\`;`);

    this.addSql(`drop table if exists \`user_profiles\`;`);

    this.addSql(`drop table if exists \`user_roles\`;`);
  }

}
