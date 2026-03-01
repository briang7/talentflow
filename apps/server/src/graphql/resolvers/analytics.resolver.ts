import * as analyticsService from '../../services/analytics.service';

export const analyticsResolvers = {
  Query: {
    analytics: (_: any, { startDate, endDate }: { startDate?: Date; endDate?: Date }) => {
      return analyticsService.getAnalytics(startDate, endDate);
    },
  },
};
