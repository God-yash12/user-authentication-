import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ObjectIdColumn,
    ObjectId,
} from 'typeorm';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity('users')
export class User {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: UserRole})
    role: UserRole;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ nullable: true, type: 'varchar' })
    otpCode?: string | null;

    @Column({ type: 'timestamp', nullable: true })
    otpExpiresAt?: Date | null;

    @Column({ default: 0 })
    loginAttempts: number;

    @Column({ type: 'timestamp', nullable: true })
    lockUntil?: Date | null;

    @Column({ nullable: true })
    refreshToken?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Optional: Virtual-like method
    isLocked(): boolean {
        return !!this.lockUntil && this.lockUntil > new Date();
    }

    // Virtual getter for string ID (optional)
    get id(): string {
    return this._id.toHexString();
  }
}
