import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {change !== undefined && (
          <div className="flex items-center mt-2">
            {changeType === 'increase' ? (
              <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : changeType === 'decrease' ? (
              <FiTrendingDown className="h-4 w-4 text-red-500 mr-1" />
            ) : (
              <FiActivity className="h-4 w-4 text-gray-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              changeType === 'increase' ? 'text-green-600 dark:text-green-400' :
              changeType === 'decrease' ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {change}
            </span>
          </div>
        )}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const UserAnalytics = ({ userStats, userGrowthData, orderData }) => {

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  // Prepare data for charts
  const userGrowthChartData = userGrowthData || [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 150 },
    { month: 'Mar', users: 180 },
    { month: 'Apr', users: 220 },
    { month: 'May', users: 280 },
    { month: 'Jun', users: 320 }
  ];

  const orderStatusData = orderData || [
    { name: 'Delivered', value: 45, color: '#10B981' },
    { name: 'Processing', value: 25, color: '#3B82F6' },
    { name: 'Shipped', value: 20, color: '#F59E0B' },
    { name: 'Cancelled', value: 10, color: '#EF4444' }
  ];

  const spendingData = userStats?.monthlySpending || [
    { month: 'Jan', amount: 15000 },
    { month: 'Feb', amount: 18000 },
    { month: 'Mar', amount: 22000 },
    { month: 'Apr', amount: 25000 },
    { month: 'May', amount: 28000 },
    { month: 'Jun', amount: 32000 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={formatNumber(userStats?.totalUsers || 0)}
          change={userStats?.userGrowth || '+12%'}
          changeType="increase"
          icon={FiUsers}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Users"
          value={formatNumber(userStats?.activeUsers || 0)}
          change={userStats?.activeUserGrowth || '+8%'}
          changeType="increase"
          icon={FiActivity}
          color="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(userStats?.totalOrders || 0)}
          change={userStats?.orderGrowth || '+15%'}
          changeType="increase"
          icon={FiShoppingBag}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(userStats?.totalRevenue || 0)}
          change={userStats?.revenueGrowth || '+22%'}
          changeType="increase"
          icon={FiDollarSign}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="99%" height={320}>
              <AreaChart data={userGrowthChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F9FAFB',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                  formatter={(value) => [formatNumber(value), 'Users']}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3B82F6"
                  fill="url(#userGrowthGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="99%" height={320}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F9FAFB',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value) => [`${value}%`, 'Orders']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {orderStatusData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Spending Chart */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Monthly Spending Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="99%" height={320}>
            <BarChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
                formatter={(value) => [formatCurrency(value), 'Revenue']}
              />
              <Bar
                dataKey="amount"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Demographics */}
      {userStats?.demographics && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Demographics</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {userStats.demographics.ageGroups?.young || 0}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">18-25 years</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {userStats.demographics.ageGroups?.adult || 0}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">26-45 years</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {userStats.demographics.ageGroups?.senior || 0}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">46+ years</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Gender Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Male</span>
                  <span className="text-gray-900 dark:text-white">{userStats.demographics.gender?.male || 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Female</span>
                  <span className="text-gray-900 dark:text-white">{userStats.demographics.gender?.female || 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Other</span>
                  <span className="text-gray-900 dark:text-white">{userStats.demographics.gender?.other || 0}%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Top Locations</h4>
              <div className="space-y-2">
                {userStats.demographics.topCities?.slice(0, 5).map((city, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{city.name}</span>
                    <span className="text-gray-900 dark:text-white">{city.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;