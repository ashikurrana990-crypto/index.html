import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, generateId } from '../lib/utils';
import { Trash2, Plus, Minus, ShoppingBag, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.displayName || '',
    phone: '',
    address: '',
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) return;

    setLoading(true);
    const path = 'orders';
    try {
      const referralId = localStorage.getItem('referralId');
      const orderId = generateId();
      
      const commissionAmount = referralId 
        ? items.reduce((acc, item) => acc + (item.price * item.quantity * (item.commissionRate || 0.1)), 0)
        : 0;

      const orderData = {
        id: orderId,
        userId: user.uid,
        items: items,
        totalAmount: totalPrice,
        status: 'pending',
        affiliateId: referralId || null,
        commissionAmount: commissionAmount,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, path), orderData);

      // WhatsApp Message
      const message = `*New Order from Grabify Store*%0A%0A` +
        `*Order ID:* ${orderId}%0A` +
        `*Customer:* ${formData.name}%0A` +
        `*Phone:* ${formData.phone}%0A` +
        `*Address:* ${formData.address}%0A%0A` +
        `*Items:*%0A` +
        items.map(i => `- ${i.name} (x${i.quantity}) - ${formatPrice(i.price * i.quantity)}`).join('%0A') +
        `%0A%0A*Total:* ${formatPrice(totalPrice)}`;

      const whatsappUrl = `https://wa.me/1234567890?text=${message}`; // Replace with real admin phone
      
      clearCart();
      window.open(whatsappUrl, '_blank');
      navigate('/');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-indigo-600">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 pb-24">
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
        {items.map((item) => (
          <motion.div 
            layout
            key={item.id}
            className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center space-x-4"
          >
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-20 h-20 object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">{item.name}</h3>
              <p className="text-indigo-600 font-bold text-sm">{formatPrice(item.price)}</p>
              <div className="flex items-center space-x-3 mt-2">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <button 
              onClick={() => removeFromCart(item.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Shipping Details</h2>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
              <input 
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="+1 234 567 890"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Address</label>
              <textarea 
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="123 Street Name, City, Country"
              />
            </div>
            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-3 shadow-lg shadow-green-100"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send size={20} />
                  <span>Order via WhatsApp</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;
