import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';

const GALLERY_IMAGES = [
  { id: 1, category: 'Cortes', url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop', title: 'Degradê Clássico' },
  { id: 2, category: 'Barba', url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop', title: 'Barba Lenhador' },
  { id: 3, category: 'Cortes', url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=600&auto=format&fit=crop', title: 'Corte Social' },
  { id: 4, category: 'Ambiente', url: 'https://images.unsplash.com/photo-1503951914290-93a354cd2d92?q=80&w=600&auto=format&fit=crop', title: 'Nossa Cadeira' },
  { id: 5, category: 'Cortes', url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600&auto=format&fit=crop', title: 'Fade Moderno' },
  { id: 6, category: 'Barba', url: 'https://images.unsplash.com/photo-1555465910-31f7f20a184d?q=80&w=600&auto=format&fit=crop', title: 'Bigode Estilizado' },
  { id: 7, category: 'Ambiente', url: 'https://images.unsplash.com/photo-1634302086887-13b566695228?q=80&w=600&auto=format&fit=crop', title: 'Lounge' },
];

const ClientGallery = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Todos');

  const filteredImages = filter === 'Todos' 
    ? GALLERY_IMAGES 
    : GALLERY_IMAGES.filter(img => img.category === filter);

  return (
    <ClientLayout>
      <header className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark-blue/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center p-4 justify-between h-16">
          <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Galeria</h2>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
           {['Todos', 'Cortes', 'Barba', 'Ambiente'].map(cat => (
             <button 
               key={cat}
               onClick={() => setFilter(cat)}
               className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                 filter === cat 
                 ? 'bg-primary-gold text-black shadow-lg shadow-primary-gold/20' 
                 : 'bg-white dark:bg-surface-dark-blue text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Masonry-like Grid */}
        <div className="columns-2 gap-4 space-y-4">
          {filteredImages.map(img => (
            <div key={img.id} className="break-inside-avoid rounded-2xl overflow-hidden bg-surface-dark-blue relative group cursor-pointer">
              <img src={img.url} alt={img.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                 <p className="text-white font-bold text-sm">{img.title}</p>
                 <p className="text-primary-gold text-xs">{img.category}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </ClientLayout>
  );
};

export default ClientGallery;