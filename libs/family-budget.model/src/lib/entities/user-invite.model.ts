import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Family } from "./family.model";
import { User } from "./user.model";

@Entity()
export class UserInvite {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column()
    email: string;

    @Column()
    activeInd?: boolean;

    @CreateDateColumn({ name: 'createdat', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedat', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    updatedAt?: Date;

    @OneToOne(() => User)
    @JoinColumn({ name: 'updatedby' })
    updateBy?: User;

    @OneToOne(() => Family)
    @JoinColumn({ name: 'familyid' })
    family?: Family;
}