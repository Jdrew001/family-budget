import { Entity, Column, ManyToMany, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable, OneToOne } from 'typeorm';
import { Account } from './account.model';

@Entity()
export class Balance {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column("float")
    amount?: number;

    @Column()
    dateTime: Date;

    @Column()
    activeInd: boolean = true;

    @OneToOne(() => Account, (account) => account.balance)
    account?: Account;
}