import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBidEntity1615458850896 implements MigrationInterface {
  name = 'AddBidEntity1615458850896';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bid" ("id" SERIAL NOT NULL, "createdAtUtc" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "modifiedAtUtc" TIMESTAMP WITH TIME ZONE DEFAULT now(), "amount" integer NOT NULL, "buyerId" integer, "auctionId" integer, CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_99a6f4cb1487968967a5c38014e" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_2e00b0f268f93abcf693bb682c6" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_2e00b0f268f93abcf693bb682c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_99a6f4cb1487968967a5c38014e"`,
    );
    await queryRunner.query(`DROP TABLE "bid"`);
  }
}
