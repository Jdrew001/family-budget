import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class TimezoneUser1703184591175 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('user', new TableColumn({
            name: 'timezone',
            type: 'varchar',
            isNullable: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
