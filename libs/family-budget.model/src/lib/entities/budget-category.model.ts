import { Entity, Column, ManyToMany, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';
import { Budget } from './budget.model';
import { Category } from './category.model';

@Entity()
export class BudgetCategory {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("float")
    amount: number;

    @ManyToOne(() => Budget, (budget) => budget.budgetCategories)
    budget: Budget

    @ManyToOne(() => Category)
    category: Category;
}