import prisma from './prisma.service';

export async function getDepartments() {
  return prisma.department.findMany({
    include: {
      head: true,
      parent: true,
      children: true,
      _count: { select: { employees: true } },
    },
  });
}

export async function getDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
    include: {
      head: true,
      parent: true,
      children: true,
      employees: { include: { role: true } },
      _count: { select: { employees: true } },
    },
  });
}

export async function createDepartment(input: any) {
  return prisma.department.create({
    data: input,
    include: { head: true, parent: true, children: true },
  });
}

export async function updateDepartment(id: string, input: any) {
  return prisma.department.update({
    where: { id },
    data: input,
    include: { head: true, parent: true, children: true },
  });
}

export async function deleteDepartment(id: string) {
  await prisma.department.delete({ where: { id } });
  return true;
}

export async function getOrgChart() {
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    include: { department: true, role: true },
    orderBy: { role: { level: 'desc' } },
  });

  const buildTree = (managerId: string | null): any[] => {
    return employees
      .filter((e) => e.managerId === managerId)
      .map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        title: e.role.title,
        avatar: e.avatar,
        departmentName: e.department.name,
        children: buildTree(e.id),
      }));
  };

  return buildTree(null);
}
