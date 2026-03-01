import * as employeeService from '../../services/employee.service';
import prisma from '../../services/prisma.service';

export const employeeResolvers = {
  Query: {
    employees: (_: any, args: any) => {
      return employeeService.getEmployees(
        args.first || 20,
        args.after,
        args.filter,
        args.sort
      );
    },
    employee: (_: any, { id }: { id: string }) => {
      return employeeService.getEmployeeById(id);
    },
    employeeCount: () => {
      return employeeService.getEmployeeCount();
    },
  },
  Mutation: {
    createEmployee: (_: any, { input }: any) => {
      return employeeService.createEmployee(input);
    },
    updateEmployee: (_: any, { id, input }: any) => {
      return employeeService.updateEmployee(id, input);
    },
    deleteEmployee: (_: any, { id }: { id: string }) => {
      return employeeService.deleteEmployee(id);
    },
  },
  Employee: {
    department: (parent: any) => {
      if (parent.department) return parent.department;
      return prisma.department.findUnique({ where: { id: parent.departmentId } });
    },
    role: (parent: any) => {
      if (parent.role) return parent.role;
      return prisma.role.findUnique({ where: { id: parent.roleId } });
    },
    manager: (parent: any) => {
      if (parent.manager !== undefined) return parent.manager;
      if (!parent.managerId) return null;
      return prisma.employee.findUnique({ where: { id: parent.managerId } });
    },
    reports: (parent: any) => {
      if (parent.reports) return parent.reports;
      return prisma.employee.findMany({ where: { managerId: parent.id } });
    },
    location: (parent: any) => {
      if (parent.location) return parent.location;
      return prisma.office.findUnique({ where: { id: parent.locationId } });
    },
    reviewsReceived: (parent: any) => {
      return prisma.performanceReview.findMany({
        where: { employeeId: parent.id },
        include: { cycle: true, ratings: true, goals: true, reviewer: true },
      });
    },
  },
};
