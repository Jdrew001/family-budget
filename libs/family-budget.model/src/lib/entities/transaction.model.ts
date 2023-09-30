import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';
import { Account } from './account.model';
import { Category } from './category.model';
import { Budget } from './budget.model';

@Entity()
export class Transaction {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column()
    description: string;

    @ManyToOne(() => Category)
    category: Category;
    
    @ManyToOne(() => Account, (account) => account.transactions)
    account: Account;

    @ManyToOne(() => Budget)
    budget?: Budget

    @Column()
    amount: number;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    createdAt?: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    updatedAt?: Date;

    //TODO: this needs to be relational to user
    @Column()
    createdBy?: string;
}