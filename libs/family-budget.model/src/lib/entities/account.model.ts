import { Entity, Column, OneToMany, ManyToMany, JoinTable, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { AccountType } from './account-type.model';
import { Budget } from './budget.model';
import { Balance } from './balance.model';
import { Transaction } from './transaction.model';
import { BudgetPeriod } from './budget-period.model';
import { Family } from './family.model';


@Entity()
export class Account {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({nullable: true})
    icon?: string;

    @ManyToOne(() => AccountType)
    accountType: AccountType;

    @OneToMany(() => Budget, (budget) => budget.account, {
        cascade: true
    })
    budgets?: Array<Budget>;

    @ManyToOne(() => Family, (family) => family.accounts)
    family?: Family;

    @OneToOne(() => Balance, (balance) => balance.account, {
        cascade: true
    })
    @JoinColumn()
    balance?: Balance;

    @OneToMany(() => Transaction, (transaction) => transaction.account, {
        cascade: true
    })
    transactions?: Array<Transaction>;

    @ManyToOne(() => BudgetPeriod)
    budgetPeriod: BudgetPeriod;
}