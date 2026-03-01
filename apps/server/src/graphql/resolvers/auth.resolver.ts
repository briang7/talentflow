import * as authService from '../../services/auth.service';
import prisma from '../../services/prisma.service';

export const authResolvers = {
  Query: {
    me: (_: any, __: any, context: any) => {
      return context.user || null;
    },
    roles: () => prisma.role.findMany({ orderBy: { level: 'asc' } }),
    offices: () => prisma.office.findMany({ orderBy: { name: 'asc' } }),
  },
  Mutation: {
    login: async (_: any, { firebaseToken }: { firebaseToken: string }) => {
      return authService.loginWithToken(firebaseToken);
    },
  },
  AuthUser: {
    employee: (parent: any) => {
      if (parent.employee) return parent.employee;
      if (!parent.employeeId) return null;
      return prisma.employee.findUnique({ where: { id: parent.employeeId } });
    },
  },
};
