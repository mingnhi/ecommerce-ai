import { Migration } from '@mikro-orm/migrations';

export class Migration20260513135147 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`permissions\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`name\` varchar(100) not null, \`resource\` varchar(100) not null, \`action\` varchar(50) not null, \`description\` nvarchar(255) null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`permissions\` add unique \`permissions_name_unique\`(\`name\`);`);

    this.addSql(`create table \`roles\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`name\` varchar(100) null, \`description\` varchar(255) null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`role_permissions\` (\`role_id\` varchar(255) not null, \`permission_id\` varchar(255) not null, primary key (\`role_id\`, \`permission_id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`role_permissions\` add index \`role_permissions_role_id_index\`(\`role_id\`);`);
    this.addSql(`alter table \`role_permissions\` add index \`role_permissions_permission_id_index\`(\`permission_id\`);`);

    this.addSql(`create table \`users\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime null, \`email\` varchar(255) not null, \`password_hash\` varchar(255) not null, \`full_name\` varchar(255) null, \`status\` enum('ACTIVE', 'INACTIVE', ' BANNED') not null default 'ACTIVE', \`last_login_at\` datetime null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`users\` add unique \`users_email_unique\`(\`email\`);`);

    this.addSql(`create table \`user_roles\` (\`user_id\` varchar(255) not null, \`role_id\` varchar(255) not null, primary key (\`user_id\`, \`role_id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`user_roles\` add index \`user_roles_user_id_index\`(\`user_id\`);`);
    this.addSql(`alter table \`user_roles\` add index \`user_roles_role_id_index\`(\`role_id\`);`);

    this.addSql(`alter table \`role_permissions\` add constraint \`role_permissions_role_id_foreign\` foreign key (\`role_id\`) references \`roles\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`role_permissions\` add constraint \`role_permissions_permission_id_foreign\` foreign key (\`permission_id\`) references \`permissions\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`user_roles\` add constraint \`user_roles_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`user_roles\` add constraint \`user_roles_role_id_foreign\` foreign key (\`role_id\`) references \`roles\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`role_permissions\` drop foreign key \`role_permissions_permission_id_foreign\`;`);

    this.addSql(`alter table \`role_permissions\` drop foreign key \`role_permissions_role_id_foreign\`;`);

    this.addSql(`alter table \`user_roles\` drop foreign key \`user_roles_role_id_foreign\`;`);

    this.addSql(`alter table \`user_roles\` drop foreign key \`user_roles_user_id_foreign\`;`);

    this.addSql(`drop table if exists \`permissions\`;`);

    this.addSql(`drop table if exists \`roles\`;`);

    this.addSql(`drop table if exists \`role_permissions\`;`);

    this.addSql(`drop table if exists \`users\`;`);

    this.addSql(`drop table if exists \`user_roles\`;`);
  }

}
