import 'reflect-metadata';
import '../../../shared/test-utils/setup';

// E2E test setup for user management service
import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Role } from '../src/entities/role.entity';
import { Session } from '../src/entities/session.entity';
import { AuditLog } from '../src/entities/audit-log.entity';

let testDataSource: DataSource;

beforeAll(async () => {
  // Create test database connection
  testDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [User, Role, Session, AuditLog],
    synchronize: true,
    logging: false,
  });

  await testDataSource.initialize();
});

afterAll(async () => {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});

beforeEach(async () => {
  // Clean database before each test
  if (testDataSource && testDataSource.isInitialized) {
    const entities = testDataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = testDataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
});

export { testDataSource };