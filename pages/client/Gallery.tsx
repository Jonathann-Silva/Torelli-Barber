import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import { db } from '../../firebaseConfig';

interface GalleryImage {
  id: string;
  url: string;
}

const ClientGallery = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = db.collection('gallery').orderBy('uploadedAt', 'desc').onSnapshot(snapshot => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryImage[];
      setImages(fetched);
      setLoading(false);
    }, (error) => {
        console.warn("Error fetching gallery:", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Limit to 5 images as requested
  const displayImages = images.slice(0, 5);

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
        {loading ? (
             <div className="flex justify-center py-10"><span className="size-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin"></span></div>
        ) : displayImages.length > 0 ? (
            <div className="columns-2 gap-4 space-y-4">
            {displayImages.map(img => (
                <div key={img.id} className="break-inside-avoid rounded-2xl overflow-hidden bg-surface-dark-blue relative group cursor-pointer">
                <img src={img.url} alt="Galeria" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
            ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                 <span className="material-symbols-outlined text-4xl mb-2 text-slate-500">broken_image</span>
                 <p className="text-slate-500">Galeria vazia</p>
            </div>
        )}
      </main>
    </ClientLayout>
  );
};

export default ClientGallery;