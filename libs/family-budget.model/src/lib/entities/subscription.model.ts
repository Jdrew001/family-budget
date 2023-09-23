import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { User } from "./user.model";

@Entity()
export class Subscription {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    price: number;

    @OneToMany(() => User, (user) => user.subscription)
    users: Array<User>;
}