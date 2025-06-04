import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MongoRepository } from 'typeorm';
import { User } from '../auth/entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';

async function seedAdmins() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {        // Use dependency injection to get the repository
        const userRepository = app.get<MongoRepository<User>>(getRepositoryToken(User));

        // Check if admins already exist (optional safety check)
        const existingAdmins = await userRepository.find({
            where: { role: 'admin' }
        });

        if (existingAdmins.length > 0) {
            console.log(`Found ${existingAdmins.length} existing admin(s). Clearing them...`);
            await userRepository.delete({ role: 'admin' });
            console.log(`Cleared existing admin users`);
        }

        // Define multiple admins to add
        const adminsData = [
            {
                username: 'superadmin',
                email: 'superadmin@gmail.com',
                password: 'SuperAdmin@2024!',
                firstName: 'Super',
                lastName: 'Admin'
            },
            {
                username: 'admin1',
                email: 'admin1@gmail.com',
                password: 'Admin1@2024!',
                firstName: 'Admin',
                lastName: 'One'
            },
            {
                username: 'admin2',
                email: 'admin2@gmail.com',
                password: 'Admin2@2024!',
                firstName: 'Admin',
                lastName: 'Two'
            },
        ];

        // Validate no duplicate usernames/emails
        const usernames = adminsData.map(admin => admin.username);
        const emails = adminsData.map(admin => admin.email);

        if (new Set(usernames).size !== usernames.length) {
            throw new Error('Duplicate usernames found in admin data');
        }

        if (new Set(emails).size !== emails.length) {
            throw new Error('Duplicate emails found in admin data');
        }        // Check if these users already exist in database by checking each username and email separately
        const existingUsersByUsername = await userRepository.find({
            where: { username: { $in: usernames } } as any
        });
        
        const existingUsersByEmail = await userRepository.find({
            where: { email: { $in: emails } } as any
        });
        
        const existingUsers = [...existingUsersByUsername, ...existingUsersByEmail];
        
        // Remove duplicates based on _id
        const uniqueExistingUsers = existingUsers.filter((user, index, self) => 
            index === self.findIndex(u => u._id.toString() === user._id.toString())
        );        if (uniqueExistingUsers.length > 0) {
            console.log('Some users already exist with these usernames/emails:');
            uniqueExistingUsers.forEach(user => {
                console.log(`   - ${user.username} (${user.email})`);
            });
            throw new Error('Cannot create admins: conflicting usernames/emails exist');
        }

        // Hash passwords and create user entities
        console.log('Hashing passwords...');
        const adminUsers = await Promise.all(
            adminsData.map(async (admin) => {
                const hashedPassword = await bcrypt.hash(admin.password, 12);
                return userRepository.create({
                    username: admin.username,
                    email: admin.email,
                    password: hashedPassword,
                    role: 'admin',
                    isEmailVerified: true,
                    firstName: admin.firstName || 'Admin',
                    lastName: admin.lastName || 'User',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }),
        );

        // Save all admins in DB
        console.log('Saving admin users to database...');
        await userRepository.save(adminUsers);

        console.log(`Successfully created ${adminUsers.length} admin users:`);
        adminUsers.forEach(user => {
            console.log(`   - ${user.username} (${user.email})`);
        });

        console.log('\n Login credentials:');
        adminsData.forEach(admin => {
            console.log(`   Username: ${admin.username} | Password: ${admin.password}`);
        });

    } catch (error) {
        console.error('Error seeding admins:', error.message);
        throw error;
    } finally {
        await app.close();
    }
}

// Run the seeding function
seedAdmins()
    .then(() => {
        console.log('\n Admin seeding completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\nAdmin seeding failed:', error.message);
        process.exit(1);
    });