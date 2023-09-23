import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';

@Entity()
export class Category {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    type: CategoryType;
}

export enum CategoryType {
    Income = 0,
    Expense = 1
}