import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn } from 'typeorm';

@Entity()
export class Mailer {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  email: string;

  @Column()
  otp: string;

  @Column()
  isUsed: boolean;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}