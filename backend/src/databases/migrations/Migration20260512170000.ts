import { Migration } from '@mikro-orm/migrations';

/**
 * Manual FK constraints: ràng buộc variant_id ở các bảng inventory/cart/order
 * trỏ tới product_variants(id). Entity vẫn dùng `variantId: string` (không
 * khai báo @ManyToOne) để giảm refactor — DB layer enforce integrity.
 */
export class Migration20260512170000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`inventories\` add constraint \`inventories_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade;`,
    );
    this.addSql(
      `alter table \`inventory_movements\` add constraint \`inventory_movements_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade;`,
    );
    this.addSql(
      `alter table \`cart_items\` add constraint \`cart_items_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade;`,
    );
    this.addSql(
      `alter table \`order_items\` add constraint \`order_items_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table \`order_items\` drop foreign key \`order_items_variant_id_foreign\`;`,
    );
    this.addSql(
      `alter table \`cart_items\` drop foreign key \`cart_items_variant_id_foreign\`;`,
    );
    this.addSql(
      `alter table \`inventory_movements\` drop foreign key \`inventory_movements_variant_id_foreign\`;`,
    );
    this.addSql(
      `alter table \`inventories\` drop foreign key \`inventories_variant_id_foreign\`;`,
    );
  }
}
