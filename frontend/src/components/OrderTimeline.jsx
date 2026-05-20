const badgeStyles = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  Processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
  Shipped: 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300',
  Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  Returned: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
  Refunded: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/20 dark:text-fuchsia-300',
  'Out for Delivery': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
  'In Transit': 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300',
  'Cancel Requested': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  'Refund Initiated': 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
};

const OrderTimeline = ({ timeline = [] }) => {
  const sortedTimeline = [...timeline].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (!sortedTimeline.length) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No timeline updates available.</p>;
  }

  return (
    <div className="space-y-6">
      {sortedTimeline.map((event, index) => (
        <div key={`${event.status}-${index}`} className="relative pl-8">
          <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-primary-600 ring-4 ring-white dark:ring-gray-900"></span>
          <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{event.status}</h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[event.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                {event.updatedBy || 'admin'}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{event.message || 'Status update recorded.'}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;
