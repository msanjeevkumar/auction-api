import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuctionEntity1615456767252 implements MigrationInterface {
  name = 'AddAuctionEntity1615456767252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auction" ("id" SERIAL NOT NULL, "createdAtUtc" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "modifiedAtUtc" TIMESTAMP WITH TIME ZONE DEFAULT now(), "name" character varying NOT NULL, "description" character varying NOT NULL, "minimumBid" integer NOT NULL, "highestBid" integer NOT NULL, "sellerId" integer, CONSTRAINT "UQ_692fb885c12af380de79335b1b2" UNIQUE ("name"), CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "FK_a8985d3662c274c57c2d0118538" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "FK_a8985d3662c274c57c2d0118538"`,
    );
    await queryRunner.query(`DROP TABLE "auction"`);
  }
}
