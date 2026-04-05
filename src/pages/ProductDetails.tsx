import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product } from '../types';
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck, Share2, Heart, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const path = `products/${id}`;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!product) return <div className="text-center py-20">Product not found.</div>;

  return (
    <div className="pb-32 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 font-bold text-sm transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Shop
        </button>
        <div className="flex space-x-2">
          <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors">
            <Share2 size={20} />
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 transition-colors">
            <Heart size={20} />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-sm aspect-square relative group"
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 left-6">
              <span className="bg-white/90 backdrop-blur-md text-gray-900 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                {product.category}
              </span>
            </div>
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-gray-100 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                <img src={product.image} className="w-full h-full object-cover" alt="Thumbnail" />
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col">
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <span className="text-gray-400 text-sm font-bold">4.9 (128 Reviews)</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-display font-black text-indigo-600">{formatPrice(product.price)}</span>
                <span className="text-gray-400 line-through text-lg">{formatPrice(product.price * 1.2)}</span>
              </div>
            </div>

            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
                <Zap size={18} />
                <span>Affiliate Bonus</span>
              </div>
              <p className="text-indigo-900/70 text-sm leading-relaxed">
                Share this product with your friends and earn <span className="font-black text-indigo-600">{formatPrice(product.price * 0.1)}</span> in commission for every sale!
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white border border-gray-100 rounded-2xl text-indigo-600 shadow-sm">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-500">On all orders over $50</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white border border-gray-100 rounded-2xl text-indigo-600 shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">2 Year Warranty</p>
                  <p className="text-xs text-gray-500">Full protection plan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 hidden md:block">
            <button 
              onClick={handleAddToCart}
              className={`w-full py-5 rounded-[2rem] font-black text-xl transition-all flex items-center justify-center space-x-3 shadow-2xl ${
                added ? 'bg-green-600 text-white shadow-green-200' : 'bg-gray-900 text-white hover:bg-indigo-600 shadow-indigo-100'
              }`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.div 
                    key="added"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center space-x-2"
                  >
                    <Check size={24} />
                    <span>Added to Cart</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="add"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center space-x-2"
                  >
                    <ShoppingCart size={24} />
                    <span>Add to Cart</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Buy Button */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-40">
        <button 
          onClick={handleAddToCart}
          className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 shadow-xl transition-all ${
            added ? 'bg-green-600 text-white shadow-green-200' : 'bg-indigo-600 text-white shadow-indigo-200'
          }`}
        >
          {added ? <Check size={24} /> : <ShoppingCart size={24} />}
          <span>{added ? 'Added to Cart' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
