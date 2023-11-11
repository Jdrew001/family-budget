import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class Updateaccounttbl1699720552506 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('account', new TableColumn({
            name: 'activeInd',
            type: 'bool',
            isNullable: true,
            default: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
