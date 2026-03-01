import * as departmentService from '../../services/department.service';
import prisma from '../../services/prisma.service';

export const departmentResolvers = {
  Query: {
    departments: () => departmentService.getDepartments(),
    department: (_: any, { id }: { id: string }) => departmentService.getDepartmentById(id),
    orgChart: () => departmentService.getOrgChart(),
  },
  Mutation: {
    createDepartment: (_: any, { input }: any) => departmentService.createDepartment(input),
    updateDepartment: (_: any, { id, input }: any) => departmentService.updateDepartment(id, input),
    deleteDepartment: (_: any, { id }: { id: string }) => departmentService.deleteDepartment(id),
  },
  Department: {
    head: (parent: any) => {
      if (parent.head !== undefined) return parent.head;
      if (!parent.headId) return null;
      return prisma.employee.findUnique({ where: { id: parent.headId } });
    },
    parent: (parent: any) => {
      if (parent.parent !== undefined) return parent.parent;
      if (!parent.parentDepartmentId) return null;
      return prisma.department.findUnique({ where: { id: parent.parentDepartmentId } });
    },
    children: (parent: any) => {
      if (parent.children) return parent.children;
      return prisma.department.findMany({ where: { parentDepartmentId: parent.id } });
    },
    employees: (parent: any) => {
      if (parent.employees) return parent.employees;
      return prisma.employee.findMany({ where: { departmentId: parent.id } });
    },
    employeeCount: (parent: any) => {
      if (parent._count?.employees !== undefined) return parent._count.employees;
      return prisma.employee.count({ where: { departmentId: parent.id } });
    },
  },
};
