import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import { db } from '../../firebaseConfig';
import { Service } from '../../types';

// Mapeamento de imagens para os serviços (simulando banco de dados)
const SERVICE_IMAGES: Record<string, string> = {
  '1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2iwxZYmHWIC8WTZc3itr5EbLranbvxTxqQY2DzeEDR0VEBTSy3WmbME9sMVZkiCaMLyG_LroZqGecwONKrWLv2oZf4s0X6mT1tb0BtIjFRMdlDljC5AKZOCGapbYCT36CfoK9jDKtw7fyPaFAfRYJS9nJlwo8wiMDryXQI9JfLnf2ZpcPiKqpU_8eC8XdkBeS2mvABc5ZITjhb2_j56yJGAFp77Bjn-2C90U6AwwiPpyMy02bhNIa5QMe9teLGamy5WCw0yaltVUw', // Corte
  '2': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB14Ng00lAbrKm7KX6sSzWiUXdyWHoVEnI2DK4Pe5GrCssOm7ZeOTCqvx5UaJdyte0cJHvAC-MCcXK6jc9LIarKd2vTCegGCM0n2l6ihxykAUagGgXGx0TZR5icvVfeHMEnRbwQ2VdHJrTBK_uCLVytC4otTCJGHjv6dYXceJShpB6CG4nlrOpNy70FA_5UkVL91K9gALLOaraV2XrLesFQCt1SRYNx1u_vnb8gW4-sbo8zz5hVj7NJoyQxFM2qdOPlPGYnysfgpAcm', // Barba
  '3': 'https://images.unsplash.com/photo-1503951914290-93a354cd2d92?q=80&w=600&auto=format&fit=crop', // Combo
  '4': 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop', // Acabamento
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [nextAppointment, setNextAppointment] = useState<any>(null); // Placeholder for future real data
  
  // Services State
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // Fetch top services (for now, just all of them)
    const unsubscribe = db.collection('services').onSnapshot(snapshot => {
        const fetchedServices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Service[];
        setServices(fetchedServices);
    });
    return () => unsubscribe();
  }, []);

  const handleCheckIn = () => {
    setCheckInStatus('loading');
    
    // Simula uma chamada de API
    setTimeout(() => {
      setCheckInStatus('success');
      // Opcional: Mostrar um toast ou alerta
      // alert("Check-in realizado com sucesso! Aguarde ser chamado.");
    }, 1500);
  };

  return (
    <ClientLayout>
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark-blue/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary-blue" 
                style={{ backgroundImage: `url("${user?.avatar}")` }}
              ></div>
              <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background-dark-blue"></div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Bem-vindo de volta,</p>
              <h2 className="text-lg font-bold leading-tight tracking-tight">{user?.name || 'Cliente'}</h2>
            </div>
          </div>
          
          <div className="relative">
             <button 
               onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
               className="flex items-center justify-center rounded-full size-10 bg-surface-dark-blue text-white hover:bg-gray-800 transition-colors relative"
             >
               <span className={`material-symbols-outlined ${unreadCount > 0 ? 'filled text-primary-gold' : ''}`}>notifications</span>
               {unreadCount > 0 && <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>}
             </button>

             {isNotificationsOpen && (
               <>
                 <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                 <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#192633] rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
                   <div className="p-3 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notificações</h3>
                      {unreadCount > 0 && <button className="text-[10px] text-primary-blue font-bold uppercase" onClick={() => {}}>Marcar lidas</button>}
                   </div>
                   <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-3 border-b border-slate-100 dark:border-gray-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!notif.read ? 'bg-primary-gold/5' : ''}`}>
                             <div className="flex gap-3">
                                <div className={`mt-1 size-2 rounded-full shrink-0 ${!notif.read ? 'bg-primary-gold' : 'bg-transparent'}`}></div>
                                <div>
                                   <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>{notif.title}</h4>
                                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                                   <span className="text-[10px] text-slate-400 mt-2 block opacity-70">Agora mesmo</span>
                                </div>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          <span className="material-symbols-outlined text-3xl mb-2 opacity-50">notifications_off</span>
                          <p className="text-xs">Nenhuma notificação</p>
                        </div>
                      )}
                   </div>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto flex flex-col gap-6 px-4 pt-6">
        {/* Hero: Next Appointment */}
        <section>
          <div className="flex justify-between items-baseline mb-3 px-1">
            <h2 className="text-xl font-bold tracking-tight">Seu Próximo Corte</h2>
            {nextAppointment && <button className="text-xs font-semibold text-primary-blue hover:text-blue-400">Ver todos</button>}
          </div>
          
          {nextAppointment ? (
              <div className="relative overflow-hidden rounded-2xl bg-surface-dark-blue border border-gray-800 shadow-xl group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-gold to-[#A08328]"></div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-gold/10 text-primary-gold text-xs font-bold w-fit mb-2 border border-primary-gold/20">
                        <span className="material-symbols-outlined text-[14px]">event</span>
                        Confirmado
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-1">15 Outubro</h3>
                      <p className="text-gray-400 font-medium">14:00 • Terça-feira</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 border border-gray-700 shadow-sm" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBcK-FAO2HL_-V6r8AjR6c6whLLH7ldHU1C6KVXEqX81YfRNL3d6iqFnIiMi2CqtmafmdrYA8_w5OBFT2jPS2N6sab6f_nyc6o4vHKxZD7pwxsxUN9VTvzTKYiwphXWsETYTAXUiPvb8JT_mg7iILeEsRAWLXuBqYpIiyksI8avTH76E2f6ODF6lzWkkWXG6a-EewdlGxIba126oHpPw8bhoIWGfu8qbc2TodQs6PD5zYQvu7KjdpYoCpfO6IrXdb19ke9tLvPsyfKY")' }}></div>
                      <p className="text-xs text-gray-500 mt-1">Barbeiro Lucas</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-gray-800"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Serviço</p>
                      <p className="text-base font-bold text-white">Corte Clássico & Barba</p>
                    </div>
                    <p className="text-lg font-bold bg-gradient-to-r from-primary-gold to-[#F2E3BC] bg-clip-text text-transparent">R$ 85,00</p>
                  </div>
                  <button 
                    onClick={handleCheckIn}
                    disabled={checkInStatus !== 'idle'}
                    className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98]
                      ${checkInStatus === 'success' 
                        ? 'bg-green-600 text-white cursor-default shadow-green-900/20' 
                        : 'bg-primary-blue hover:bg-blue-600 text-white shadow-blue-900/20'
                      }
                      ${checkInStatus === 'loading' ? 'opacity-80 cursor-wait' : ''}
                    `}
                  >
                    {checkInStatus === 'loading' ? (
                       <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : checkInStatus === 'success' ? (
                       <>
                         <span className="material-symbols-outlined text-[20px]">check</span>
                         <span>Check-in Realizado</span>
                       </>
                    ) : (
                       <>
                         <span className="material-symbols-outlined text-[20px]">check_circle</span>
                         <span>Fazer Check-in</span>
                       </>
                    )}
                  </button>
                </div>
              </div>
          ) : (
             <div className="rounded-2xl bg-surface-dark-blue border border-gray-800 p-6 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">calendar_today</span>
                <p className="text-gray-300 font-bold">Você não possui agendamentos</p>
                <p className="text-xs text-gray-500 mt-1 mb-4">Que tal marcar um horário para renovar o visual?</p>
                <button onClick={() => navigate('/client/booking')} className="px-6 py-2 bg-primary-gold text-black font-bold rounded-lg text-sm hover:bg-[#eebb14] transition-colors">
                   Agendar Agora
                </button>
             </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold mb-3 px-1 text-white">Acesso Rápido</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/client/booking')} className="flex flex-col items-center justify-center gap-3 rounded-xl bg-surface-dark-blue border border-gray-800 p-4 hover:border-primary-blue/50 transition-all active:scale-95 group">
              <div className="size-12 rounded-full bg-background-dark-blue flex items-center justify-center group-hover:bg-primary-blue/10 transition-colors">
                <span className="material-symbols-outlined text-primary-blue text-3xl">add_circle</span>
              </div>
              <span className="text-sm font-bold text-gray-200">Novo Agendamento</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 rounded-xl bg-surface-dark-blue border border-gray-800 p-4 hover:border-primary-gold/50 transition-all active:scale-95 group">
              <div className="size-12 rounded-full bg-background-dark-blue flex items-center justify-center group-hover:bg-primary-gold/10 transition-colors">
                <span className="material-symbols-outlined text-primary-gold text-3xl">history</span>
              </div>
              <span className="text-sm font-bold text-gray-200">Meus Cortes</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 rounded-xl bg-surface-dark-blue border border-gray-800 p-4 hover:border-gray-600 transition-all active:scale-95 group">
              <div className="size-12 rounded-full bg-background-dark-blue flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-gray-400 text-3xl">groups</span>
              </div>
              <span className="text-sm font-bold text-gray-200">Nossos Barbeiros</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-3 rounded-xl bg-surface-dark-blue border border-gray-800 p-4 hover:border-gray-600 transition-all active:scale-95 group">
              <div className="size-12 rounded-full bg-background-dark-blue flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-gray-400 text-3xl">shopping_bag</span>
              </div>
              <span className="text-sm font-bold text-gray-200">Produtos</span>
            </button>
          </div>
        </section>

        {/* Services Horizontal Scroll */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-lg font-bold text-white">Serviços em Alta</h2>
            <div className="flex gap-1">
              {services.slice(0, 4).map((_, idx) => (
                <span key={idx} className={`block w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-primary-blue' : 'bg-gray-700'}`}></span>
              ))}
            </div>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
             {services.length > 0 ? services.map((service) => (
               <div 
                  key={service.id}
                  onClick={() => navigate('/client/booking')}
                  className="min-w-[240px] snap-center rounded-xl bg-surface-dark-blue border border-gray-800 overflow-hidden flex flex-col group shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="h-32 w-full bg-cover bg-center relative" style={{ backgroundImage: `url("${SERVICE_IMAGES[service.id] || SERVICE_IMAGES['1']}")` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark-blue to-transparent opacity-80"></div>
                    {((service as any).category === 'combo' || service.price > 40) && (
                      <div className="absolute bottom-2 left-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-gold text-black uppercase tracking-wider">Popular</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-base">{service.name}</h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">{service.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-primary-blue font-bold">R$ {service.price.toFixed(2)}</span>
                      <button className="p-1.5 rounded-lg bg-gray-800 hover:bg-primary-blue text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
             )) : (
                <div className="min-w-full text-center py-6 text-slate-500">
                    Nenhum serviço disponível
                </div>
             )}
          </div>
        </section>
      </main>
    </ClientLayout>
  );
};

export default ClientDashboard;