import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class AccountType {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;
}