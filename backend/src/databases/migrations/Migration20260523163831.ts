import { Migration } from '@mikro-orm/migrations';

export class Migration20260523163831 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`permissions\` modify \`description\` nvarchar(255);`);

    this.addSql(`alter table \`users\` modify \`id\` varchar(36) not null;`);

    this.addSql(`alter table \`otps\` modify \`id\` varchar(36) not null, modify \`user_id\` varchar(36) not null;`);
    this.addSql(`alter table \`otps\` add constraint \`otps_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`orders\` modify \`total_price\` numeric(12,2) not null default '0.00';`);
    this.addSql(`alter table \`orders\` add index \`orders_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`payments\` drop column \`response_code\`, drop column \`bank_code\`, drop column \`pay_date\`;`);

    this.addSql(`alter table \`payments\` add \`order_id\` varchar(36) not null;`);
    this.addSql(`alter table \`payments\` modify \`status\` enum('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') not null default 'PENDING';`);
    this.addSql(`alter table \`payments\` add constraint \`payments_order_id_foreign\` foreign key (\`order_id\`) references \`orders\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`payments\` add index \`payments_order_id_index\`(\`order_id\`);`);

    this.addSql(`alter table \`order_items\` add constraint \`order_items_order_id_foreign\` foreign key (\`order_id\`) references \`orders\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`order_items\` rename index \`order_items_variant_id_foreign\` to \`order_items_variant_id_index\`;`);

    this.addSql(`alter table \`carts\` drop index \`carts_user_id_status_index\`;`);

    this.addSql(`alter table \`carts\` add index \`carts_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`cart_items\` add constraint \`cart_items_cart_id_foreign\` foreign key (\`cart_id\`) references \`carts\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`cart_items\` rename index \`cart_items_variant_id_foreign\` to \`cart_items_variant_id_index\`;`);

    this.addSql(`alter table \`addresses\` add constraint \`addresses_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`addresses\` rename index \`Addresses_user_id_index\` to \`addresses_user_id_index\`;`);
    this.addSql(`alter table \`addresses\` rename index \`Addresses_user_id_is_default_index\` to \`addresses_user_id_is_default_index\`;`);

    this.addSql(`alter table \`user_profiles\` modify \`id\` varchar(36) not null, modify \`user_id\` varchar(36) not null;`);
    this.addSql(`alter table \`user_profiles\` add constraint \`user_profiles_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`user_roles\` modify \`id\` varchar(36) not null, modify \`user_id\` varchar(36) not null, modify \`role_id\` varchar(36) not null;`);
    this.addSql(`alter table \`user_roles\` add constraint \`user_roles_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`user_roles\` add constraint \`user_roles_role_id_foreign\` foreign key (\`role_id\`) references \`roles\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`addresses\` drop foreign key \`addresses_user_id_foreign\`;`);

    this.addSql(`alter table \`cart_items\` drop foreign key \`cart_items_cart_id_foreign\`;`);

    this.addSql(`alter table \`order_items\` drop foreign key \`order_items_order_id_foreign\`;`);

    this.addSql(`alter table \`otps\` drop foreign key \`otps_user_id_foreign\`;`);

    this.addSql(`alter table \`payments\` drop foreign key \`payments_order_id_foreign\`;`);

    this.addSql(`alter table \`user_profiles\` drop foreign key \`user_profiles_user_id_foreign\`;`);

    this.addSql(`alter table \`user_roles\` drop foreign key \`user_roles_user_id_foreign\`;`);
    this.addSql(`alter table \`user_roles\` drop foreign key \`user_roles_role_id_foreign\`;`);

    this.addSql(`alter table \`addresses\` rename index \`addresses_user_id_index\` to \`Addresses_user_id_index\`;`);
    this.addSql(`alter table \`addresses\` rename index \`addresses_user_id_is_default_index\` to \`Addresses_user_id_is_default_index\`;`);

    this.addSql(`alter table \`cart_items\` rename index \`cart_items_variant_id_index\` to \`cart_items_variant_id_foreign\`;`);

    this.addSql(`alter table \`carts\` drop index \`carts_user_id_index\`;`);

    this.addSql(`alter table \`carts\` add index \`carts_user_id_status_index\`(\`user_id\`, \`status\`);`);

    this.addSql(`alter table \`order_items\` rename index \`order_items_variant_id_index\` to \`order_items_variant_id_foreign\`;`);

    this.addSql(`alter table \`orders\` drop index \`orders_user_id_index\`;`);

    this.addSql(`alter table \`orders\` modify \`total_price\` decimal(12,2) not null default 0.00;`);

    this.addSql(`alter table \`otps\` modify \`id\` varchar(255) not null, modify \`user_id\` varchar(255) not null;`);

    this.addSql(`alter table \`payments\` drop index \`payments_order_id_index\`;`);
    this.addSql(`alter table \`payments\` drop column \`order_id\`;`);

    this.addSql(`alter table \`payments\` add \`response_code\` varchar(255) null, add \`bank_code\` varchar(255) null, add \`pay_date\` varchar(255) null;`);
    this.addSql(`alter table \`payments\` modify \`status\` enum('PENDING', 'COMPLETED', 'FAILED') not null default 'PENDING';`);

    this.addSql(`alter table \`permissions\` modify \`description\` varchar(255);`);

    this.addSql(`alter table \`user_profiles\` modify \`id\` varchar(255) not null, modify \`user_id\` varchar(255) not null;`);

    this.addSql(`alter table \`user_roles\` modify \`id\` varchar(255) not null, modify \`user_id\` varchar(255) not null, modify \`role_id\` varchar(255) not null;`);

    this.addSql(`alter table \`users\` modify \`id\` varchar(255) not null;`);
  }

}
