import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  Wallet,
} from "lucide-react";

import StatCard from "../components/StatCard";
import { useDashboard } from "../context/DashboardContext";

function Dashboard() {
  const { dashboard } = useDashboard();

  return (
    <div className="p-4 md:p-8 w-full overflow-hidden">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 truncate">
        {dashboard?.restaurant?.name || "Pizza Hut"} 
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        <div className="bg-white shadow rounded-xl p-4 md:p-6">
          <h2 className="text-gray-500 text-sm md:text-base truncate">Today's Orders</h2>
          <p className="text-2xl md:text-3xl font-bold">
            {dashboard?.todayOrders ?? 0}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-4 md:p-6">
          <h2 className="text-gray-500 text-sm md:text-base truncate">Pending Orders</h2>
          <p className="text-2xl md:text-3xl font-bold">
            {dashboard?.pendingOrders ?? 0}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-4 md:p-6">
          <h2 className="text-gray-500 text-sm md:text-base truncate">Completed Orders</h2>
          <p className="text-2xl md:text-3xl font-bold">
            {dashboard?.completedOrders ?? 0}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-4 md:p-6">
          <h2 className="text-gray-500 text-sm md:text-base truncate">Today's Revenue</h2>
          <p className="text-2xl md:text-3xl font-bold">
            ₹{dashboard?.todayRevenue ?? 0}
          </p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;