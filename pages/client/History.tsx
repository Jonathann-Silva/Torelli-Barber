import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import { Appointment, AppointmentStatus } from '../../types';

const ClientHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = db.collection('appointments')
      .where('clientId', '==', user.id)
      .onSnapshot((snapshot) => {
        const fetchedAppointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Appointment[];
        
        // Sort: recent first
        fetchedAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAppointments(fetchedAppointments);
        setLoading(false);
      }, (error) => {
        console.warn("Error fetching history:", error);
        setAppointments([]);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: AppointmentStatus) => {
    switch(status) {
      case AppointmentStatus.CONFIRMED: return 'bg-green-500/10 text-green-500 border-green-500/20';
      case AppointmentStatus.COMPLETED: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case AppointmentStatus.CANCELLED: return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <ClientLayout>
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark-blue/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center p-4 justify-between h-16">
          <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full p-2 transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-slate-900 dark:text-white">Meus Cortes</h2>
        </div>
      </header>

      <main className="px-4 py-6 flex flex-col gap-4">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
               <span className="size-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mb-4"></span>
               <p className="text-sm text-gray-500">Carregando histórico...</p>
           </div>
        ) : appointments.length > 0 ? (
          appointments.map(app => (
            <div key={app.id} className="bg-white dark:bg-surface-dark-blue rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <div className="size-12 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700" style={{ backgroundImage: `url("${app.barberAvatar || 'https://via.placeholder.com/150'}")` }}></div>
                     <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{app.serviceName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Barbeiro: {app.barberName}</p>
                     </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(app.status)}`}>
                    {app.status === AppointmentStatus.CONFIRMED ? 'Confirmado' : app.status === AppointmentStatus.PENDING ? 'Pendente' : app.status === AppointmentStatus.COMPLETED ? 'Concluído' : 'Cancelado'}
                  </span>
               </div>
               
               <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-black/20 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-lg">calendar_today</span>
                     <span>{new Date(app.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                  <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-lg">schedule</span>
                     <span>{app.time}</span>
                  </div>
               </div>
               
               <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-slate-900 dark:text-white">R$ {app.price.toFixed(2)}</span>
                  <button className="text-primary-blue text-sm font-bold hover:underline">Ver Detalhes</button>
               </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
             <span className="material-symbols-outlined text-5xl mb-4 text-gray-400">history_toggle_off</span>
             <h3 className="text-lg font-bold text-gray-500">Sem histórico</h3>
             <p className="text-sm text-gray-400 mt-1">Você ainda não realizou agendamentos.</p>
             <button onClick={() => navigate('/client/booking')} className="mt-6 px-6 py-2 bg-primary-gold text-black font-bold rounded-lg hover:bg-[#eebb14] transition-colors">
                Agendar Agora
             </button>
          </div>
        )}
      </main>
    </ClientLayout>
  );
};

export default ClientHistory;