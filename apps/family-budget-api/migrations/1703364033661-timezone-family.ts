import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class TimezoneFamily1703364033661 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const column = new TableColumn({
            name: 'timezone',
            type: 'varchar',
            isNullable: true
        });

        await queryRunner.addColumn('family', column);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
