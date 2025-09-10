import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  console.log('🌱 Starting database seeding...');
  
  try {
    // Create permissions
    const permissions = [
      // User permissions
      { name: 'user:read', description: 'Read user information' },
      { name: 'user:write', description: 'Create and update users' },
      { name: 'user:delete', description: 'Delete users' },
      
      // Role permissions
      { name: 'role:read', description: 'View roles' },
      { name: 'role:write', description: 'Create and update roles' },
      { name: 'role:delete', description: 'Delete roles' },
      
      // Admin permissions
      { name: 'admin:access', description: 'Access admin panel' },
      { name: 'admin:system', description: 'System administration' },
      
      // Trading permissions
      { name: 'trading:execute', description: 'Execute trades' },
      { name: 'trading:view', description: 'View trading data' },
      { name: 'trading:strategy', description: 'Manage trading strategies' },
      
      // Analytics permissions
      { name: 'analytics:view', description: 'View analytics data' },
      { name: 'analytics:export', description: 'Export analytics data' },
      
      // Billing permissions
      { name: 'billing:view', description: 'View billing information' },
      { name: 'billing:manage', description: 'Manage billing and subscriptions' },
    ];
    
    const permissionEntities = await Promise.all(
      permissions.map(async (perm) => {
        const existing = await dataSource.getRepository(Permission).findOne({
          where: { name: perm.name }
        });
        
        if (!existing) {
          const permission = dataSource.getRepository(Permission).create(perm);
          return await dataSource.getRepository(Permission).save(permission);
        }
        return existing;
      })
    );
    
    console.log(`✅ Created ${permissionEntities.length} permissions`);
    
    // Create roles
    const roles = [
      {
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        permissions: permissionEntities, // All permissions
      },
      {
        name: 'admin',
        description: 'Administrator with user management access',
        permissions: permissionEntities.filter(p => 
          p.name.includes('user:') || 
          p.name.includes('role:') || 
          p.name.includes('admin:')
        ),
      },
      {
        name: 'trader',
        description: 'Professional trader with trading access',
        permissions: permissionEntities.filter(p => 
          p.name.includes('trading:') || 
          p.name.includes('analytics:view')
        ),
      },
      {
        name: 'analyst',
        description: 'Data analyst with analytics access',
        permissions: permissionEntities.filter(p => 
          p.name.includes('analytics:')
        ),
      },
      {
        name: 'user',
        description: 'Regular user with basic access',
        permissions: permissionEntities.filter(p => 
          p.name === 'user:read' || 
          p.name === 'trading:view' || 
          p.name === 'analytics:view'
        ),
      },
    ];
    
    const roleEntities = await Promise.all(
      roles.map(async (roleData) => {
        const existing = await dataSource.getRepository(Role).findOne({
          where: { name: roleData.name },
          relations: ['permissions']
        });
        
        if (!existing) {
          const role = dataSource.getRepository(Role).create(roleData);
          return await dataSource.getRepository(Role).save(role);
        }
        return existing;
      })
    );
    
    console.log(`✅ Created ${roleEntities.length} roles`);
    
    // Create users
    const users = [
      {
        email: 'super@aifinanceagency.com',
        username: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        password: await bcrypt.hash('SuperAdmin@123', 10),
        isActive: true,
        isEmailVerified: true,
        roles: [roleEntities.find(r => r.name === 'super_admin')],
      },
      {
        email: 'admin@aifinanceagency.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        password: await bcrypt.hash('Admin@123', 10),
        isActive: true,
        isEmailVerified: true,
        roles: [roleEntities.find(r => r.name === 'admin')],
      },
      {
        email: 'trader@aifinanceagency.com',
        username: 'trader1',
        firstName: 'John',
        lastName: 'Trader',
        password: await bcrypt.hash('Trader@123', 10),
        isActive: true,
        isEmailVerified: true,
        roles: [roleEntities.find(r => r.name === 'trader')],
      },
      {
        email: 'analyst@aifinanceagency.com',
        username: 'analyst1',
        firstName: 'Jane',
        lastName: 'Analyst',
        password: await bcrypt.hash('Analyst@123', 10),
        isActive: true,
        isEmailVerified: true,
        roles: [roleEntities.find(r => r.name === 'analyst')],
      },
      {
        email: 'user@aifinanceagency.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: await bcrypt.hash('User@123', 10),
        isActive: true,
        isEmailVerified: true,
        roles: [roleEntities.find(r => r.name === 'user')],
      },
    ];
    
    const userEntities = await Promise.all(
      users.map(async (userData) => {
        const existing = await dataSource.getRepository(User).findOne({
          where: { email: userData.email }
        });
        
        if (!existing) {
          const user = dataSource.getRepository(User).create(userData);
          return await dataSource.getRepository(User).save(user);
        }
        return existing;
      })
    );
    
    console.log(`✅ Created ${userEntities.length} users`);
    
    console.log(`
    ========================================
    🎉 Database seeding completed successfully!
    ========================================
    
    Test credentials:
    
    Super Admin:
      Email: super@aifinanceagency.com
      Password: SuperAdmin@123
    
    Admin:
      Email: admin@aifinanceagency.com
      Password: Admin@123
    
    Trader:
      Email: trader@aifinanceagency.com
      Password: Trader@123
    
    Analyst:
      Email: analyst@aifinanceagency.com
      Password: Analyst@123
    
    User:
      Email: user@aifinanceagency.com
      Password: User@123
    
    ========================================
    `);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });