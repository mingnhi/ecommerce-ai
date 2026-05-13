import { Migration } from '@mikro-orm/migrations';

export class Migration20260514120000 extends Migration {

  override async up(): Promise<void> {
    // 1. Tạo bảng vouchers
    this.addSql(`create table \`vouchers\` (
      \`id\` varchar(255) not null,
      \`created_at\` datetime not null,
      \`updated_at\` datetime null,
      \`code\` varchar(50) not null,
      \`description\` varchar(200) null,
      \`discount_type\` enum('PERCENT', 'FIXED') not null,
      \`discount_value\` decimal(12, 2) not null,
      \`min_order_amount\` decimal(12, 2) not null default '0.00',
      \`max_discount\` decimal(12, 2) null,
      \`valid_from\` datetime null,
      \`valid_until\` datetime null,
      \`usage_limit\` int null,
      \`usage_count\` int not null default 0,
      \`is_active\` tinyint(1) not null default 1,
      primary key (\`id\`)
    ) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`alter table \`vouchers\` add unique \`vouchers_code_unique\`(\`code\`);`);
    this.addSql(`alter table \`vouchers\` add index \`vouchers_code_index\`(\`code\`);`);

    // 2. Thêm các cột voucher/discount vào orders
    this.addSql(`alter table \`orders\`
      add \`subtotal\` decimal(12, 2) not null default '0.00',
      add \`discount_amount\` decimal(12, 2) not null default '0.00',
      add \`voucher_code\` varchar(50) null;`);

    // Backfill subtotal = total_price cho đơn cũ (chưa có voucher → subtotal = total)
    this.addSql(`update \`orders\` set \`subtotal\` = \`total_price\` where \`subtotal\` = 0;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`orders\` drop column \`subtotal\`, drop column \`discount_amount\`, drop column \`voucher_code\`;`);
    this.addSql(`drop table if exists \`vouchers\`;`);
  }

}
