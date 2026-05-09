import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import User from "@/models/User";
import JobCategory from "@/models/JobCategory";
import { Users, UserCircle, Briefcase, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const [customerCount, userCount, categoryCount, customers] = await Promise.all([
    Customer.countDocuments(),
    User.countDocuments(),
    JobCategory.countDocuments(),
    Customer.find({}).select("totalAmount balancePayment advancePayment").limit(1000),
  ]);

  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const totalBalance = customers.reduce((sum, c) => sum + (c.balancePayment || 0), 0);

  const stats = [
    { label: "Total Customers", value: customerCount, icon: UserCircle, color: "bg-blue-500" },
    { label: "Total Users", value: userCount, icon: Users, color: "bg-purple-500" },
    { label: "Job Categories", value: categoryCount, icon: Briefcase, color: "bg-green-500" },
    { label: "Outstanding Balance", value: `€${totalBalance.toLocaleString()}`, icon: DollarSign, color: "bg-orange-500" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {(session?.user as any)?.username}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <div className={`${stat.color} rounded-lg p-2`}>
                <stat.icon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Revenue Summary</h2>
        <p className="text-gray-500 text-sm mb-4">Overall financial overview</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-600 font-medium mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-blue-700">€{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-green-600 font-medium mb-1">Collected</p>
            <p className="text-xl font-bold text-green-700">€{(totalRevenue - totalBalance).toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-xs text-orange-600 font-medium mb-1">Outstanding</p>
            <p className="text-xl font-bold text-orange-700">€{totalBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
