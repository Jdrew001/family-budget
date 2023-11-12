import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm"

export class UpdateFamilyTable1699816173973 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
       // Create a default user or find a user to be the default owner
    const defaultUserId = '0c27d253-9e87-4d6d-83e4-0517b778b8d8';

    // Add the user_id column to the family table
    const column = new TableColumn({
        name: 'user_id',
        type: 'uuid',
        isNullable: false,
        default: `'${defaultUserId}'`,
    });
    await queryRunner.addColumn('family', column);

    // Add the foreign key constraint
    const foreignKey = new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
    });
    await queryRunner.createForeignKey('family', foreignKey);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
