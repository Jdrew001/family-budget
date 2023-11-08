import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class UpdateUserTable1699410502173 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('user', new TableColumn({
            name: 'phoneNumber',
            type: 'varchar',
            isNullable: false,
            default: '-1',
        }));

        await queryRunner.query(`UPDATE "user" SET "phoneNumber" = '-1' WHERE "phoneNumber" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
