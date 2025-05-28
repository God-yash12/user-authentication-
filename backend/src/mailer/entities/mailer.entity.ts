import { Entity, ObjectIdColumn, Column, CreateDateColumn, ObjectId } from 'typeorm';

@Entity('otps')
export class Mailer {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  email: string;

  @Column()
  otp: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  get id(): string {
    return this._id.toString();
  }
}