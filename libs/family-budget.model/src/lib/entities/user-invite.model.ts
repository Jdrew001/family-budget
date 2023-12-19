import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Family } from "./family.model";
import { User } from "./user.model";

@Entity()
export class UserInvite {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column()
    email: string;

    @Column({default: true})
    activeInd?: boolean;

    @CreateDateColumn({ name: 'createdat', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updatedat', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    updatedAt?: Date;

    @Column({name: 'updatedby'})
    updatedBy?: string;

    @ManyToOne(() => Family)
    @JoinColumn({ name: 'familyid' })
    family?: Family;
}