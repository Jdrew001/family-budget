import { Entity, Column, ManyToMany, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';
import { Account } from './account.model';
import { Transaction } from './transaction.model';
import { BudgetCategory } from './budget-category.model';

@Entity()
export class Budget {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    activeInd?: boolean = true;

    @ManyToOne(() => Account, (account) => account.budgets)
    account?: Account;

    @OneToMany(() => BudgetCategory, (budgetCategory) => budgetCategory.budget, {
        cascade: true
    })
    budgetCategories: Array<BudgetCategory>;
}