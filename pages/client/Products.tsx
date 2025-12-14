import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import { db } from '../../firebaseConfig';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const ClientProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = db.collection('products').onSnapshot(snapshot => {
      if (!snapshot.empty) {
          const fetched = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          })) as Product[];
          setProducts(fetched);
      } else {
          setProducts([]);
      }
      setLoading(false);
    }, (error) => {
        console.warn("Error fetching products:", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ClientLayout>
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark-blue/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center p-4 justify-between h-16">
          <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full p-2 transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-slate-900 dark:text-white">Loja</h2>
        </div>
      </header>

      <main className="px-4 py-6 pb-24">
         <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary-blue to-blue-600 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-1">Oferta Especial</h3>
            <p className="text-sm opacity-90 mb-3">Na compra de 2 produtos, ganhe 10% de desconto no seu próximo corte.</p>
            <button className="bg-white text-primary-blue px-4 py-2 rounded-lg text-sm font-bold">Verificar</button>
         </div>

         {loading ? (
             <div className="flex justify-center py-10"><span className="size-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin"></span></div>
         ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
                {products.map(product => (
                <div key={product.id} className="bg-white dark:bg-surface-dark-blue rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col group">
                    <div className="aspect-square bg-gray-100 dark:bg-black/20 overflow-hidden relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {product.category}
                        </div>
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-tight mb-auto">{product.name}</h4>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="font-bold text-primary-gold">R$ {product.price.toFixed(2)}</span>
                            <button className="size-8 rounded-full bg-primary-blue text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-primary-blue/30">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>
                    </div>
                </div>
                ))}
            </div>
         ) : (
             <div className="flex flex-col items-center justify-center py-10 opacity-50">
                 <span className="material-symbols-outlined text-4xl mb-2 text-slate-500">production_quantity_limits</span>
                 <p className="text-slate-500">Nenhum produto disponível</p>
             </div>
         )}
      </main>
    </ClientLayout>
  );
};

export default ClientProducts;