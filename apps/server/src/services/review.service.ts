import prisma from './prisma.service';

export async function getReviewCycles() {
  const cycles = await prisma.reviewCycle.findMany({
    include: {
      reviews: { include: { ratings: true } },
    },
    orderBy: { startDate: 'desc' },
  });

  return cycles.map((cycle) => {
    const totalReviews = cycle.reviews.length;
    const completedReviews = cycle.reviews.filter(
      (r) => r.status === 'FINALIZED' || r.status === 'REVIEWED'
    ).length;
    const scores = cycle.reviews
      .filter((r) => r.overallScore !== null)
      .map((r) => r.overallScore!);

    return {
      ...cycle,
      completionRate: totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
    };
  });
}

export async function getReviewCycleById(id: string) {
  const cycle = await prisma.reviewCycle.findUnique({
    where: { id },
    include: {
      reviews: {
        include: { employee: true, reviewer: true, ratings: true, goals: true },
      },
    },
  });

  if (!cycle) return null;

  const totalReviews = cycle.reviews.length;
  const completedReviews = cycle.reviews.filter(
    (r) => r.status === 'FINALIZED' || r.status === 'REVIEWED'
  ).length;
  const scores = cycle.reviews
    .filter((r) => r.overallScore !== null)
    .map((r) => r.overallScore!);

  return {
    ...cycle,
    completionRate: totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0,
    averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
  };
}

export async function createReviewCycle(input: any) {
  return prisma.reviewCycle.create({ data: input });
}

export async function updateReviewCycle(id: string, input: any) {
  return prisma.reviewCycle.update({ where: { id }, data: input });
}

export async function getReviewById(id: string) {
  return prisma.performanceReview.findUnique({
    where: { id },
    include: {
      employee: { include: { department: true, role: true } },
      reviewer: true,
      cycle: true,
      ratings: true,
      goals: true,
    },
  });
}

export async function createReview(input: any) {
  return prisma.performanceReview.create({
    data: {
      employeeId: input.employeeId,
      reviewerId: input.reviewerId,
      cycleId: input.cycleId,
    },
    include: { employee: true, reviewer: true, cycle: true, ratings: true, goals: true },
  });
}

export async function submitReview(id: string, input: any) {
  // Delete existing ratings and goals, then create new ones
  await prisma.rating.deleteMany({ where: { reviewId: id } });
  await prisma.goal.deleteMany({ where: { reviewId: id } });

  return prisma.performanceReview.update({
    where: { id },
    data: {
      overallScore: input.overallScore,
      comments: input.comments,
      status: 'SUBMITTED',
      ratings: {
        create: input.ratings.map((r: any) => ({
          category: r.category,
          score: r.score,
          comments: r.comments,
        })),
      },
      goals: {
        create: (input.goals || []).map((g: any) => ({
          title: g.title,
          description: g.description,
          dueDate: g.dueDate,
        })),
      },
    },
    include: { employee: true, reviewer: true, cycle: true, ratings: true, goals: true },
  });
}

export async function finalizeReview(id: string) {
  return prisma.performanceReview.update({
    where: { id },
    data: { status: 'FINALIZED' },
    include: { employee: true, reviewer: true, cycle: true, ratings: true, goals: true },
  });
}
