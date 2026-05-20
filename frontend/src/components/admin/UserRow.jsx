import { useState } from 'react';
import { FiEdit2, FiTrash2, FiUnlock, FiLock, FiEye } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateUserRole, toggleUserBlock, deleteUser } from '../../redux/slices/userAdminSlice';

const UserRow = ({ user }) => {
  const dispatch = useDispatch();
  const [showRoleEdit, setShowRoleEdit] = useState(false);
  const [newRole, setNewRole] = useState(user.role);

  const handleRoleUpdate = () => {
    dispatch(updateUserRole({ id: user._id, role: newRole }));
    setShowRoleEdit(false);
  };

  const handleStatusUpdate = () => {
    dispatch(toggleUserBlock({ id: user._id, block: !user.isBlocked }));
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      dispatch(deleteUser(user._id));
    }
  };

  const formattedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <img 
              className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
              src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
              alt={user.name} 
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {showRoleEdit ? (
          <div className="flex items-center space-x-2">
            <select 
              value={newRole} 
              onChange={(e) => setNewRole(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 focus:outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleRoleUpdate} className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700">Save</button>
            <button onClick={() => setShowRoleEdit(false)} className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-400">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
              {user.role}
            </span>
            <button onClick={() => setShowRoleEdit(true)} className="text-gray-400 hover:text-primary-600 transition-colors" title="Edit Role">
              <FiEdit2 size={14} />
            </button>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formattedDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
          {user.isBlocked ? 'Blocked' : 'Active'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-3">
          <Link
            to={`/admin/user/${user._id}`}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="View Details"
          >
            <FiEye size={18} />
          </Link>
          <button 
            onClick={handleStatusUpdate} 
            className={`${user.isBlocked ? 'text-green-600 hover:text-green-900' : 'text-orange-500 hover:text-orange-700'} transition-colors`}
            title={user.isBlocked ? "Unblock User" : "Block User"}
          >
            {user.isBlocked ? <FiUnlock size={18} /> : <FiLock size={18} />}
          </button>
          <button 
            onClick={handleDelete} 
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete User"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
