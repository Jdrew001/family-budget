import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class UpdateUser1699486586890 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('user', new TableColumn({
            name: 'onboarded',
            type: 'bool',
            isNullable: false,
            default: false,
        }));

        await queryRunner.query(`UPDATE "user" SET "onboarded" = true WHERE "onboarded" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
