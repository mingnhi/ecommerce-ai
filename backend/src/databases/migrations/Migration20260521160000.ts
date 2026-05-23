import { Migration } from '@mikro-orm/migrations';

export class Migration20260521160000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'alter table `carts` rename index `carts_user_id_foreign` to `carts_user_id_index`;',
    );
    this.addSql(
      'alter table `cart_items` rename index `cart_items_variant_id_foreign` to `cart_items_variant_id_index`;',
    );
    this.addSql(
      'alter table `order_items` rename index `order_items_variant_id_foreign` to `order_items_variant_id_index`;',
    );

    this.addSql(
      'alter table `inventories` add index `inventories_variant_id_index`(`variant_id`);',
    );
    this.addSql(
      'alter table `inventory_movements` add index `inventory_movements_variant_id_index`(`variant_id`);',
    );
    this.addSql(
      'alter table `orders` add index `orders_user_id_index`(`user_id`);',
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      'alter table `orders` drop index `orders_user_id_index`;',
    );
    this.addSql(
      'alter table `inventory_movements` drop index `inventory_movements_variant_id_index`;',
    );
    this.addSql(
      'alter table `inventories` drop index `inventories_variant_id_index`;',
    );

    this.addSql(
      'alter table `order_items` rename index `order_items_variant_id_index` to `order_items_variant_id_foreign`;',
    );
    this.addSql(
      'alter table `cart_items` rename index `cart_items_variant_id_index` to `cart_items_variant_id_foreign`;',
    );
    this.addSql(
      'alter table `carts` rename index `carts_user_id_index` to `carts_user_id_foreign`;',
    );
  }
}
