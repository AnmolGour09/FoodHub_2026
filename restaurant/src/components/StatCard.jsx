import { TrendingUp } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon = TrendingUp,
  color = "bg-orange-500",
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6 border border-gray-100">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm font-medium">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div
          className={`${color} w-14 h-14 rounded-xl flex items-center justify-center shadow-md`}
        >
          <Icon
            size={28}
            className="text-white"
          />
        </div>
      </div>
    </div>
  );
}

export default StatCard;