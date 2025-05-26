import { Entity, ObjectIdColumn, Column, CreateDateColumn, ObjectId } from 'typeorm';

@Entity('Users_Registration')
export class User {
  @ObjectIdColumn()
  _id: ObjectId; 

  @Column()
  username: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  // Add a getter for id to match your controller
  get id(): string {
    return this._id.toString();
  }
}