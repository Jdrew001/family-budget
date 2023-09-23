import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';
import { User } from './user.model';
import { Account } from './account.model';


@Entity()
export class Family {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToMany(() => User, (user) => user.subscription)
    users: Array<User>;

    @OneToMany(() => Account, (account) => account.family, {
        cascade: true
    })
    accounts?: Array<Account>;
}