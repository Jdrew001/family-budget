import { Entity, Column, ManyToMany, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';
import { Account } from './account.model';

@Entity()
export class Balance {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    amount: number;

    @Column()
    dateTime: Date;

    @Column()
    activeInd: boolean = true;

    @ManyToOne(() => Account, (account) => account.balances)
    account?: Account;
}