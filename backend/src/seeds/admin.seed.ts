import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

async function createAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Check if admin already exists
    const existingAdmin = await usersService.findByEmail('admin@example.com');
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = await usersService.create({
      fullName: 'System Administrator',
      email: 'ganeshthapa134@gmail.com',
      username: 'admin_Ganesh2',
      password: 'Admin@9845',
      role: UserRole.ADMIN,
      isEmailVerified: true,
    });

    console.log('Admin user created successfully:', {
      id: adminUser._id,
      email: adminUser.email,
      username: adminUser.username,
      role: adminUser.role,
    });
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    await app.close();
  }
}

// Run the seed function
createAdminUser();