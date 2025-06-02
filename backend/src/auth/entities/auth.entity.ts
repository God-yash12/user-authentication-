import { Entity, ObjectIdColumn, Column, CreateDateColumn, ObjectId, UpdateDateColumn } from 'typeorm';

@Entity('Users_Registration')
export class User {
  @ObjectIdColumn()
  _id: ObjectId; 

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  refreshToken?: string;


  // Add a getter for id to match your controller
  get id(): string {
    return this._id.toString();
  }
}