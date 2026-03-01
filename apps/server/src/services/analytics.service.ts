import prisma from './prisma.service';

export async function getAnalytics(startDate?: Date, endDate?: Date) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Total & active employees
  const totalEmployees = await prisma.employee.count();
  const activeEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });

  // New hires in last 30 days
  const newHires30d = await prisma.employee.count({
    where: { hireDate: { gte: thirtyDaysAgo }, status: 'ACTIVE' },
  });

  // Turnover rate (terminated / total * 100)
  const terminated = await prisma.employee.count({ where: { status: 'TERMINATED' } });
  const turnoverRate = totalEmployees > 0 ? (terminated / totalEmployees) * 100 : 0;

  // Average tenure (in years)
  const activeEmps = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    select: { hireDate: true },
  });
  const avgTenureMs =
    activeEmps.length > 0
      ? activeEmps.reduce((sum, e) => sum + (now.getTime() - e.hireDate.getTime()), 0) / activeEmps.length
      : 0;
  const averageTenure = avgTenureMs / (1000 * 60 * 60 * 24 * 365.25);

  // Average salary
  const salaryAgg = await prisma.employee.aggregate({
    where: { status: 'ACTIVE' },
    _avg: { salary: true },
  });
  const averageSalary = salaryAgg._avg.salary || 0;

  // Headcount trend (last 12 months)
  const headcountTrend = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const count = await prisma.employee.count({
      where: {
        hireDate: { lte: endOfMonth },
        OR: [
          { status: { not: 'TERMINATED' } },
          { status: 'TERMINATED', updatedAt: { gt: endOfMonth } },
        ],
      },
    });
    headcountTrend.push({
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      count,
    });
  }

  // Department distribution
  const deptCounts = await prisma.employee.groupBy({
    by: ['departmentId'],
    where: { status: 'ACTIVE' },
    _count: true,
  });
  const departments = await prisma.department.findMany();
  const departmentDistribution = deptCounts.map((dc) => {
    const dept = departments.find((d) => d.id === dc.departmentId);
    return {
      department: dept?.name || 'Unknown',
      count: dc._count,
      percentage: activeEmployees > 0 ? (dc._count / activeEmployees) * 100 : 0,
    };
  });

  // Turnover trend (last 12 months) - simplified
  const turnoverTrend = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const termCount = await prisma.employee.count({
      where: {
        status: 'TERMINATED',
        updatedAt: { gte: monthStart, lte: monthEnd },
      },
    });
    const monthLabel = monthStart.toLocaleString('default', { month: 'short', year: 'numeric' });
    turnoverTrend.push({
      month: monthLabel,
      terminations: termCount,
      rate: totalEmployees > 0 ? (termCount / totalEmployees) * 100 : 0,
    });
  }

  // Tenure by department
  const allActiveEmps = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    include: { department: true },
  });
  const deptTenure: Record<string, number[]> = {};
  for (const emp of allActiveEmps) {
    const tenure = (now.getTime() - emp.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (!deptTenure[emp.department.name]) deptTenure[emp.department.name] = [];
    deptTenure[emp.department.name].push(tenure);
  }
  const tenureByDepartment = Object.entries(deptTenure).map(([dept, tenures]) => ({
    department: dept,
    averageTenure: tenures.reduce((a, b) => a + b, 0) / tenures.length,
  }));

  // Salary bands
  const salaryRanges = [
    { range: '<$70k', min: 0, max: 70000 },
    { range: '$70k-$100k', min: 70000, max: 100000 },
    { range: '$100k-$130k', min: 100000, max: 130000 },
    { range: '$130k-$160k', min: 130000, max: 160000 },
    { range: '$160k+', min: 160000, max: Infinity },
  ];
  const salaryBands = await Promise.all(
    salaryRanges.map(async (sr) => ({
      range: sr.range,
      count: await prisma.employee.count({
        where: {
          status: 'ACTIVE',
          salary: { gte: sr.min, ...(sr.max !== Infinity ? { lt: sr.max } : {}) },
        },
      }),
    }))
  );

  return {
    totalEmployees,
    activeEmployees,
    newHires30d,
    turnoverRate: Math.round(turnoverRate * 100) / 100,
    averageTenure: Math.round(averageTenure * 100) / 100,
    averageSalary: Math.round(averageSalary),
    headcountTrend,
    departmentDistribution,
    turnoverTrend,
    tenureByDepartment,
    salaryBands,
  };
}
