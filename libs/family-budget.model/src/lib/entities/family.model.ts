import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable, OneToOne } from 'typeorm';
import { User } from './user.model';
import { Account } from './account.model';
import { Category } from './category.model';


@Entity()
export class Family {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToMany(() => User, (user) => user.family)
    users: Array<User>;

    @OneToOne(() => User, (user) => user.family)
    @Column({name: 'user_id'})
    owner: string;

    @OneToMany(() => Account, (account) => account.family, {
        cascade: true
    })
    accounts?: Array<Account>;

    @OneToMany(() => Category, (category) => category.family, {
        cascade: true
    })
    categories?: Array<Category>;
}