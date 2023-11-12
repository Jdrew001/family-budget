import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';
import { Subscription } from './subscription.model';
import { Family } from './family.model';


@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column()
    phoneNumber: string;

    @Column()
    lastLogin?: Date;

    @Column()
    locked?: boolean;

    @Column()
    onboarded?: boolean;

    @Column({nullable: true})
    dateLocked?: Date;

    @Column()
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