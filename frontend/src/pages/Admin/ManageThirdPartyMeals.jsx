import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import toast from 'react-hot-toast';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'shops', label: 'Shop storefronts' },
  { id: 'menu', label: 'Menu items' },
  { id: 'orders', label: 'External orders' },
];

const emptySupplierForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  status: 'Inactive',
  logoUrl: '',
  shopTagline: '',
};

const ManageThirdPartyMeals = () => {
  const [tab, setTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);
  const [editingSupplierId, setEditingSupplierId] = useState('');
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const [menuItems, setMenuItems] = useState([]);
  /** Selected active shop when managing menu items (card click). */
  const [menuShopFocus, setMenuShopFocus] = useState(null);

  const [orders, setOrders] = useState([]);
  const [orderFilters, setOrderFilters] = useState({ date: '' });
  const [orderSearch, setOrderSearch] = useState('');
  const [showAllOrders, setShowAllOrders] = useState(false);

  const [shopEdit, setShopEdit] = useState(null);

  const fetchSuppliers = async () => {
    const res = await fetch(`${API}/meals/admin/suppliers`);
    setSuppliers(await res.json());
  };

  const fetchMenuItemsForShop = async (shop) => {
    if (!shop?.email) {
      setMenuItems([]);
      return;
    }
    const res = await fetch(`${API}/meals/admin/menu-items?supplierEmail=${encodeURIComponent(shop.email)}`);
    const data = await res.json();
    setMenuItems(Array.isArray(data) ? data : []);
  };

  const activeSuppliers = useMemo(() => suppliers.filter((s) => s.status === 'Active'), [suppliers]);

  const fetchOrders = async () => {
    const params = new URLSearchParams();
    if (orderFilters.date) params.append('date', orderFilters.date);
    const res = await fetch(`${API}/meals/admin/orders${params.toString() ? `?${params}` : ''}`);
    const data = await res.json();
    setOrders(Array.isArray(data) ? data.filter((o) => o.type === 'External') : []);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (tab !== 'menu') {
      setMenuShopFocus(null);
      setMenuItems([]);
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== 'menu') return;
    if (!menuShopFocus) {
      setMenuItems([]);
      return;
    }
    fetchMenuItemsForShop(menuShopFocus);
  }, [tab, menuShopFocus?._id]);

  useEffect(() => {
    if (tab !== 'menu' || !menuShopFocus?._id) return;
    const stillActive = activeSuppliers.some((s) => String(s._id) === String(menuShopFocus._id));
    if (!stillActive) {
      setMenuShopFocus(null);
      setMenuItems([]);
      toast('This shop is suspended. It was removed from the menu manager.');
    }
  }, [tab, activeSuppliers, menuShopFocus?._id]);

  useEffect(() => {
    if (tab === 'orders') fetchOrders();
  }, [tab]);

  const openCreateSupplier = () => {
    setEditingSupplierId('');
    setSupplierForm(emptySupplierForm);
    setShowSupplierModal(true);
  };

  const openEditSupplier = (s) => {
    setEditingSupplierId(s._id);
    setSupplierForm({
      name: s.name,
      email: s.email,
      phone: s.phone,
      password: '',
      status: s.status || 'Inactive',
      logoUrl: s.logoUrl || '',
      shopTagline: s.shopTagline || '',
    });
    setShowSupplierModal(true);
  };

  const saveSupplier = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: supplierForm.name,
        email: supplierForm.email,
        phone: supplierForm.phone,
        status: supplierForm.status,
        logoUrl: supplierForm.logoUrl,
        shopTagline: supplierForm.shopTagline,
      };
      if (editingSupplierId) {
        if (supplierForm.password?.trim()) payload.password = supplierForm.password;
        const res = await fetch(`${API}/meals/admin/suppliers/${editingSupplierId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.message || 'Could not update supplier.');
          return;
        }
        toast.success('Supplier updated.');
      } else {
        if (!supplierForm.password?.trim()) {
          toast.error('Password is required for new supplier accounts.');
          return;
        }
        const res = await fetch(`${API}/meals/admin/suppliers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, password: supplierForm.password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.message || 'Could not create supplier.');
          return;
        }
        toast.success('Supplier created.');
      }
      setShowSupplierModal(false);
      fetchSuppliers();
    } catch {
      toast.error('Could not save supplier.');
    }
  };

  const deleteSupplier = async (id) => {
    if (!window.confirm('Delete this supplier and their menu items? External orders referencing this shop will block deletion.')) return;
    try {
      const res = await fetch(`${API}/meals/admin/suppliers/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || 'Delete failed.');
        return;
      }
      toast.success('Supplier removed.');
      fetchSuppliers();
    } catch {
      toast.error('Delete failed.');
    }
  };

  const toggleSupplierStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    await fetch(`${API}/auth/update-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user._id, role: 'MealSupplier', status: newStatus }),
    });
    if (menuShopFocus && String(menuShopFocus._id) === String(user._id) && newStatus === 'Inactive') {
      setMenuShopFocus(null);
      setMenuItems([]);
    }
    fetchSuppliers();
    toast.success(`Supplier ${newStatus === 'Active' ? 'activated' : 'suspended'}.`);
  };

  const openShopEdit = (s) => {
    setShopEdit({
      _id: s._id,
      name: s.name,
      logoUrl: s.logoUrl || '',
      shopTagline: s.shopTagline || '',
    });
  };

  const saveShopBranding = async (e) => {
    e.preventDefault();
    if (!shopEdit) return;
    try {
      const res = await fetch(`${API}/meals/admin/suppliers/${shopEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl: shopEdit.logoUrl,
          shopTagline: shopEdit.shopTagline,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || 'Could not update storefront.');
        return;
      }
      toast.success('Shop storefront updated.');
      setShopEdit(null);
      fetchSuppliers();
    } catch {
      toast.error('Could not update storefront.');
    }
  };

  const toggleMenuItemAvailability = async (item) => {
    try {
      const nextAvailability = item.isAvailable === false;
      const res = await fetch(`${API}/meals/supplier/menu/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierEmail: item.supplierEmail,
          isAvailable: nextAvailability,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || 'Could not update menu status.');
        return;
      }
      toast.success(`Menu item ${nextAvailability ? 'activated' : 'suspended'}.`);
      if (menuShopFocus) fetchMenuItemsForShop(menuShopFocus);
    } catch {
      toast.error('Could not update menu status.');
    }
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await fetch(`${API}/meals/supplier/menu/${id}`, { method: 'DELETE' });
      toast.success('Menu item deleted.');
      if (menuShopFocus) fetchMenuItemsForShop(menuShopFocus);
    } catch {
      toast.error('Delete failed.');
    }
  };

  const externalSummary = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    let total = orders.length;
    let monthCount = 0;
    let paid = 0;
    let unpaid = 0;
    orders.forEach((o) => {
      if (o.bookingDate) {
        const d = new Date(o.bookingDate);
        if (d.getMonth() === m && d.getFullYear() === y) monthCount++;
      }
      if (o.paymentStatus === 'Paid') paid++;
      if (o.paymentStatus === 'Unpaid') unpaid++;
    });
    return { total, monthCount, paid, unpaid };
  }, [orders]);

  const filteredOrders = orders.filter((o) => {
    const t = orderSearch.toLowerCase();
    return (
      (o.studentName || '').toLowerCase().includes(t) ||
      (o.externalShopName || '').toLowerCase().includes(t) ||
      (o.deliveryStatus || '').toLowerCase().includes(t)
    );
  });
  const paginatedOrders = showAllOrders ? filteredOrders : filteredOrders.slice(0, 5);

  const exportExternalCsv = () => {
    const headers = [
      'Booking Date',
      'Student',
      'Email',
      'Shop',
      'Menu',
      'Amount',
      'Payment',
      'Delivery',
      'Status',
    ];
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filteredOrders.map((o) => [
      o.bookingDate,
      o.studentName,
      o.studentEmail,
      o.externalShopName,
      o.externalMenuItem,
      o.externalAmount,
      o.paymentStatus,
      o.deliveryStatus,
      o.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `external-meal-orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported external orders.');
  };

  const avatarUrl = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E0F2FE&color=1E3A8A&size=128&bold=true`;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <Link
              to="/admin/meals"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2872A1] hover:text-[#1f5a80]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Meal Management
            </Link>
            <h2 className="text-2xl font-semibold mt-4 text-gray-800">3rd Party Meal Management</h2>
            <p className="text-gray-500 text-sm mt-1">Suppliers, storefronts, menus, and external orders.</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  tab === t.id
                    ? 'bg-[#2872A1] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2872A1]/40'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'suppliers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Meal supplier accounts</h3>
                <button
                  type="button"
                  onClick={openCreateSupplier}
                  className="px-4 py-2 rounded-xl bg-[#2872A1] text-white font-bold text-sm hover:bg-[#1f5a80]"
                >
                  Add supplier
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Phone</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {suppliers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-800">{user.name}</td>
                        <td className="p-4 text-gray-500">{user.email}</td>
                        <td className="p-4 text-gray-500">{user.phone}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditSupplier(user)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSupplierStatus(user)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${
                              user.status === 'Active' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {user.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSupplier(user._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {suppliers.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No meal suppliers yet. Add one or wait for self-registration.</div>
                )}
              </div>
            </div>
          )}

          {tab === 'shops' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop storefronts</h3>
              <p className="text-sm text-gray-500 mb-6">
                Branding for <span className="font-semibold text-gray-700">active</span> suppliers only. Suspended partners are hidden here and from students until reactivated.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSuppliers.map((s) => (
                  <div
                    key={s._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center"
                  >
                    <img
                      src={s.logoUrl?.trim() ? s.logoUrl : avatarUrl(s.name)}
                      alt=""
                      className="h-24 w-24 rounded-2xl object-cover border border-gray-100"
                    />
                    <h4 className="mt-4 text-lg font-bold text-gray-900">{s.name}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[2.5rem]">{s.shopTagline || '—'}</p>
                    <button
                      type="button"
                      onClick={() => openShopEdit(s)}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#2872A1] text-white text-sm font-bold hover:bg-[#1f5a80]"
                    >
                      Edit storefront
                    </button>
                  </div>
                ))}
              </div>
              {activeSuppliers.length === 0 && (
                <div className="text-gray-500 text-sm">No active suppliers. Activate a supplier under Suppliers to manage storefronts.</div>
              )}
            </div>
          )}

          {tab === 'menu' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Menu items</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Only <span className="font-semibold text-gray-700">active</span> shops appear below. Open a shop to suspend, activate, or delete its dishes.
                </p>
              </div>

              {!menuShopFocus ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSuppliers.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => setMenuShopFocus(s)}
                        className="text-left bg-white rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-0.5"
                      >
                        <img
                          src={s.logoUrl?.trim() ? s.logoUrl : avatarUrl(s.name)}
                          alt=""
                          className="h-24 w-24 rounded-2xl object-cover border border-gray-100"
                        />
                        <h4 className="mt-4 text-lg font-bold text-gray-900">{s.name}</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[2.5rem]">{s.shopTagline || '—'}</p>
                        <span className="mt-4 text-sm font-bold text-[#2872A1]">Manage menu →</span>
                      </button>
                    ))}
                  </div>
                  {activeSuppliers.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500 text-sm">
                      No active shops. Activate a supplier first; suspended shops stay hidden here.
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuShopFocus(null);
                        setMenuItems([]);
                      }}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#2872A1] hover:text-[#1f5a80] w-fit"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to shops
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <img
                      src={menuShopFocus.logoUrl?.trim() ? menuShopFocus.logoUrl : avatarUrl(menuShopFocus.name)}
                      alt=""
                      className="h-16 w-16 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{menuShopFocus.name}</h4>
                      <p className="text-sm text-gray-500">{menuShopFocus.shopTagline || 'Menu catalog'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-bold text-gray-900">{item.itemName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.category || 'Main'} · Rs. {item.price}
                              {item.isAvailable === false && (
                                <span className="ml-2 text-amber-700 font-semibold">· Unavailable</span>
                              )}
                            </p>
                            {item.description ? <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p> : null}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                          <button
                            type="button"
                            onClick={() => toggleMenuItemAvailability(item)}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold text-white ${
                              item.isAvailable === false
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                          >
                            {item.isAvailable === false ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMenuItem(item._id)}
                            className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {menuItems.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500 text-sm">
                      No menu items for this shop yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">External meal orders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total (filtered)</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-2">{externalSummary.total}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">This month</p>
                  <p className="text-3xl font-extrabold text-[#2872A1] mt-2">{externalSummary.monthCount}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Paid</p>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-2">{externalSummary.paid}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Unpaid</p>
                  <p className="text-3xl font-extrabold text-amber-600 mt-2">{externalSummary.unpaid}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-3 flex-wrap">
                  <input
                    type="date"
                    value={orderFilters.date}
                    onChange={(e) => setOrderFilters({ date: e.target.value })}
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50 w-full md:max-w-xs"
                  />
                  <input
                    type="text"
                    placeholder="Search student, shop, delivery..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50 w-full md:max-w-sm"
                  />
                  <button
                    type="button"
                    onClick={fetchOrders}
                    className="px-6 py-3 rounded-xl bg-[#2872A1] text-white font-bold hover:bg-[#1f5a80]"
                  >
                    Apply date
                  </button>
                  <button
                    type="button"
                    onClick={exportExternalCsv}
                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 md:ml-auto"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                        <th className="p-4 font-medium">Student</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Shop</th>
                        <th className="p-4 font-medium">Menu</th>
                        <th className="p-4 font-medium">Pay</th>
                        <th className="p-4 font-medium">Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {paginatedOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="p-4">
                            <p className="font-bold text-gray-800">{order.studentName}</p>
                            <p className="text-xs text-gray-500">{order.studentEmail}</p>
                          </td>
                          <td className="p-4 font-semibold text-gray-800">{order.bookingDate}</td>
                          <td className="p-4 text-gray-700">{order.externalShopName}</td>
                          <td className="p-4 text-gray-600 max-w-[180px] truncate" title={order.externalMenuItem}>
                            {order.externalMenuItem}
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold">{order.paymentStatus}</span>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex p-2 rounded-lg border border-gray-200 text-xs font-semibold bg-gray-50 text-gray-700 max-w-[160px]">
                              {order.deliveryStatus || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredOrders.length > 5 && (
                  <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
                    <button
                      type="button"
                      onClick={() => setShowAllOrders(!showAllOrders)}
                      className="flex items-center gap-1.5 text-sm font-bold text-[#2872A1] py-2 px-4 rounded-full bg-blue-50 hover:bg-blue-100"
                    >
                      {showAllOrders ? (
                        <>
                          Show less <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          View all {filteredOrders.length} <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
                {filteredOrders.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No external orders for this filter.</div>
                )}
              </div>
            </div>
          )}

          {showSupplierModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
              <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">{editingSupplierId ? 'Edit supplier' : 'New supplier'}</h4>
                <form onSubmit={saveSupplier} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500">Shop / supplier name</label>
                    <input
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200"
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Email (login)</label>
                    <input
                      type="email"
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200"
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Phone</label>
                    <input
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200"
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm((p) => ({ ...p, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">
                      Password {editingSupplierId ? '(leave blank to keep)' : ''}
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200"
                      value={supplierForm.password}
                      onChange={(e) => setSupplierForm((p) => ({ ...p, password: e.target.value }))}
                      required={!editingSupplierId}
                      placeholder={editingSupplierId ? 'Leave blank to keep current password' : ''}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Status</label>
                    <select
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200"
                      value={supplierForm.status}
                      onChange={(e) => setSupplierForm((p) => ({ ...p, status: e.target.value }))}
                    >
                      <option value="Inactive">Inactive</option>
                      <option value="Active">Active</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Logo URL (optional)</label>
                    <input
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200"
                      value={supplierForm.logoUrl}
                      onChange={(e) => setSupplierForm((p) => ({ ...p, logoUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Shop tagline (optional)</label>
                    <input
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200"
                      value={supplierForm.shopTagline}
                      onChange={(e) => setSupplierForm((p) => ({ ...p, shopTagline: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 py-3 rounded-xl bg-[#2872A1] text-white font-bold">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSupplierModal(false)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {shopEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
              <form onSubmit={saveShopBranding} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-1">Edit storefront</h4>
                <p className="text-sm text-gray-500 mb-4">{shopEdit.name}</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500">Logo URL</label>
                    <input
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200"
                      value={shopEdit.logoUrl}
                      onChange={(e) => setShopEdit((p) => ({ ...p, logoUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Tagline</label>
                    <input
                      className="mt-1 w-full p-3 rounded-xl border border-gray-200"
                      value={shopEdit.shopTagline}
                      onChange={(e) => setShopEdit((p) => ({ ...p, shopTagline: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 py-3 rounded-xl bg-[#2872A1] text-white font-bold">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShopEdit(null)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default ManageThirdPartyMeals;
