import { Migration } from '@mikro-orm/migrations';

export class Migration20260514102820 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`users\` add \`is_email_verified\` tinyint(1) not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`users\` drop column \`is_email_verified\`;`);
  }

}
