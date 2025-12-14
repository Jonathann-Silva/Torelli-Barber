import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import { db } from '../../firebaseConfig';
import { Barber } from '../../types';
import { BARBERS as MOCK_BARBERS } from '../../constants';

const ClientBarbers = () => {
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = db.collection('barbers').onSnapshot((snapshot) => {
        if (!snapshot.empty) {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Barber[];
            setBarbers(fetched);
        } else {
            setBarbers(MOCK_BARBERS);
        }
        setLoading(false);
    }, (error) => {
        console.warn("Error fetching barbers:", error);
        setBarbers(MOCK_BARBERS);
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
          <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-slate-900 dark:text-white">Nossos Profissionais</h2>
        </div>
      </header>

      <main className="px-4 py-6 flex flex-col gap-4 pb-24">
        {loading ? (
             <div className="flex justify-center py-10"><span className="size-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin"></span></div>
        ) : (
            barbers.map(barber => (
                <div key={barber.id} className="bg-white dark:bg-surface-dark-blue rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div className="size-20 rounded-xl bg-cover bg-center border border-gray-200 dark:border-gray-700" style={{ backgroundImage: `url("${barber.image}")` }}></div>
                        <div className="absolute -bottom-2 -right-2 bg-primary-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-[10px] filled">star</span>
                            {barber.rating}
                        </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{barber.name}</h3>
                        <p className="text-sm text-primary-blue font-medium mb-1">{barber.specialty || 'Barbeiro'}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                             <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">content_cut</span> {barber.reviews} cortes</span>
                             <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                             <span className="text-green-500 font-bold">Disponível hoje</span>
                        </div>
                    </div>
                    <button 
                       onClick={() => navigate('/client/booking')}
                       className="shrink-0 size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-white hover:bg-primary-blue hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">calendar_add_on</span>
                    </button>
                </div>
            ))
        )}
      </main>
    </ClientLayout>
  );
};

export default ClientBarbers;