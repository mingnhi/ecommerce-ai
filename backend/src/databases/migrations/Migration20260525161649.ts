import { Migration } from '@mikro-orm/migrations';

export class Migration20260525161649 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop table if exists \`product_attributes\`;`);

    this.addSql(`alter table \`addresses\` drop foreign key \`addresses_user_id_foreign\`;`);

    this.addSql(`alter table \`permissions\` modify \`description\` nvarchar(255);`);

    this.addSql(`alter table \`products\` drop column \`seo_description\`;`);

    this.addSql(`alter table \`products\` add \`prices\` json null, add \`variants\` json null, add \`attributes\` json null;`);
    this.addSql(`alter table \`products\` change \`seo_title\` \`thumbnail\` varchar(255) null;`);

    this.addSql(`alter table \`product_prices\` drop column \`start_at\`, drop column \`end_at\`;`);

    this.addSql(`alter table \`product_prices\` modify \`original_price\` numeric(12,2) not null, modify \`currency\` varchar(255) not null default 'VND';`);

    this.addSql(`alter table \`orders\` modify \`total_price\` numeric(12,2) not null default '0.00';`);

    this.addSql(`alter table \`addresses\` add constraint \`addresses_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`addresses\` rename index \`Addresses_user_id_index\` to \`addresses_user_id_index\`;`);
    this.addSql(`alter table \`addresses\` rename index \`Addresses_user_id_is_default_index\` to \`addresses_user_id_is_default_index\`;`);

    this.addSql(`alter table \`user_events\` add \`category_id\` varchar(255) not null, add \`price\` numeric(12,2) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table \`product_attributes\` (\`id\` varchar(36) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`product_id\` varchar(36) not null, \`name\` varchar(255) not null, \`value\` varchar(255) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`product_attributes\` add index \`product_attributes_product_id_index\`(\`product_id\`);`);

    this.addSql(`alter table \`product_attributes\` add constraint \`product_attributes_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade on delete no action;`);

    this.addSql(`alter table \`addresses\` drop foreign key \`Addresses_user_id_foreign\`;`);

    this.addSql(`alter table \`addresses\` add constraint \`Addresses_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`addresses\` rename index \`addresses_user_id_index\` to \`Addresses_user_id_index\`;`);
    this.addSql(`alter table \`addresses\` rename index \`addresses_user_id_is_default_index\` to \`Addresses_user_id_is_default_index\`;`);

    this.addSql(`alter table \`orders\` modify \`total_price\` decimal(12,2) not null default 0.00;`);

    this.addSql(`alter table \`permissions\` modify \`description\` varchar(255);`);

    this.addSql(`alter table \`product_prices\` add \`start_at\` datetime null, add \`end_at\` datetime null;`);
    this.addSql(`alter table \`product_prices\` modify \`original_price\` decimal(12,2) null, modify \`currency\` varchar(10) not null default 'VND';`);

    this.addSql(`alter table \`products\` drop column \`prices\`, drop column \`variants\`, drop column \`attributes\`;`);

    this.addSql(`alter table \`products\` add \`seo_description\` text null;`);
    this.addSql(`alter table \`products\` change \`thumbnail\` \`seo_title\` varchar(255) null;`);

    this.addSql(`alter table \`user_events\` drop column \`category_id\`, drop column \`price\`;`);
  }

}
