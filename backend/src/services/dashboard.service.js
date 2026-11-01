
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getDashboard = async (ownerId, range = 7) => {
  // Validate analytics range
  const allowedRanges = [7, 30, 90];

  const days = allowedRanges.includes(Number(range))
    ? Number(range)
    : 7;

  // Find restaurant belonging to logged-in owner
  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId },
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const restaurantId = restaurant.id;

  // Get current India date
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  // Calculate starting date using calendar days
  const [year, month, day] = todayKey.split("-").map(Number);

  const todayDate = new Date(
    Date.UTC(year, month - 1, day)
  );

  const startDate = new Date(todayDate);
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

  const startDateKey = startDate.toISOString().slice(0, 10);

  // India timezone boundaries converted to UTC
  const todayStart = new Date(
    `${todayKey}T00:00:00+05:30`
  );

  const tomorrowStart = new Date(
    Date.UTC(year, month - 1, day + 1)
  );

  const tomorrow = new Date(
    tomorrowStart.getTime() - (5 * 60 + 30) * 60 * 1000
  );

  // Revenue eligibility conditions
  const revenueConditions = {
    OR: [
      {
        paymentMethod: "COD",
        status: "DELIVERED",
      },
      {
        paymentMethod: "ONLINE",
        paymentStatus: true,
        status: {
          in: [
            "READY",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
          ],
        },
      },
    ],
  };

  // Fetch dashboard statistics
  const [
    todayOrders,
    pendingOrders,
    completedOrders,
    todayRevenueResult,
    dailyAnalytics,
  ] = await Promise.all([
    // Today's orders
    prisma.order.count({
      where: {
        restaurantId,
        createdAt: {
          gte: todayStart,
          lt: tomorrow,
        },
      },
    }),

    // Pending orders
    prisma.order.count({
      where: {
        restaurantId,
        status: {
          in: [
            "PENDING",
            "CONFIRMED",
            "PREPARING",
            "READY",
            "OUT_FOR_DELIVERY",
          ],
        },
      },
    }),

    // Completed orders
    prisma.order.count({
      where: {
        restaurantId,
        status: "DELIVERED",
      },
    }),

    // Today's revenue
    prisma.order.aggregate({
      where: {
        restaurantId,
        createdAt: {
          gte: todayStart,
          lt: tomorrow,
        },
        ...revenueConditions,
      },
      _sum: {
        totalAmount: true,
      },
    }),

    // Daily orders and revenue
    // Group records by India calendar date
    prisma.$queryRaw`
      WITH dates AS (
        SELECT generate_series(
          ${startDateKey}::date,
          ${todayKey}::date,
          INTERVAL '1 day'
        )::date AS order_date
      )

      SELECT
        d.order_date AS date,

        COUNT(o.id)::int AS orders,

        COALESCE(
          SUM(
            CASE
              WHEN (
                (
                  o."paymentMethod" = 'COD'
                  AND o.status = 'DELIVERED'
                )
                OR
                (
                  o."paymentMethod" = 'ONLINE'
                  AND o."paymentStatus" = true
                  AND o.status IN (
                    'READY',
                    'OUT_FOR_DELIVERY',
                    'DELIVERED'
                  )
                )
              )
              THEN o."totalAmount"
              ELSE 0
            END
          ),
          0
        )::float AS revenue

      FROM dates d

      LEFT JOIN "Order" o
        ON o."restaurantId" = ${restaurantId}

        AND (
          o."createdAt" AT TIME ZONE 'Asia/Kolkata'
        ) >= d.order_date::timestamp

        AND (
          o."createdAt" AT TIME ZONE 'Asia/Kolkata'
        ) < (d.order_date + INTERVAL '1 day')::timestamp

      GROUP BY d.order_date

      ORDER BY d.order_date ASC
    `,
  ]);

  // Format daily analytics
  const dailyOrders = dailyAnalytics.map((item) => ({
    date:
      item.date instanceof Date
        ? item.date.toISOString().slice(0, 10)
        : String(item.date).slice(0, 10),

    orders: Number(item.orders),

    revenue: Number(item.revenue),
  }));

  // Return dashboard response
  return {
    restaurant,

    todayOrders,

    pendingOrders,

    completedOrders,

    todayRevenue: Number(
      todayRevenueResult._sum.totalAmount || 0
    ),

    dailyOrders,

    selectedRange: days,
  };
};
