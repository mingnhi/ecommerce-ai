import { Migration } from '@mikro-orm/migrations';

export class Migration20260513023337 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`Addresses\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(255) not null, \`full_name\` varchar(100) not null, \`phone\` varchar(20) not null, \`address_line\` varchar(500) not null, \`ward\` varchar(100) null, \`district\` varchar(100) not null, \`province\` varchar(100) not null, \`is_default\` tinyint(1) not null default false, \`is_deleted\` tinyint(1) not null default false, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`Addresses\` add index \`Addresses_user_id_index\`(\`user_id\`);`);
    this.addSql(`alter table \`Addresses\` add index \`Addresses_user_id_is_default_index\`(\`user_id\`, \`is_default\`);`);

    this.addSql(`alter table \`Addresses\` add constraint \`Addresses_user_id_foreign\` foreign key (\`user_id\`) references \`Users\` (\`id\`) on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`Addresses\`;`);
  }

}
