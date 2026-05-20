import { FiActivity, FiLogIn, FiLogOut, FiShoppingBag, FiCreditCard, FiUser, FiEdit, FiLock, FiUnlock, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const UserActivityLog = ({ activities }) => {
  const getActivityIcon = (action) => {
    const iconMap = {
      login: FiLogIn,
      logout: FiLogOut,
      order_placed: FiShoppingBag,
      payment_made: FiCreditCard,
      profile_updated: FiUser,
      password_changed: FiLock,
      account_blocked: FiLock,
      account_unblocked: FiUnlock,
      email_changed: FiMail,
      phone_changed: FiPhone,
      address_added: FiMapPin,
      address_updated: FiMapPin,
      order_cancelled: FiShoppingBag,
      order_returned: FiShoppingBag,
      review_added: FiEdit,
      wishlist_updated: FiEdit
    };
    return iconMap[action] || FiActivity;
  };

  const getActivityColor = (action) => {
    const colorMap = {
      login: 'text-green-600 dark:text-green-400',
      logout: 'text-gray-600 dark:text-gray-400',
      order_placed: 'text-blue-600 dark:text-blue-400',
      payment_made: 'text-green-600 dark:text-green-400',
      profile_updated: 'text-purple-600 dark:text-purple-400',
      password_changed: 'text-orange-600 dark:text-orange-400',
      account_blocked: 'text-red-600 dark:text-red-400',
      account_unblocked: 'text-green-600 dark:text-green-400',
      email_changed: 'text-blue-600 dark:text-blue-400',
      phone_changed: 'text-blue-600 dark:text-blue-400',
      address_added: 'text-indigo-600 dark:text-indigo-400',
      address_updated: 'text-indigo-600 dark:text-indigo-400',
      order_cancelled: 'text-red-600 dark:text-red-400',
      order_returned: 'text-yellow-600 dark:text-yellow-400',
      review_added: 'text-pink-600 dark:text-pink-400',
      wishlist_updated: 'text-teal-600 dark:text-teal-400'
    };
    return colorMap[action] || 'text-gray-600 dark:text-gray-400';
  };

  const getActivityBadge = (action) => {
    const badgeMap = {
      login: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      logout: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      order_placed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      payment_made: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      profile_updated: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      password_changed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      account_blocked: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      account_unblocked: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      email_changed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      phone_changed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      address_added: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      address_updated: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      order_cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      order_returned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      review_added: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
      wishlist_updated: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300'
    };
    return badgeMap[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const formatActivityAction = (action) => {
    return action.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FiActivity className="h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Activity Yet</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This user's activity will appear here once they start using the platform.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const IconComponent = getActivityIcon(activity.action);
        const iconColor = getActivityColor(activity.action);
        const badgeStyle = getActivityBadge(activity.action);

        return (
          <div key={index} className="flex items-start space-x-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700`}>
              <IconComponent className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${badgeStyle}`}>
                    {formatActivityAction(activity.action)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-900 dark:text-white">
                {activity.details || `${formatActivityAction(activity.action)}`}
              </p>
              {activity.ipAddress && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  IP: {activity.ipAddress}
                  {activity.browser && ` • ${activity.browser}`}
                  {activity.device && ` • ${activity.device}`}
                </p>
              )}
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-2 rounded-2xl bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Details:</p>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserActivityLog;