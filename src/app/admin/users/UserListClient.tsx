'use client';

import { useState } from 'react';
import { toggleUserStatus, updateWalletBalance, forceResetPassword } from '@/app/actions/admin-user.actions';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';

function PasswordSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
    >
      {pending ? 'Resetting...' : 'Force Reset Password'}
    </button>
  );
}

export default function UserListClient({ initialUsers, currentQuery }: { initialUsers: any[], currentQuery: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordPending, setPasswordPending] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    setPasswordError(null);
    setPasswordPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await forceResetPassword(selectedUser.id, null, formData);
    setPasswordPending(false);
    if (res?.error) { setPasswordError(res.error); }
    else { setPasswordModalOpen(false); alert('Password reset successfully!'); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/admin/users?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      await toggleUserStatus(userId, currentStatus);
    }
  };

  const handleAddWallet = async () => {
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount === 0) return alert('Enter a valid amount');
    if (confirm(`Add ৳${amount} to ${selectedUser.name}'s wallet?`)) {
      await updateWalletBalance(selectedUser.id, amount);
      setWalletModalOpen(false);
      setWalletAmount('');
    }
  };

  return (
    <div>
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <form onSubmit={handleSearch} className="flex space-x-2 w-full max-w-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or mobile..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role & Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Wallet Balance</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {initialUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.mobile}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-medium text-gray-700 uppercase mb-1">
                      {user.is_admin ? (user.admin_role || 'ADMIN') : 'STUDENT'}
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">৳{user.wallet_balance || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button 
                      onClick={() => { setSelectedUser(user); setWalletModalOpen(true); }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      + Wallet
                    </button>
                    <button 
                      onClick={() => { setSelectedUser(user); setPasswordModalOpen(true); }}
                      className="text-orange-600 hover:text-orange-900"
                    >
                      Reset Pass
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className={user.is_active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                    >
                      {user.is_active ? 'Ban User' : 'Unban'}
                    </button>
                  </td>
                </tr>
              ))}
              {initialUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wallet Modal */}
      {walletModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Wallet Balance</h3>
            <p className="text-sm text-gray-500 mb-4">Add balance to <span className="font-bold">{selectedUser.name}</span>'s account.</p>
            
            <input 
              type="number" 
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
              placeholder="Amount (e.g. 500)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-6"
            />
            
            <div className="flex justify-end space-x-3">
              <button onClick={() => setWalletModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</button>
              <button onClick={handleAddWallet} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700">Add Balance</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Force Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">Set a new password for <span className="font-bold">{selectedUser.name}</span>.</p>
            
            <form onSubmit={handlePasswordReset}>
              {passwordError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">{passwordError}</div>
              )}
              
              <input 
                name="password"
                type="text" 
                required
                placeholder="New Password (min 6 chars)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mb-6"
              />
              
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setPasswordModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</button>
                <button type="submit" disabled={passwordPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 disabled:opacity-50">
                  {passwordPending ? 'Resetting...' : 'Force Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
