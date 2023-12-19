import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm"

export class FixUserinvite1703011663911 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey('user_invite', new TableForeignKey({
            columnNames: ['familyid'],
            referencedColumnNames: ['id'],
            referencedTableName: 'family',
            onDelete: 'CASCADE'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
