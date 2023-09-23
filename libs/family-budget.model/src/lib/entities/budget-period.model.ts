import { Entity, Column, OneToMany, ManyToMany, JoinTable, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class BudgetPeriod {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    frequency: Frequency;
}

export enum Frequency {
    Weekly = 0,
    BiWeekly = 1,
    Monthly = 2,
    Quarterly = 3,
    Yearly = 4
}