import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class AccountType {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ default: 0 })
    sortOrder: number;

    @Column({ default: true, name: 'active_ind' })
    activeInd: boolean;
}