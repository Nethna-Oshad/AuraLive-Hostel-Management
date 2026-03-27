import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import MealSidebar from './MealSidebar';
import MealNavbar from './MealNavbar';

const initialForm = {
  itemName: '',
  category: 'Main',
  price: '',
  prepTimeMinutes: 30,
  description: '',
  isAvailable: true,
};

const MealMenuManagement = () => {
  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch (error) {
      return null;
    }
  }, []);

  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState('');

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/meals/supplier/menu?supplierEmail=${encodeURIComponent(userInfo?.email || '')}`
      );
      const data = await response.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load menu items.');
    }
  };

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'MealSupplier') return;
    fetchMenuItems();
  }, [userInfo]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        supplierName: userInfo.name,
        supplierEmail: userInfo.email,
        itemName: formData.itemName,
        category: formData.category,
        price: Number(formData.price),
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        description: formData.description,
        isAvailable: formData.isAvailable,
      };

      const url = editingId
        ? `http://localhost:5000/api/meals/supplier/menu/${editingId}`
        : 'http://localhost:5000/api/meals/supplier/menu';
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save menu item.');
      }

      toast.success(editingId ? 'Menu item updated.' : 'Menu item added.');
      setFormData(initialForm);
      setEditingId('');
      fetchMenuItems();
    } catch (error) {
      toast.error(error.message || 'Failed to save menu item.');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      itemName: item.itemName,
      category: item.category || 'Main',
      price: item.price,
      prepTimeMinutes: item.prepTimeMinutes || 30,
      description: item.description || '',
      isAvailable: item.isAvailable !== false,
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/meals/supplier/menu/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete menu item.');
      }
      toast.success('Menu item deleted.');
      fetchMenuItems();
    } catch (error) {
      toast.error(error.message || 'Delete failed.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MealSidebar />
      <div className="flex flex-col flex-1">
        <MealNavbar />
        <main className="flex-1 p-8">
          <h2 className="text-3xl font-bold text-gray-800">Menu Management</h2>
          <p className="mb-6 text-sm text-gray-500">Create and maintain your meal catalog, prices, and availability.</p>

          <form onSubmit={handleSave} className="grid grid-cols-1 gap-3 p-5 mb-6 bg-white border border-gray-100 md:grid-cols-3 rounded-xl">
            <input id="menu-item-name" name="itemName" value={formData.itemName} onChange={(e) => setFormData((p) => ({ ...p, itemName: e.target.value }))} placeholder="Item name" required className="px-3 py-2 border border-gray-200 rounded-lg" />
            <input id="menu-item-category" name="category" value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className="px-3 py-2 border border-gray-200 rounded-lg" />
            <input id="menu-item-price" name="price" type="number" min="0" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} placeholder="Price (LKR)" required className="px-3 py-2 border border-gray-200 rounded-lg" />
            <input id="menu-item-prep" name="prepTimeMinutes" type="number" min="1" value={formData.prepTimeMinutes} onChange={(e) => setFormData((p) => ({ ...p, prepTimeMinutes: e.target.value }))} placeholder="Prep time (minutes)" className="px-3 py-2 border border-gray-200 rounded-lg" />
            <input id="menu-item-description" name="description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="px-3 py-2 border border-gray-200 rounded-lg md:col-span-2" />
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input id="menu-item-available" name="isAvailable" type="checkbox" checked={formData.isAvailable} onChange={(e) => setFormData((p) => ({ ...p, isAvailable: e.target.checked }))} />
              Available for orders
            </label>
            <div className="flex gap-2 md:col-span-3">
              <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                {editingId ? 'Update Item' : 'Add Item'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(''); setFormData(initialForm); }} className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="overflow-hidden bg-white border border-gray-100 rounded-xl">
            {menuItems.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No menu items created yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs tracking-wider text-gray-500 uppercase border-b border-gray-100">
                      <th className="p-4 font-bold">Item</th>
                      <th className="p-4 font-bold">Category</th>
                      <th className="p-4 font-bold">Price</th>
                      <th className="p-4 font-bold">Prep Time</th>
                      <th className="p-4 font-bold">Availability</th>
                      <th className="p-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {menuItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-semibold text-gray-800">{item.itemName}</p>
                          <p className="text-xs text-gray-500">{item.description || '-'}</p>
                        </td>
                        <td className="p-4 text-gray-700">{item.category}</td>
                        <td className="p-4 font-semibold text-gray-800">Rs. {item.price}</td>
                        <td className="p-4 text-gray-700">{item.prepTimeMinutes} mins</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="p-4 space-x-2">
                          <button onClick={() => handleEdit(item)} className="px-3 py-1 text-xs font-bold text-blue-700 rounded-lg bg-blue-50 hover:bg-blue-100">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="px-3 py-1 text-xs font-bold text-red-700 rounded-lg bg-red-50 hover:bg-red-100">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MealMenuManagement;
