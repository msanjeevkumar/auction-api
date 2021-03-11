import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAuctionEntity1615465848560 implements MigrationInterface {
  name = 'UpdateAuctionEntity1615465848560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "status" character varying NOT NULL DEFAULT 'OPEN'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "platformCharge" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "sellerWinnings" integer`,
    );
    await queryRunner.query(`ALTER TABLE "auction" ADD "winnerId" integer`);
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "FK_6908332e2ea30d763579027347d" FOREIGN KEY ("winnerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "FK_6908332e2ea30d763579027347d"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "winnerId"`);
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "sellerWinnings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "platformCharge"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "status"`);
  }
}
