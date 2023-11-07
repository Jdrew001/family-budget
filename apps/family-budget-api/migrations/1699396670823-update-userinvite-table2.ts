import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateUserinviteTable21699396670823 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
                DROP TABLE IF EXISTS user_invite;
                CREATE TABLE user_invite (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    email VARCHAR NOT NULL,
                    familyId UUID NOT NULL,
                    updatedBy UUID NOT NULL,
                    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_familyId FOREIGN KEY (familyId) REFERENCES family(id),
                    CONSTRAINT fk_updatedBy FOREIGN KEY (updatedBy) REFERENCES "user"(id)
                );
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
