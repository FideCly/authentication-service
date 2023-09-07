import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './auth.enum';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Generated('uuid')
  @Column()
  public uuid!: string;

  @Column()
  public email!: string;

  @Exclude()
  @Column()
  public password!: string;

  @Column()
  public role!: Role;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  @DeleteDateColumn()
  public deletedAt!: Date;
}
