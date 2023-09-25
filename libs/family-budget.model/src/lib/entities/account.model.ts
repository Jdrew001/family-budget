import { Entity, Column, OneToMany, ManyToMany, JoinTable, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
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

    @ManyToOne(() => AccountType)
    accountType: AccountType;

    @OneToMany(() => Budget, (budget) => budget.account, {
        cascade: true
    })
    budgets: Array<Budget>;

    @ManyToOne(() => Family, (family) => family.accounts)
    family?: Family;

    @OneToMany(() => Balance, (balance) => balance.account, {
        cascade: true
    })
    balances: Array<Balance>;

    @OneToMany(() => Transaction, (transaction) => transaction.account, {
        cascade: true
    })
    transactions: Array<Transaction>;

    @ManyToOne(() => BudgetPeriod)
    budgetPeriod: BudgetPeriod;
}