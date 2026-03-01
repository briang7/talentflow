import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First create the Sales Director role if it doesn't exist
  let directorRole = await prisma.role.findFirst({
    where: { title: 'Sales Director' },
  });

  if (!directorRole) {
    directorRole = await prisma.role.create({
      data: {
        title: 'Sales Director',
        level: 4,
        salaryMin: 130000,
        salaryMax: 180000,
      },
    });
    console.log('Created Sales Director role:', directorRole.id);
  }

  // Get Sales department
  const salesDept = await prisma.department.findFirst({
    where: { name: 'Sales' },
  });
  if (!salesDept) throw new Error('Sales department not found');

  // Get an office for the director
  const office = await prisma.office.findFirst();
  if (!office) throw new Error('No office found');

  // Create Sales Director employee
  const director = await prisma.employee.create({
    data: {
      firstName: 'Victoria',
      lastName: 'Sterling',
      email: 'victoria.sterling@talentflow.io',
      phone: '+1-555-0180',
      avatar: null,
      departmentId: salesDept.id,
      roleId: directorRole.id,
      managerId: null, // Reports to CEO/top level
      hireDate: new Date('2021-03-15'),
      salary: 155000,
      status: 'ACTIVE',
      locationId: office.id,
    },
  });
  console.log('Created Sales Director:', director.firstName, director.lastName, director.id);

  // Update all Sales Representatives to report to the new director
  const updated = await prisma.employee.updateMany({
    where: {
      department: { name: 'Sales' },
      id: { not: director.id },
    },
    data: {
      managerId: director.id,
    },
  });
  console.log(`Updated ${updated.count} sales reps to report to ${director.firstName} ${director.lastName}`);

  // Also set the Sales Director as head of Sales department
  await prisma.department.update({
    where: { id: salesDept.id },
    data: { headId: director.id },
  });
  console.log('Set Victoria Sterling as head of Sales department');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
