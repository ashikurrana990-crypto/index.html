import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Order, AffiliateStats } from '../types';
import { formatPrice } from '../lib/utils';
import { Copy, CheckCircle2, Clock, XCircle, TrendingUp, DollarSign, Users, Link as LinkIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { user, profile, isAffiliate, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AffiliateStats>({
    totalEarnings: 0,
    pendingEarnings: 0,
    completedEarnings: 0,
    referralCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const path = 'orders';
      try {
        let q;
        if (isAdmin) {
          q = query(collection(db, path), orderBy('createdAt', 'desc'));
        } else if (isAffiliate) {
          q = query(collection(db, path), where('affiliateId', '==', user.uid), orderBy('createdAt', 'desc'));
        } else {
          q = query(collection(db, path), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        }

        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...(data as object) } as Order;
        });
        setOrders(fetchedOrders);

        if (isAffiliate) {
          const total = fetchedOrders.reduce((acc, o) => acc + (o.commissionAmount || 0), 0);
          const pending = fetchedOrders.filter(o => o.status === 'pending').reduce((acc, o) => acc + (o.commissionAmount || 0), 0);
          const completed = fetchedOrders.filter(o => o.status === 'completed').reduce((acc, o) => acc + (o.commissionAmount || 0), 0);
          
          setStats({
            totalEarnings: total,
            pendingEarnings: pending,
            completedEarnings: completed,
            referralCount: fetchedOrders.length,
          });
        }
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    };

    fetchData();
  }, [user, isAffiliate, isAdmin]);

  const referralLink = `${window.location.origin}?ref=${user?.uid}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  const chartData = [
    { name: 'Pending', value: stats.pendingEarnings },
    { name: 'Completed', value: stats.completedEarnings },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.displayName}</h1>
          <p className="text-gray-500 text-sm">Here's what's happening with your account.</p>
        </div>
        {isAffiliate && (
          <div className="flex items-center space-x-2 bg-indigo-50 p-2 rounded-xl border border-indigo-100">
            <span className="text-xs font-bold text-indigo-600 px-2 truncate max-w-[200px]">
              {referralLink}
            </span>
            <button 
              onClick={copyToClipboard}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              <span className="text-xs font-bold">{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        )}
      </div>

      {isAffiliate && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg w-fit mb-3">
              <DollarSign size={20} />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase">Total Earnings</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(stats.totalEarnings)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-3">
              <Clock size={20} />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase">Pending</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(stats.pendingEarnings)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit mb-3">
              <TrendingUp size={20} />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase">Completed</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(stats.completedEarnings)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit mb-3">
              <Users size={20} />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase">Referrals</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats.referralCount}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    {isAffiliate && <th className="px-6 py-3">Commission</th>}
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-gray-900">#{order.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-900">{formatPrice(order.totalAmount)}</td>
                      {isAffiliate && (
                        <td className="px-6 py-4 text-xs font-bold text-indigo-600">
                          {formatPrice(order.commissionAmount || 0)}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                          order.status === 'completed' ? 'bg-green-50 text-green-600' :
                          order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isAffiliate && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Earnings Overview</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-indigo-600 p-6 rounded-3xl text-white space-y-4">
            <h2 className="text-lg font-bold">Need Help?</h2>
            <p className="text-indigo-100 text-sm">Our support team is available 24/7 to assist you with any questions.</p>
            <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
