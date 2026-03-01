import prisma from './prisma.service';
import { Prisma } from '@prisma/client';

interface EmployeeFilter {
  search?: string;
  departmentId?: string;
  status?: string;
  locationId?: string;
  roleId?: string;
  hireDateFrom?: Date;
  hireDateTo?: Date;
}

interface EmployeeSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

const sortFieldMap: Record<string, string> = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  HIRE_DATE: 'hireDate',
  SALARY: 'salary',
  DEPARTMENT: 'departmentId',
  STATUS: 'status',
};

export async function getEmployees(
  first: number = 20,
  after?: string,
  filter?: EmployeeFilter,
  sort?: EmployeeSort
) {
  const where: Prisma.EmployeeWhereInput = {};

  if (filter) {
    if (filter.search) {
      where.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.departmentId) where.departmentId = filter.departmentId;
    if (filter.status) where.status = filter.status as any;
    if (filter.locationId) where.locationId = filter.locationId;
    if (filter.roleId) where.roleId = filter.roleId;
    if (filter.hireDateFrom || filter.hireDateTo) {
      where.hireDate = {};
      if (filter.hireDateFrom) where.hireDate.gte = filter.hireDateFrom;
      if (filter.hireDateTo) where.hireDate.lte = filter.hireDateTo;
    }
  }

  const orderBy: Prisma.EmployeeOrderByWithRelationInput = sort
    ? { [sortFieldMap[sort.field] || 'lastName']: sort.direction.toLowerCase() as Prisma.SortOrder }
    : { lastName: 'asc' };

  const totalCount = await prisma.employee.count({ where });

  const cursor = after ? { id: after } : undefined;
  const skip = after ? 1 : 0;

  const employees = await prisma.employee.findMany({
    where,
    orderBy,
    take: first + 1,
    skip,
    cursor,
    include: { department: true, role: true, location: true },
  });

  const hasNextPage = employees.length > first;
  const edges = employees.slice(0, first).map((emp) => ({
    cursor: emp.id,
    node: emp,
  }));

  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: !!after,
      startCursor: edges[0]?.cursor || null,
      endCursor: edges[edges.length - 1]?.cursor || null,
      totalCount,
    },
  };
}

export async function getEmployeeById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: { department: true, role: true, location: true, manager: true, reports: true },
  });
}

export async function createEmployee(input: any) {
  return prisma.employee.create({
    data: input,
    include: { department: true, role: true, location: true },
  });
}

export async function updateEmployee(id: string, input: any) {
  return prisma.employee.update({
    where: { id },
    data: input,
    include: { department: true, role: true, location: true },
  });
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
  return true;
}

export async function getEmployeeCount() {
  return prisma.employee.count();
}
