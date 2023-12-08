import { Column, Entity, Int32, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Frequency } from "@family-budget/family-budget.model";

@Entity('frequency_ref')
export class FrequencyRef {

    @PrimaryGeneratedColumn({type: "int"})
    id: number;

    @Column()
    name: string;

    @Column({type: 'int'})
    type: Frequency;
}