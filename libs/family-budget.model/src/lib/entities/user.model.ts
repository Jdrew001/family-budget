import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';
import { Subscription } from './subscription.model';
import { Family } from './family.model';


@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column({nullable: true})
    firstname: string;

    @Column({nullable: true})
    lastname: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column({nullable: true})
    phoneNumber: string;

    @Column({nullable: true})
    lastLogin?: Date;

    @Column({default: false})
    locked?: boolean;

    @Column({default: false})
    onboarded?: boolean;

    @Column({nullable: true})
    dateLocked?: Date;

    @Column({default: false})
    confirmed: boolean;

    @Column({default: true})
    activeInd?: boolean;

    @Column({nullable: true})
    refreshToken: string;

    @ManyToOne(() => Subscription, (subscription) => subscription.users)
    subscription?: Subscription;

    @ManyToOne(() => Family, (family) => family.users, {
        cascade: true
    })
    family?: Family;
}