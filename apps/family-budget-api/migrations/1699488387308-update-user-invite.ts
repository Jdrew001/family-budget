import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class UpdateUserInvite1699488387308 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('user_invite', new TableColumn({
            name: 'activeInd',
            type: 'bool',
            isNullable: true,
            default: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
