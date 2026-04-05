import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, ChevronRight, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const path = 'products';
      try {
        const q = query(collection(db, path), limit(12));
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...(data as object) } as Product;
        });
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section - Editorial Style */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden rounded-[2rem] bg-gray-900">
        <img 
          src="https://picsum.photos/seed/grabify-hero/1920/1080?blur=2" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl px-8 md:px-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center space-x-2 bg-indigo-600/20 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest"
          >
            <Zap size={14} />
            <span>New Arrivals 2026</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-extrabold text-white leading-[0.9] tracking-tight"
          >
            SHOP SMART. <br />
            <span className="text-indigo-500">EARN MORE.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 text-lg md:text-xl max-w-xl font-light leading-relaxed"
          >
            Discover premium products at unbeatable prices. Join our affiliate network and earn 10% on every referral.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Link to="/cart" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center space-x-2">
              <span>Start Shopping</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/register" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center">
              Become an Affiliate
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-gray-100">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><ShieldCheck size={24} /></div>
          <h3 className="font-bold text-sm">Secure Payments</h3>
          <p className="text-xs text-gray-500">100% encrypted checkout</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Zap size={24} /></div>
          <h3 className="font-bold text-sm">Fast Delivery</h3>
          <p className="text-xs text-gray-500">2-3 business days</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={24} /></div>
          <h3 className="font-bold text-sm">Affiliate Program</h3>
          <p className="text-xs text-gray-500">Earn 10% commission</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Star size={24} /></div>
          <h3 className="font-bold text-sm">Top Rated</h3>
          <p className="text-xs text-gray-500">4.9/5 average rating</p>
        </div>
      </section>

      {/* Categories - Pill Navigation */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900">Shop by Category</h2>
          <button className="text-indigo-600 text-sm font-bold flex items-center hover:translate-x-1 transition-transform">
            View All <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button 
              key={cat}
              className="flex-shrink-0 px-8 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product List - Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900">Featured Products</h2>
          <div className="flex space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span className="w-2 h-2 rounded-full bg-gray-200"></span>
            <span className="w-2 h-2 rounded-full bg-gray-200"></span>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-3xl"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-300">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <ShoppingCart size={32} />
            </div>
            <p className="text-gray-500 font-medium">No products available yet.</p>
            <Link to="/admin" className="text-indigo-600 font-bold mt-2 inline-block">Go to Admin to add products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div 
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      {product.category}
                    </span>
                  </div>
                </Link>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-yellow-400">
                      <Star size={12} fill="currentColor" />
                      <span className="text-gray-900 text-xs font-bold ml-1">4.9</span>
                    </div>
                    <span className="text-indigo-600 text-xs font-black">10% EARN</span>
                  </div>
                  <Link to={`/product/${product.id}`} className="block text-base font-bold text-gray-900 truncate hover:text-indigo-600 transition-colors">
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xl font-display font-black text-gray-900">{formatPrice(product.price)}</p>
                    <button 
                      onClick={() => addToCart(product)}
                      className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-indigo-600 transition-all active:scale-95"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Affiliate CTA Section */}
      <section className="bg-indigo-600 rounded-[2rem] p-8 md:p-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <h2 className="text-4xl md:text-5xl font-display font-black leading-tight">
            Turn your influence <br /> into income.
          </h2>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-xl">
            Join thousands of affiliates earning passive income by sharing products they love. Get your unique link, track your earnings, and get paid instantly.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/register" className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl shadow-black/10">
              Join the Network
            </Link>
            <div className="flex items-center space-x-4 text-sm font-bold">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-indigo-600" alt="User" />
                ))}
              </div>
              <span>Join 5,000+ Affiliates</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
