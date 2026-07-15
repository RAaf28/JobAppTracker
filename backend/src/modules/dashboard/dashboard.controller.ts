import { Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { AuthRequest } from '../../types';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // Fetch all applications for the user
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        company: { select: { name: true } },
      },
    });

    const totalApplications = applications.length;

    // Filters for stats
    const wishlistCount = applications.filter((app) => app.status === 'Wishlist').length;
    const appliedCount = applications.filter((app) => app.status === 'Applied').length;
    const offersCount = applications.filter(
      (app) => app.status === 'Offer' || app.status === 'Accepted'
    ).length;
    const rejectionsCount = applications.filter((app) => app.status === 'Rejected').length;

    // Interviews count - let's fetch total interview counts
    const interviewsCount = await prisma.interview.count({
      where: { application: { userId } },
    });

    // Response rate calculation
    const nonWishlistApps = applications.filter((app) => app.status !== 'Wishlist');
    const totalNonWishlist = nonWishlistApps.length;
    const respondedApps = nonWishlistApps.filter((app) => app.status !== 'Applied');
    const responseRate = totalNonWishlist > 0 ? (respondedApps.length / totalNonWishlist) * 100 : 0;

    // Applications this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const appsThisMonthCount = applications.filter((app) => {
      const appDate = new Date(app.appliedDate);
      return appDate >= startOfMonth;
    }).length;

    // Upcoming interviews
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        application: { userId },
        date: { gte: todayStart },
      },
      include: {
        application: {
          select: {
            position: true,
            company: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
      take: 5,
    });

    // Charts: Applications by Month (current year)
    const currentYear = now.getFullYear();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const appsByMonth = months.map((month, index) => {
      const count = applications.filter((app) => {
        const appDate = new Date(app.appliedDate);
        return appDate.getFullYear() === currentYear && appDate.getMonth() === index;
      }).length;
      return { month, count };
    });

    // Charts: Applications by Status
    const statusCounts: Record<string, number> = {};
    applications.forEach((app) => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    const appsByStatus = Object.keys(statusCounts).map((status) => ({
      status,
      count: statusCounts[status],
    }));

    // Charts: Applications by Company (top 5)
    const companyCounts: Record<string, number> = {};
    applications.forEach((app) => {
      const companyName = app.company.name;
      companyCounts[companyName] = (companyCounts[companyName] || 0) + 1;
    });
    const appsByCompany = Object.keys(companyCounts)
      .map((company) => ({
        company,
        count: companyCounts[company],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.json({
      success: true,
      stats: {
        totalApplications,
        interviews: interviewsCount,
        offers: offersCount,
        rejections: rejectionsCount,
        responseRate: Math.round(responseRate * 10) / 10,
        appsThisMonth: appsThisMonthCount,
      },
      upcomingInterviews,
      charts: {
        appsByMonth,
        appsByStatus,
        appsByCompany,
      },
    });
  } catch (error) {
    return next(error);
  }
};
