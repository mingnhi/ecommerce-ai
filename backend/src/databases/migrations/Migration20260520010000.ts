import { Migration } from '@mikro-orm/migrations';

export class Migration20260520010000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'alter table `inventories` ' +
        'add constraint `inventories_variant_id_foreign` ' +
        'foreign key (`variant_id`) references `product_variants` (`id`) ' +
        'on update cascade on delete cascade;',
    );

    this.addSql(
      'alter table `inventory_movements` ' +
        'add constraint `inventory_movements_variant_id_foreign` ' +
        'foreign key (`variant_id`) references `product_variants` (`id`) ' +
        'on update cascade;',
    );

    this.addSql(
      'alter table `carts` ' +
        'add constraint `carts_user_id_foreign` ' +
        'foreign key (`user_id`) references `users` (`id`) ' +
        'on update cascade;',
    );

    this.addSql(
      'alter table `cart_items` ' +
        'add constraint `cart_items_variant_id_foreign` ' +
        'foreign key (`variant_id`) references `product_variants` (`id`) ' +
        'on update cascade;',
    );

    this.addSql(
      'alter table `orders` ' +
        'add constraint `orders_user_id_foreign` ' +
        'foreign key (`user_id`) references `users` (`id`) ' +
        'on update cascade;',
    );

    this.addSql(
      'alter table `order_items` ' +
        'add constraint `order_items_variant_id_foreign` ' +
        'foreign key (`variant_id`) references `product_variants` (`id`) ' +
        'on update cascade;',
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      'alter table `order_items` drop foreign key `order_items_variant_id_foreign`;',
    );
    this.addSql(
      'alter table `orders` drop foreign key `orders_user_id_foreign`;',
    );
    this.addSql(
      'alter table `cart_items` drop foreign key `cart_items_variant_id_foreign`;',
    );
    this.addSql(
      'alter table `carts` drop foreign key `carts_user_id_foreign`;',
    );
    this.addSql(
      'alter table `inventory_movements` drop foreign key `inventory_movements_variant_id_foreign`;',
    );
    this.addSql(
      'alter table `inventories` drop foreign key `inventories_variant_id_foreign`;',
    );
  }
}
