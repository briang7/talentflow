import { employeeResolvers } from './employee.resolver';
import { departmentResolvers } from './department.resolver';
import { reviewResolvers } from './review.resolver';
import { analyticsResolvers } from './analytics.resolver';
import { authResolvers } from './auth.resolver';

// Custom scalar for DateTime
const dateTimeScalar = {
  DateTime: {
    __serialize(value: any): string {
      if (value instanceof Date) return value.toISOString();
      return new Date(value).toISOString();
    },
    __parseValue(value: any): Date {
      return new Date(value);
    },
    __parseLiteral(ast: any): Date | null {
      if (ast.kind === 'StringValue') return new Date(ast.value);
      return null;
    },
  },
  JSON: {
    __serialize(value: any) { return value; },
    __parseValue(value: any) { return value; },
    __parseLiteral(ast: any) { return ast.value; },
  },
};

// Deep merge resolvers
function mergeResolvers(...resolverSets: any[]) {
  const merged: any = {};
  for (const resolvers of resolverSets) {
    for (const [key, value] of Object.entries(resolvers)) {
      if (merged[key]) {
        merged[key] = { ...merged[key], ...(value as any) };
      } else {
        merged[key] = { ...(value as any) };
      }
    }
  }
  return merged;
}

export const resolvers = mergeResolvers(
  dateTimeScalar,
  employeeResolvers,
  departmentResolvers,
  reviewResolvers,
  analyticsResolvers,
  authResolvers
);
