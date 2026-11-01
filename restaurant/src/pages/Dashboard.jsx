
import { useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useDashboard } from "../context/DashboardContext";

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      <h2 className="truncate text-sm text-gray-500 md:text-base">
        {title}
      </h2>

      <p className="mt-2 break-words text-2xl font-bold md:text-3xl">
        {value}
      </p>
    </div>
  );
}

function Dashboard() {
  const {
    dashboard,
    loading,
    error,
    refreshDashboard,
  } = useDashboard();

  const [period, setPeriod] = useState(7);
  const [chartType, setChartType] = useState("orders");

  const handlePeriodChange = async (event) => {
    const selectedPeriod = Number(event.target.value);

    setPeriod(selectedPeriod);

    try {
      await refreshDashboard(selectedPeriod);
    } catch (err) {
      console.error("Analytics update failed:", err);
    }
  };

  // Backend returns dailyOrders
  const chartData = useMemo(() => {
    const records = Array.isArray(dashboard?.dailyOrders)
      ? dashboard.dailyOrders
      : [];

    const recordsByDate = new Map(
      records.map((record) => [
        String(record.date).slice(0, 10),
        record,
      ])
    );

    const today = new Date();
    const result = [];

    for (let index = period - 1; index >= 0; index--) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - index
      );

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const key = `${year}-${month}-${day}`;

      const record = recordsByDate.get(key);

      result.push({
        date: key,
        day: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        orders: Number(record?.orders ?? 0),
        revenue: Number(record?.revenue ?? 0),
      });
    }

    return result;
  }, [dashboard?.dailyOrders, period]);

  const totalOrders = chartData.reduce(
    (sum, item) => sum + item.orders,
    0
  );

  const totalRevenue = chartData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const chartIsEmpty = chartData.every(
    (item) => item.orders === 0 && item.revenue === 0
  );

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="p-8 text-center">
        <p className="font-semibold text-red-600">{error}</p>

        <button
          onClick={() => refreshDashboard(period).catch(() => {})}
          className="mt-4 rounded-lg bg-orange-500 px-5 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden p-4 md:p-8">

      <h1 className="mb-6 break-words text-2xl font-bold md:text-3xl">
        {dashboard?.restaurant?.name || "Restaurant Dashboard"}
      </h1>

      {/* Dashboard Statistics */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">

        <StatCard
          title="Today's Orders"
          value={dashboard?.todayOrders ?? 0}
        />

        <StatCard
          title="Pending Orders"
          value={dashboard?.pendingOrders ?? 0}
        />

        <StatCard
          title="Completed Orders"
          value={dashboard?.completedOrders ?? 0}
        />

        <StatCard
          title="Today's Revenue"
          value={formatCurrency(dashboard?.todayRevenue)}
        />

      </div>

      {/* Restaurant Analytics */}

      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Restaurant Analytics
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Monitor your daily orders and revenue.
            </p>
          </div>

          <select
            value={period}
            onChange={handlePeriodChange}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 disabled:opacity-50"
            aria-label="Select analytics period"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

        </div>

        {/* Selected Period Summary */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-sm text-gray-600">
              Orders in selected period
            </p>

            <p className="mt-1 text-2xl font-bold text-orange-600">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-sm text-gray-600">
              Revenue in selected period
            </p>

            <p className="mt-1 break-words text-2xl font-bold text-green-700">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

        </div>

        {/* Chart Selector */}

        <div className="mb-5 flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() => setChartType("orders")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              chartType === "orders"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Daily Orders
          </button>

          <button
            type="button"
            onClick={() => setChartType("revenue")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              chartType === "revenue"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Daily Revenue
          </button>

        </div>

        {/* Analytics Chart */}

        {loading ? (
          <div className="flex h-72 items-center justify-center text-gray-500">
            Updating analytics...
          </div>
        ) : chartIsEmpty ? (
          <div className="flex h-72 items-center justify-center rounded-xl bg-gray-50 px-4 text-center md:h-96">
            <div>
              <p className="font-semibold text-gray-700">
                No order data available
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Once orders are received, your daily analytics will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-72 w-full min-w-0 md:h-96">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  interval={period === 7 ? 0 : "preserveStartEnd"}
                  tickMargin={10}
                />

                <YAxis
                  allowDecimals={chartType === "revenue"}
                  tick={{ fontSize: 12 }}
                  width={65}
                  tickFormatter={(value) =>
                    chartType === "revenue"
                      ? value >= 1000
                        ? `₹${(value / 1000).toFixed(1)}k`
                        : `₹${value}`
                      : value
                  }
                />

                <Tooltip
                  cursor={{ fill: "#FFF7ED" }}
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => [
                    chartType === "revenue"
                      ? formatCurrency(value)
                      : value,
                    chartType === "revenue" ? "Revenue" : "Orders",
                  ]}
                />

                <Bar
                  dataKey={chartType}
                  name={chartType === "revenue" ? "Revenue" : "Orders"}
                  fill={chartType === "revenue" ? "#16A34A" : "#F97316"}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={40}
                  isAnimationActive
                />

              </BarChart>

            </ResponsiveContainer>

          </div>
        )}

      </section>
    </div>
  );
}

export default Dashboard;
