import { Migration } from '@mikro-orm/migrations';

export class Migration20260513162641 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`user_profiles\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`user_id\` varchar(255) not null, \`phone\` varchar(20) null, \`address\` text null, \`avatar_url\` varchar(500) null, \`date_of_birth\` date null, \`gender\` enum('MALE', 'FEMALE', 'OTHER') null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`user_profiles\` add unique \`user_profiles_user_id_unique\`(\`user_id\`);`);

    this.addSql(`alter table \`user_profiles\` add constraint \`user_profiles_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`permissions\` modify \`description\` nvarchar(255);`);

    this.addSql(`alter table \`users\` add \`refresh_token\` varchar(255) null;`);

    this.addSql(`alter table \`user_roles\` drop primary key;`);

    this.addSql(`alter table \`user_roles\` add \`id\` varchar(255) not null, add \`created_at\` datetime not null, add \`updated_at\` datetime null;`);
    this.addSql(`alter table \`user_roles\` add primary key \`user_roles_pkey\`(\`id\`, \`user_id\`, \`role_id\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`user_profiles\`;`);

    this.addSql(`alter table \`permissions\` modify \`description\` varchar(255);`);

    this.addSql(`alter table \`user_roles\` drop primary key;`);
    this.addSql(`alter table \`user_roles\` drop column \`id\`, drop column \`created_at\`, drop column \`updated_at\`;`);

    this.addSql(`alter table \`user_roles\` add primary key \`user_roles_pkey\`(\`user_id\`, \`role_id\`);`);

    this.addSql(`alter table \`users\` drop column \`refresh_token\`;`);
  }

}
