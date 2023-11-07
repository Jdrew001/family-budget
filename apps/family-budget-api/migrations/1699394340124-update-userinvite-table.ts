import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm"

export class UpdateUserinviteTable1699394340124 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('user_invite', new TableColumn({
            name: 'updated_by_id',
            type: 'uuid',
            isNullable: true,
        }));

        await queryRunner.createForeignKey('user_invite', new TableForeignKey({
            columnNames: ['updated_by_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
            onDelete: 'SET NULL',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
