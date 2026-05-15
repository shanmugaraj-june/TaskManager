const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hash = async (pw) => bcrypt.hash(pw, 12);

  const alex = await prisma.user.create({
    data: { name: 'Alex Morgan', email: 'alex@example.com', passwordHash: await hash('password123'), role: 'ADMIN' },
  });
  const sam = await prisma.user.create({
    data: { name: 'Sam Rivera', email: 'sam@example.com', passwordHash: await hash('password123'), role: 'MEMBER' },
  });
  const jordan = await prisma.user.create({
    data: { name: 'Jordan Lee', email: 'jordan@example.com', passwordHash: await hash('password123'), role: 'MEMBER' },
  });
  const casey = await prisma.user.create({
    data: { name: 'Casey Kim', email: 'casey@example.com', passwordHash: await hash('password123'), role: 'MEMBER' },
  });

  // Create projects
  const p1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Full redesign of the company marketing site',
      adminId: alex.id,
      members: { create: [{ userId: alex.id }, { userId: sam.id }, { userId: jordan.id }] },
    },
  });
  const p2 = await prisma.project.create({
    data: {
      name: 'Mobile App v2',
      description: 'New features and performance improvements for iOS & Android',
      adminId: alex.id,
      members: { create: [{ userId: alex.id }, { userId: jordan.id }, { userId: casey.id }] },
    },
  });
  const p3 = await prisma.project.create({
    data: {
      name: 'API Integration',
      description: 'Third-party service integrations and API documentation',
      adminId: sam.id,
      members: { create: [{ userId: sam.id }, { userId: casey.id }] },
    },
  });

  // Create tasks
  const tasks = [
    { projectId: p1.id, title: 'Design new homepage hero', description: 'Create Figma mockups for hero section', priority: 'HIGH', status: 'DONE', assigneeId: sam.id, dueDate: new Date('2026-04-15') },
    { projectId: p1.id, title: 'Implement responsive navbar', description: 'Mobile-first navbar with hamburger menu', priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: jordan.id, dueDate: new Date('2026-05-20') },
    { projectId: p1.id, title: 'Content migration', description: 'Migrate all existing blog posts to new CMS', priority: 'MEDIUM', status: 'TODO', assigneeId: sam.id, dueDate: new Date('2026-06-01') },
    { projectId: p1.id, title: 'SEO audit and improvements', description: 'Technical SEO: meta tags, sitemap, structured data', priority: 'LOW', status: 'TODO', assigneeId: alex.id, dueDate: new Date('2026-05-01') },
    { projectId: p2.id, title: 'Push notification setup', description: 'Implement Firebase Cloud Messaging for iOS and Android', priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: casey.id, dueDate: new Date('2026-05-10') },
    { projectId: p2.id, title: 'Offline mode implementation', description: 'Cache strategy and sync logic for offline use', priority: 'MEDIUM', status: 'TODO', assigneeId: jordan.id, dueDate: new Date('2026-06-15') },
    { projectId: p2.id, title: 'Performance audit', description: 'Profile render times and optimize critical paths', priority: 'LOW', status: 'DONE', assigneeId: alex.id, dueDate: new Date('2026-04-28') },
    { projectId: p3.id, title: 'Stripe payment integration', description: 'Checkout session, webhooks, and refund handling', priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: casey.id, dueDate: new Date('2026-04-30') },
    { projectId: p3.id, title: 'Write API documentation', description: 'OpenAPI 3.0 spec and developer guide', priority: 'MEDIUM', status: 'TODO', assigneeId: sam.id, dueDate: new Date('2026-07-01') },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('\n✅ Seed complete!\n');
  console.log('Demo accounts (password: password123):');
  console.log('  Admin : alex@example.com');
  console.log('  Member: sam@example.com');
  console.log('  Member: jordan@example.com');
  console.log('  Member: casey@example.com\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
