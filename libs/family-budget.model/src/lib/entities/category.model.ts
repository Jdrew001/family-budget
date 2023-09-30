import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';
import { Family } from './family.model';

@Entity()
export class Category {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    type: CategoryType;

    @ManyToOne(() => Family, (family) => family.categories)
    family?: Family;
}

export enum CategoryType {
    Income = 0,
    Expense = 1
}