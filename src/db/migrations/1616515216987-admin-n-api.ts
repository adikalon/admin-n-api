import {MigrationInterface, QueryRunner} from "typeorm";

export class adminNApi1616515216987 implements MigrationInterface {
    name = 'adminNApi1616515216987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "register_phone" ("id" BIGSERIAL NOT NULL, "phone" bigint NOT NULL, "code" character varying NOT NULL, "userId" bigint, "ip" character varying NOT NULL, "userAgent" character varying NOT NULL, "activeTo" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_53f789fd7209581124724b71e76" UNIQUE ("code"), CONSTRAINT "PK_9d41131eeb25f2bfe022c8e2fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "register_email" ("id" BIGSERIAL NOT NULL, "email" character varying NOT NULL, "code" character varying NOT NULL, "userId" bigint, "ip" character varying NOT NULL, "userAgent" character varying NOT NULL, "activeTo" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c5bac33fbf20e943e30f3ddf9a9" UNIQUE ("code"), CONSTRAINT "PK_17a53e8eda8d169dbe8d98454be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" BIGSERIAL NOT NULL, "phone" bigint, "email" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "authorization" ("id" BIGSERIAL NOT NULL, "userId" bigint, "ip" character varying NOT NULL, "userAgent" character varying NOT NULL, "token" character varying NOT NULL, "activeTo" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_a8d63597e7e3428b50eda82cbaa" UNIQUE ("token"), CONSTRAINT "PK_a8a47afd6ac0d056caccc1e9d22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "change_email" ("id" BIGSERIAL NOT NULL, "email" character varying NOT NULL, "code" character varying NOT NULL, "userId" bigint, "ip" character varying NOT NULL, "userAgent" character varying NOT NULL, "activeTo" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_47b994101e2c352cbbc9a1fffc1" UNIQUE ("code"), CONSTRAINT "PK_a69f0e6835dd4f5fc7faf61560c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "change_phone" ("id" BIGSERIAL NOT NULL, "phone" bigint NOT NULL, "code" character varying NOT NULL, "userId" bigint NOT NULL, "ip" character varying NOT NULL, "userAgent" character varying NOT NULL, "activeTo" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d90ed2a9d81bbe4eab9d33d9665" UNIQUE ("code"), CONSTRAINT "PK_9f55a6aac22591f4e6cc383ef7b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "register_phone" ADD CONSTRAINT "FK_0d6a69167b00b8117350281146f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "register_email" ADD CONSTRAINT "FK_8c9fbf6ec75c45f18572dbbef31" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "authorization" ADD CONSTRAINT "FK_bafc4fb5c5d59c5f35c73bdb49d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "change_email" ADD CONSTRAINT "FK_a55a481f507555780057c69ef4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "change_phone" ADD CONSTRAINT "FK_cd94207c70a6a6613734de8e52f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "change_phone" DROP CONSTRAINT "FK_cd94207c70a6a6613734de8e52f"`);
        await queryRunner.query(`ALTER TABLE "change_email" DROP CONSTRAINT "FK_a55a481f507555780057c69ef4a"`);
        await queryRunner.query(`ALTER TABLE "authorization" DROP CONSTRAINT "FK_bafc4fb5c5d59c5f35c73bdb49d"`);
        await queryRunner.query(`ALTER TABLE "register_email" DROP CONSTRAINT "FK_8c9fbf6ec75c45f18572dbbef31"`);
        await queryRunner.query(`ALTER TABLE "register_phone" DROP CONSTRAINT "FK_0d6a69167b00b8117350281146f"`);
        await queryRunner.query(`DROP TABLE "change_phone"`);
        await queryRunner.query(`DROP TABLE "change_email"`);
        await queryRunner.query(`DROP TABLE "authorization"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "register_email"`);
        await queryRunner.query(`DROP TABLE "register_phone"`);
    }

}
