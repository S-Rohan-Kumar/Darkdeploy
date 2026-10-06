import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminEmail = 'admin@darkdeploy.io';
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let user = existingUser;
  if (!user) {
    const passwordHash = await bcrypt.hash('admin123456', 10);
    user = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'System Admin',
        role: 'ADMIN',
      },
    });
    console.log(`✅ Created Admin User: ${adminEmail} (password: admin123456)`);
  }

  const devEnv = await prisma.environment.upsert({
    where: { key: 'development' },
    update: {},
    create: {
      name: 'Development',
      key: 'development',
      apiKey: `dd_dev_${crypto.randomBytes(16).toString('hex')}`,
    },
  });

  const prodEnv = await prisma.environment.upsert({
    where: { key: 'production' },
    update: {},
    create: {
      name: 'Production',
      key: 'production',
      apiKey: `dd_prod_${crypto.randomBytes(16).toString('hex')}`,
    },
  });

  console.log(`✅ Development Environment API Key: ${devEnv.apiKey}`);
  console.log(`✅ Production Environment API Key:  ${prodEnv.apiKey}`);

  const demoFlag = await prisma.flag.upsert({
    where: {
      key_environmentId: {
        key: 'new-checkout-flow',
        environmentId: devEnv.id,
      },
    },
    update: {},
    create: {
      key: 'new-checkout-flow',
      name: 'New Checkout Flow',
      description: 'Gating the revamped single-page checkout experience',
      enabled: true,
      defaultValue: false,
      rolloutPercentage: 25.0,
      environmentId: devEnv.id,
      rules: {
        create: [
          {
            attribute: 'plan',
            operator: 'EQUALS',
            values: ['enterprise'],
            serveValue: true,
            priority: 1,
          },
        ],
      },
    },
  });

  console.log(`✅ Created Demo Flag: ${demoFlag.key} in Dev environment`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });