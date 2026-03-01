import { PrismaClient, EmployeeStatus, UserRole, ReviewCycleType, ReviewCycleStatus, ReviewStatus, GoalStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Offices ──────────────────────────────────────────
  const offices = await Promise.all([
    prisma.office.create({ data: { name: 'HQ - San Francisco', address: '100 Market St', city: 'San Francisco', country: 'USA' } }),
    prisma.office.create({ data: { name: 'NYC Office', address: '350 5th Ave', city: 'New York', country: 'USA' } }),
    prisma.office.create({ data: { name: 'London Office', address: '1 Canada Square', city: 'London', country: 'UK' } }),
    prisma.office.create({ data: { name: 'Berlin Office', address: 'Friedrichstraße 43', city: 'Berlin', country: 'Germany' } }),
    prisma.office.create({ data: { name: 'Tokyo Office', address: '1-1 Marunouchi', city: 'Tokyo', country: 'Japan' } }),
  ]);

  // ─── Roles ────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.create({ data: { title: 'Junior Developer', level: 1, salaryMin: 60000, salaryMax: 80000 } }),
    prisma.role.create({ data: { title: 'Mid Developer', level: 2, salaryMin: 80000, salaryMax: 110000 } }),
    prisma.role.create({ data: { title: 'Senior Developer', level: 3, salaryMin: 110000, salaryMax: 150000 } }),
    prisma.role.create({ data: { title: 'Staff Engineer', level: 4, salaryMin: 150000, salaryMax: 200000 } }),
    prisma.role.create({ data: { title: 'Engineering Manager', level: 4, salaryMin: 140000, salaryMax: 190000 } }),
    prisma.role.create({ data: { title: 'Designer', level: 2, salaryMin: 75000, salaryMax: 105000 } }),
    prisma.role.create({ data: { title: 'Senior Designer', level: 3, salaryMin: 105000, salaryMax: 140000 } }),
    prisma.role.create({ data: { title: 'Product Manager', level: 3, salaryMin: 120000, salaryMax: 160000 } }),
    prisma.role.create({ data: { title: 'HR Specialist', level: 2, salaryMin: 65000, salaryMax: 90000 } }),
    prisma.role.create({ data: { title: 'HR Director', level: 4, salaryMin: 130000, salaryMax: 180000 } }),
    prisma.role.create({ data: { title: 'Marketing Manager', level: 3, salaryMin: 100000, salaryMax: 140000 } }),
    prisma.role.create({ data: { title: 'Sales Representative', level: 1, salaryMin: 55000, salaryMax: 75000 } }),
    prisma.role.create({ data: { title: 'VP of Engineering', level: 5, salaryMin: 200000, salaryMax: 280000 } }),
    prisma.role.create({ data: { title: 'Data Analyst', level: 2, salaryMin: 70000, salaryMax: 100000 } }),
    prisma.role.create({ data: { title: 'DevOps Engineer', level: 3, salaryMin: 110000, salaryMax: 150000 } }),
  ]);

  const [juniorDev, midDev, seniorDev, staffEng, engManager, designer, seniorDesigner, productMgr, hrSpecialist, hrDirector, marketingMgr, salesRep, vpEng, dataAnalyst, devopsEng] = roles;

  // ─── Departments ──────────────────────────────────────
  const engineering = await prisma.department.create({ data: { name: 'Engineering', budget: 5000000 } });
  const product = await prisma.department.create({ data: { name: 'Product', budget: 2000000 } });
  const design = await prisma.department.create({ data: { name: 'Design', budget: 1500000 } });
  const hr = await prisma.department.create({ data: { name: 'Human Resources', budget: 1000000 } });
  const marketing = await prisma.department.create({ data: { name: 'Marketing', budget: 2500000 } });
  const sales = await prisma.department.create({ data: { name: 'Sales', budget: 3000000 } });
  const dataTeam = await prisma.department.create({ data: { name: 'Data & Analytics', budget: 1800000, parentDepartmentId: engineering.id } });
  const platform = await prisma.department.create({ data: { name: 'Platform', budget: 2200000, parentDepartmentId: engineering.id } });

  // ─── Employees ────────────────────────────────────────
  // VP of Engineering (top of eng org)
  const vpEmpData = {
    firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@talentflow.dev',
    phone: '+1-415-555-0100', hireDate: new Date('2020-01-15'), salary: 250000,
    status: EmployeeStatus.ACTIVE, departmentId: engineering.id, roleId: vpEng.id, locationId: offices[0].id,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
  };
  const sarahChen = await prisma.employee.create({ data: vpEmpData });

  // Department heads
  const employees: any[] = [];

  const createEmployee = async (data: any) => {
    const emp = await prisma.employee.create({ data });
    employees.push(emp);
    return emp;
  };

  // Engineering Manager
  const alexRivera = await createEmployee({
    firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@talentflow.dev',
    phone: '+1-415-555-0101', hireDate: new Date('2020-03-10'), salary: 180000,
    status: EmployeeStatus.ACTIVE, departmentId: engineering.id, roleId: engManager.id,
    managerId: sarahChen.id, locationId: offices[0].id,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
  });

  // Platform lead
  const jordanTaylor = await createEmployee({
    firstName: 'Jordan', lastName: 'Taylor', email: 'jordan.taylor@talentflow.dev',
    phone: '+1-415-555-0102', hireDate: new Date('2020-06-22'), salary: 170000,
    status: EmployeeStatus.ACTIVE, departmentId: platform.id, roleId: engManager.id,
    managerId: sarahChen.id, locationId: offices[0].id,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
  });

  // HR Director
  const emmaWilson = await createEmployee({
    firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@talentflow.dev',
    phone: '+1-212-555-0103', hireDate: new Date('2019-11-01'), salary: 160000,
    status: EmployeeStatus.ACTIVE, departmentId: hr.id, roleId: hrDirector.id,
    locationId: offices[1].id,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
  });

  // Product Manager
  const liamPatel = await createEmployee({
    firstName: 'Liam', lastName: 'Patel', email: 'liam.patel@talentflow.dev',
    phone: '+1-415-555-0104', hireDate: new Date('2021-02-14'), salary: 145000,
    status: EmployeeStatus.ACTIVE, departmentId: product.id, roleId: productMgr.id,
    locationId: offices[0].id,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liam',
  });

  // Senior Designer
  const miaKimura = await createEmployee({
    firstName: 'Mia', lastName: 'Kimura', email: 'mia.kimura@talentflow.dev',
    phone: '+81-3-5555-0105', hireDate: new Date('2021-04-01'), salary: 130000,
    status: EmployeeStatus.ACTIVE, departmentId: design.id, roleId: seniorDesigner.id,
    locationId: offices[4].id,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia',
  });

  // Marketing Manager
  const oliverSchmidt = await createEmployee({
    firstName: 'Oliver', lastName: 'Schmidt', email: 'oliver.schmidt@talentflow.dev',
    phone: '+49-30-5555-0106', hireDate: new Date('2021-01-10'), salary: 125000,
    status: EmployeeStatus.ACTIVE, departmentId: marketing.id, roleId: marketingMgr.id,
    locationId: offices[3].id,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=oliver',
  });

  // Now create the rest of the employees (bulk)
  const bulkEmployees = [
    // Engineering team under Alex
    { firstName: 'Marcus', lastName: 'Johnson', email: 'marcus.johnson@talentflow.dev', hireDate: new Date('2021-06-15'), salary: 135000, departmentId: engineering.id, roleId: seniorDev.id, managerId: alexRivera.id, locationId: offices[0].id },
    { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@talentflow.dev', hireDate: new Date('2021-09-01'), salary: 125000, departmentId: engineering.id, roleId: seniorDev.id, managerId: alexRivera.id, locationId: offices[0].id },
    { firstName: 'James', lastName: 'O\'Brien', email: 'james.obrien@talentflow.dev', hireDate: new Date('2022-01-10'), salary: 95000, departmentId: engineering.id, roleId: midDev.id, managerId: alexRivera.id, locationId: offices[1].id },
    { firstName: 'Aisha', lastName: 'Mohammed', email: 'aisha.mohammed@talentflow.dev', hireDate: new Date('2022-04-18'), salary: 92000, departmentId: engineering.id, roleId: midDev.id, managerId: alexRivera.id, locationId: offices[2].id },
    { firstName: 'Tom', lastName: 'Baker', email: 'tom.baker@talentflow.dev', hireDate: new Date('2023-01-09'), salary: 72000, departmentId: engineering.id, roleId: juniorDev.id, managerId: alexRivera.id, locationId: offices[2].id },
    { firstName: 'Sofia', lastName: 'Garcia', email: 'sofia.garcia@talentflow.dev', hireDate: new Date('2023-06-12'), salary: 68000, departmentId: engineering.id, roleId: juniorDev.id, managerId: alexRivera.id, locationId: offices[0].id },

    // Platform team under Jordan
    { firstName: 'David', lastName: 'Lee', email: 'david.lee@talentflow.dev', hireDate: new Date('2020-09-14'), salary: 160000, departmentId: platform.id, roleId: staffEng.id, managerId: jordanTaylor.id, locationId: offices[0].id },
    { firstName: 'Rachel', lastName: 'Green', email: 'rachel.green@talentflow.dev', hireDate: new Date('2021-11-01'), salary: 140000, departmentId: platform.id, roleId: devopsEng.id, managerId: jordanTaylor.id, locationId: offices[0].id },
    { firstName: 'Kenji', lastName: 'Tanaka', email: 'kenji.tanaka@talentflow.dev', hireDate: new Date('2022-03-15'), salary: 120000, departmentId: platform.id, roleId: seniorDev.id, managerId: jordanTaylor.id, locationId: offices[4].id },
    { firstName: 'Nina', lastName: 'Petrova', email: 'nina.petrova@talentflow.dev', hireDate: new Date('2022-08-01'), salary: 95000, departmentId: platform.id, roleId: midDev.id, managerId: jordanTaylor.id, locationId: offices[3].id },
    { firstName: 'Carlos', lastName: 'Mendez', email: 'carlos.mendez@talentflow.dev', hireDate: new Date('2023-02-20'), salary: 75000, departmentId: platform.id, roleId: juniorDev.id, managerId: jordanTaylor.id, locationId: offices[0].id },

    // Data team
    { firstName: 'Wei', lastName: 'Zhang', email: 'wei.zhang@talentflow.dev', hireDate: new Date('2021-07-01'), salary: 130000, departmentId: dataTeam.id, roleId: seniorDev.id, managerId: sarahChen.id, locationId: offices[0].id },
    { firstName: 'Anna', lastName: 'Kowalski', email: 'anna.kowalski@talentflow.dev', hireDate: new Date('2022-01-15'), salary: 90000, departmentId: dataTeam.id, roleId: dataAnalyst.id, managerId: sarahChen.id, locationId: offices[3].id },
    { firstName: 'Ryan', lastName: 'Foster', email: 'ryan.foster@talentflow.dev', hireDate: new Date('2022-10-01'), salary: 85000, departmentId: dataTeam.id, roleId: dataAnalyst.id, managerId: sarahChen.id, locationId: offices[1].id },

    // Product team under Liam
    { firstName: 'Isabella', lastName: 'Martinez', email: 'isabella.martinez@talentflow.dev', hireDate: new Date('2021-08-16'), salary: 135000, departmentId: product.id, roleId: productMgr.id, managerId: liamPatel.id, locationId: offices[0].id },
    { firstName: 'Daniel', lastName: 'Kim', email: 'daniel.kim@talentflow.dev', hireDate: new Date('2022-05-09'), salary: 88000, departmentId: product.id, roleId: dataAnalyst.id, managerId: liamPatel.id, locationId: offices[4].id },

    // Design team under Mia
    { firstName: 'Charlotte', lastName: 'Brown', email: 'charlotte.brown@talentflow.dev', hireDate: new Date('2021-10-04'), salary: 95000, departmentId: design.id, roleId: designer.id, managerId: miaKimura.id, locationId: offices[2].id },
    { firstName: 'Lucas', lastName: 'Anderson', email: 'lucas.anderson@talentflow.dev', hireDate: new Date('2022-06-20'), salary: 85000, departmentId: design.id, roleId: designer.id, managerId: miaKimura.id, locationId: offices[0].id },
    { firstName: 'Yuki', lastName: 'Sato', email: 'yuki.sato@talentflow.dev', hireDate: new Date('2023-03-01'), salary: 78000, departmentId: design.id, roleId: designer.id, managerId: miaKimura.id, locationId: offices[4].id },

    // HR team under Emma
    { firstName: 'Grace', lastName: 'Thompson', email: 'grace.thompson@talentflow.dev', hireDate: new Date('2020-05-18'), salary: 82000, departmentId: hr.id, roleId: hrSpecialist.id, managerId: emmaWilson.id, locationId: offices[1].id },
    { firstName: 'Ethan', lastName: 'Clark', email: 'ethan.clark@talentflow.dev', hireDate: new Date('2022-02-14'), salary: 75000, departmentId: hr.id, roleId: hrSpecialist.id, managerId: emmaWilson.id, locationId: offices[0].id },

    // Marketing under Oliver
    { firstName: 'Amelia', lastName: 'Wright', email: 'amelia.wright@talentflow.dev', hireDate: new Date('2021-12-01'), salary: 88000, departmentId: marketing.id, roleId: dataAnalyst.id, managerId: oliverSchmidt.id, locationId: offices[2].id },
    { firstName: 'Noah', lastName: 'Davis', email: 'noah.davis@talentflow.dev', hireDate: new Date('2022-07-11'), salary: 78000, departmentId: marketing.id, roleId: designer.id, managerId: oliverSchmidt.id, locationId: offices[3].id },
    { firstName: 'Sophie', lastName: 'Mueller', email: 'sophie.mueller@talentflow.dev', hireDate: new Date('2023-04-15'), salary: 65000, departmentId: marketing.id, roleId: juniorDev.id, managerId: oliverSchmidt.id, locationId: offices[3].id },

    // Sales
    { firstName: 'Jack', lastName: 'Robinson', email: 'jack.robinson@talentflow.dev', hireDate: new Date('2021-05-01'), salary: 72000, departmentId: sales.id, roleId: salesRep.id, locationId: offices[1].id },
    { firstName: 'Emily', lastName: 'Hughes', email: 'emily.hughes@talentflow.dev', hireDate: new Date('2021-11-15'), salary: 68000, departmentId: sales.id, roleId: salesRep.id, locationId: offices[2].id },
    { firstName: 'Benjamin', lastName: 'Allen', email: 'benjamin.allen@talentflow.dev', hireDate: new Date('2022-09-01'), salary: 65000, departmentId: sales.id, roleId: salesRep.id, locationId: offices[0].id },
    { firstName: 'Hannah', lastName: 'White', email: 'hannah.white@talentflow.dev', hireDate: new Date('2023-01-16'), salary: 60000, departmentId: sales.id, roleId: salesRep.id, locationId: offices[1].id },
    { firstName: 'Mason', lastName: 'Harris', email: 'mason.harris@talentflow.dev', hireDate: new Date('2023-07-01'), salary: 58000, departmentId: sales.id, roleId: salesRep.id, locationId: offices[4].id },

    // More eng to reach ~50
    { firstName: 'Zara', lastName: 'Ali', email: 'zara.ali@talentflow.dev', hireDate: new Date('2022-11-01'), salary: 100000, departmentId: engineering.id, roleId: midDev.id, managerId: alexRivera.id, locationId: offices[2].id },
    { firstName: 'Oscar', lastName: 'Larsson', email: 'oscar.larsson@talentflow.dev', hireDate: new Date('2023-05-15'), salary: 70000, departmentId: engineering.id, roleId: juniorDev.id, managerId: alexRivera.id, locationId: offices[3].id },
    { firstName: 'Chloe', lastName: 'Dubois', email: 'chloe.dubois@talentflow.dev', hireDate: new Date('2023-08-01'), salary: 72000, departmentId: platform.id, roleId: juniorDev.id, managerId: jordanTaylor.id, locationId: offices[3].id },
    { firstName: 'Leo', lastName: 'Rossi', email: 'leo.rossi@talentflow.dev', hireDate: new Date('2023-09-15'), salary: 68000, departmentId: engineering.id, roleId: juniorDev.id, managerId: alexRivera.id, locationId: offices[3].id },

    // Terminated / On Leave employees
    { firstName: 'Michael', lastName: 'Stone', email: 'michael.stone@talentflow.dev', hireDate: new Date('2020-08-01'), salary: 110000, status: EmployeeStatus.TERMINATED, departmentId: engineering.id, roleId: seniorDev.id, managerId: alexRivera.id, locationId: offices[0].id },
    { firstName: 'Lily', lastName: 'Evans', email: 'lily.evans@talentflow.dev', hireDate: new Date('2021-03-15'), salary: 95000, status: EmployeeStatus.ON_LEAVE, departmentId: product.id, roleId: productMgr.id, managerId: liamPatel.id, locationId: offices[2].id },
    { firstName: 'Nathan', lastName: 'Brooks', email: 'nathan.brooks@talentflow.dev', hireDate: new Date('2022-01-10'), salary: 70000, status: EmployeeStatus.TERMINATED, departmentId: sales.id, roleId: salesRep.id, locationId: offices[1].id },
  ];

  for (const empData of bulkEmployees) {
    await createEmployee({
      ...empData,
      status: empData.status || EmployeeStatus.ACTIVE,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${empData.firstName.toLowerCase()}`,
    });
  }

  // Update department heads
  await prisma.department.update({ where: { id: engineering.id }, data: { headId: sarahChen.id } });
  await prisma.department.update({ where: { id: product.id }, data: { headId: liamPatel.id } });
  await prisma.department.update({ where: { id: design.id }, data: { headId: miaKimura.id } });
  await prisma.department.update({ where: { id: hr.id }, data: { headId: emmaWilson.id } });
  await prisma.department.update({ where: { id: marketing.id }, data: { headId: oliverSchmidt.id } });
  await prisma.department.update({ where: { id: platform.id }, data: { headId: jordanTaylor.id } });

  // ─── Users ────────────────────────────────────────────
  await prisma.user.create({
    data: { firebaseUid: 'admin-uid-001', email: 'sarah.chen@talentflow.dev', role: UserRole.ADMIN, employeeId: sarahChen.id },
  });
  await prisma.user.create({
    data: { firebaseUid: 'hr-uid-001', email: 'emma.wilson@talentflow.dev', role: UserRole.HR_MANAGER, employeeId: emmaWilson.id },
  });
  await prisma.user.create({
    data: { firebaseUid: 'lead-uid-001', email: 'alex.rivera@talentflow.dev', role: UserRole.TEAM_LEAD, employeeId: alexRivera.id },
  });
  await prisma.user.create({
    data: { firebaseUid: 'emp-uid-001', email: 'marcus.johnson@talentflow.dev', role: UserRole.EMPLOYEE, employeeId: employees.find(e => e.email === 'marcus.johnson@talentflow.dev')!.id },
  });

  // ─── Review Cycles ───────────────────────────────────
  const q4Review = await prisma.reviewCycle.create({
    data: {
      name: 'Q4 2025 Performance Review',
      type: ReviewCycleType.QUARTERLY,
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-12-31'),
      status: ReviewCycleStatus.COMPLETED,
    },
  });

  const annualReview = await prisma.reviewCycle.create({
    data: {
      name: '2025 Annual Review',
      type: ReviewCycleType.ANNUAL,
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-01-31'),
      status: ReviewCycleStatus.ACTIVE,
    },
  });

  // ─── Performance Reviews ──────────────────────────────
  const reviewCategories = ['Technical Skills', 'Communication', 'Leadership', 'Problem Solving', 'Teamwork'];

  // Create reviews for Q4 cycle
  const activeEmployees = [sarahChen, ...employees.filter(e => e.status === 'ACTIVE')].slice(0, 15);

  for (const emp of activeEmployees) {
    const reviewer = emp.managerId
      ? [sarahChen, ...employees].find(e => e.id === emp.managerId) || sarahChen
      : sarahChen;

    const overallScore = 3 + Math.random() * 2; // 3-5 range

    const review = await prisma.performanceReview.create({
      data: {
        employeeId: emp.id,
        reviewerId: reviewer.id,
        cycleId: q4Review.id,
        overallScore: Math.round(overallScore * 10) / 10,
        comments: `${emp.firstName} demonstrated strong performance this quarter.`,
        status: ReviewStatus.FINALIZED,
      },
    });

    // Create ratings
    for (const category of reviewCategories) {
      await prisma.rating.create({
        data: {
          reviewId: review.id,
          category,
          score: Math.floor(3 + Math.random() * 3), // 3-5
          comments: `Good performance in ${category.toLowerCase()}.`,
        },
      });
    }

    // Create goals
    await prisma.goal.create({
      data: {
        reviewId: review.id,
        title: 'Improve technical documentation',
        description: 'Write comprehensive docs for all major features',
        status: GoalStatus.IN_PROGRESS,
        dueDate: new Date('2026-03-31'),
      },
    });

    await prisma.goal.create({
      data: {
        reviewId: review.id,
        title: 'Mentorship',
        description: 'Mentor at least one junior team member',
        status: GoalStatus.NOT_STARTED,
        dueDate: new Date('2026-06-30'),
      },
    });
  }

  // ─── Audit Logs ───────────────────────────────────────
  const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
  if (adminUser) {
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'CREATE',
        entityType: 'ReviewCycle',
        entityId: q4Review.id,
        changes: { name: 'Q4 2025 Performance Review' },
      },
    });
  }

  const totalEmployees = await prisma.employee.count();
  const totalDepartments = await prisma.department.count();
  const totalReviews = await prisma.performanceReview.count();

  console.log(`Seeded: ${totalEmployees} employees, ${totalDepartments} departments, ${totalReviews} reviews`);
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
