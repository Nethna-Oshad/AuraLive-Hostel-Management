import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const ManageLaundry = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:5000/api/auth/laundry');
    setUsers(await res.json());
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await fetch('http://localhost:5000/api/auth/update-status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role: 'Laundry', status: newStatus }),
    });
    fetchUsers();
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Laundry Partners (Pending Approval)</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Business Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{user.name}</td>
                    <td className="p-4 text-gray-500">{user.email}</td>
                    <td className="p-4 text-gray-500">{user.phone}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => toggleStatus(user._id, user.status)} className={`px-4 py-2 rounded-lg text-white font-medium text-xs transition-colors ${user.status === 'Active' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {user.status === 'Active' ? 'Suspend' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="p-8 text-center text-gray-500">No laundry partners registered yet.</div>}
          </div>
        </main>
      </div>
    </div>
  );
};
export default ManageLaundry;