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
    salt: string;

    @Column()
    email: string;

    @Column()
    lastLogin?: Date;

    @Column()
    locked?: boolean;

    @Column({nullable: true})
    dateLocked?: Date;

    @Column()
    confirmed: boolean;

    @ManyToOne(() => Subscription, (subscription) => subscription.users)
    subscription?: Subscription;

    @ManyToOne(() => Family, (family) => family.users, {
        cascade: true
    })
    family?: Family;
}