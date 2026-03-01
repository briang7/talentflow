import * as reviewService from '../../services/review.service';
import prisma from '../../services/prisma.service';

export const reviewResolvers = {
  Query: {
    reviewCycles: () => reviewService.getReviewCycles(),
    reviewCycle: (_: any, { id }: { id: string }) => reviewService.getReviewCycleById(id),
    review: (_: any, { id }: { id: string }) => reviewService.getReviewById(id),
    myReviews: (_: any, __: any, context: any) => {
      if (!context.user?.employeeId) return [];
      return prisma.performanceReview.findMany({
        where: { employeeId: context.user.employeeId },
        include: { cycle: true, ratings: true, goals: true, reviewer: true, employee: true },
      });
    },
  },
  Mutation: {
    createReviewCycle: (_: any, { input }: any) => reviewService.createReviewCycle(input),
    updateReviewCycle: (_: any, { id, input }: any) => reviewService.updateReviewCycle(id, input),
    createReview: (_: any, { input }: any) => reviewService.createReview(input),
    submitReview: (_: any, { id, input }: any) => reviewService.submitReview(id, input),
    finalizeReview: (_: any, { id }: { id: string }) => reviewService.finalizeReview(id),
  },
  ReviewCycle: {
    reviews: (parent: any) => {
      if (parent.reviews) return parent.reviews;
      return prisma.performanceReview.findMany({
        where: { cycleId: parent.id },
        include: { employee: true, reviewer: true, ratings: true, goals: true },
      });
    },
  },
  PerformanceReview: {
    employee: (parent: any) => {
      if (parent.employee) return parent.employee;
      return prisma.employee.findUnique({ where: { id: parent.employeeId } });
    },
    reviewer: (parent: any) => {
      if (parent.reviewer) return parent.reviewer;
      return prisma.employee.findUnique({ where: { id: parent.reviewerId } });
    },
    cycle: (parent: any) => {
      if (parent.cycle) return parent.cycle;
      return prisma.reviewCycle.findUnique({ where: { id: parent.cycleId } });
    },
    ratings: (parent: any) => {
      if (parent.ratings) return parent.ratings;
      return prisma.rating.findMany({ where: { reviewId: parent.id } });
    },
    goals: (parent: any) => {
      if (parent.goals) return parent.goals;
      return prisma.goal.findMany({ where: { reviewId: parent.id } });
    },
  },
};
