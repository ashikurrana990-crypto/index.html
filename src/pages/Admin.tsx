import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order } from '../types';
import { formatPrice, generateId } from '../lib/utils';
import { Plus, Trash2, Edit2, Package, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

const Admin: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'Electronics',
    commissionRate: 0.1,
    stock: 10,
  });

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      const pPath = 'products';
      const oPath = 'orders';
      try {
        const pQuery = query(collection(db, pPath), orderBy('createdAt', 'desc'));
        const oQuery = query(collection(db, oPath), orderBy('createdAt', 'desc'));

        const [pSnap, oSnap] = await Promise.all([getDocs(pQuery), getDocs(oQuery)]);

        setProducts(pSnap.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...(data as object) } as Product;
        }));
        setOrders(oSnap.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...(data as object) } as Order;
        }));
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, pPath);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = 'products';
    try {
      const productData = {
        ...newProduct,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, path), productData);
      setProducts([productData as Product, ...products]);
      setShowAddModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        image: '',
        category: 'Electronics',
        commissionRate: 0.1,
        stock: 10,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      // Note: In a real app, we'd need the doc ID from Firestore, not our custom ID
      // For this demo, we'll assume the doc ID is the same or we'd fetch it
      const querySnapshot = await getDocs(query(collection(db, 'products')));
      const docToDelete = querySnapshot.docs.find(d => d.data().id === id);
      if (docToDelete) {
        await deleteDoc(doc(db, 'products', docToDelete.id));
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'completed' | 'cancelled') => {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'orders')));
      const docToUpdate = querySnapshot.docs.find(d => d.data().id === orderId);
      if (docToUpdate) {
        await updateDoc(doc(db, 'orders', docToUpdate.id), { status });
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) return <div className="text-center py-20">Access Denied.</div>;
  if (loading) return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={async () => {
              if (!window.confirm('Seed sample products?')) return;
              const samples = [
                { name: 'iPhone 15 Pro', description: 'The latest iPhone with titanium design.', price: 999, image: 'https://picsum.photos/seed/iphone/800/800', category: 'Electronics', commissionRate: 0.1, stock: 50, createdAt: new Date().toISOString(), id: generateId() },
                { name: 'MacBook Air M3', description: 'Supercharged by M3 chip.', price: 1099, image: 'https://picsum.photos/seed/macbook/800/800', category: 'Electronics', commissionRate: 0.1, stock: 30, createdAt: new Date().toISOString(), id: generateId() },
                { name: 'Nike Air Max', description: 'Classic comfort and style.', price: 120, image: 'https://picsum.photos/seed/nike/800/800', category: 'Fashion', commissionRate: 0.1, stock: 100, createdAt: new Date().toISOString(), id: generateId() },
                { name: 'Sony WH-1000XM5', description: 'Industry leading noise canceling.', price: 349, image: 'https://picsum.photos/seed/sony/800/800', category: 'Electronics', commissionRate: 0.1, stock: 25, createdAt: new Date().toISOString(), id: generateId() },
              ];
              for (const s of samples) {
                await addDoc(collection(db, 'products'), s);
              }
              window.location.reload();
            }}
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Seed Data
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Products Management */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900">
            <Package size={20} />
            <h2 className="text-lg font-bold">Manage Products</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {products.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{formatPrice(product.price)} • Stock: {product.stock}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 size={18} /></button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Orders Management */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900">
            <ShoppingCart size={20} />
            <h2 className="text-lg font-bold">All Orders</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-4 space-y-3 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-gray-900">#{order.id.substring(0, 8)}</p>
                      <p className="text-[10px] text-gray-500">{order.customerName} • {order.customerPhone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      order.status === 'completed' ? 'bg-green-50 text-green-600' :
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-indigo-600">{formatPrice(order.totalAmount)}</p>
                    {order.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input 
                required
                type="text"
                placeholder="Product Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
              <textarea 
                required
                placeholder="Description"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  required
                  type="number"
                  placeholder="Price"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newProduct.price || ''}
                  onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                />
                <input 
                  required
                  type="number"
                  placeholder="Stock"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newProduct.stock || ''}
                  onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                />
              </div>
              <input 
                required
                type="url"
                placeholder="Image URL"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={newProduct.image}
                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
              />
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              >
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home</option>
                <option>Beauty</option>
                <option>Sports</option>
              </select>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                >
                  Save Product
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Admin;
