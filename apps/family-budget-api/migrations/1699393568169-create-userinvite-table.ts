import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserinviteTable1699393568169 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
                DROP TABLE IF EXISTS user_invite;
                CREATE TABLE user_invite (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    email VARCHAR NOT NULL,
                    family_id UUID NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_family_id FOREIGN KEY (family_id) REFERENCES family(id)
                );
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
