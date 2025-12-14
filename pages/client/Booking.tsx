import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BARBERS } from '../../constants';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import { Service } from '../../types';

const BookingStep1 = ({ onNext }: { onNext: () => void }) => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch services from DB
  useEffect(() => {
    const unsubscribe = db.collection('services').onSnapshot(snapshot => {
      const fetchedServices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(fetchedServices);
      if (fetchedServices.length > 0 && !selectedService) {
          setSelectedService(fetchedServices[0].id);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'Todos') return services;
    
    return services.filter(service => {
      // Map category stored in DB to UI filter
      const cat = (service as any).category || 'hair'; // fallback if old data
      if (selectedCategory === 'Cabelo') return cat === 'hair';
      if (selectedCategory === 'Barba') return cat === 'beard';
      if (selectedCategory === 'Combos') return cat === 'combo';
      return true;
    });
  }, [selectedCategory, services]);

  const currentService = services.find(s => s.id === selectedService);

  return (
    <>
      <div className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark-blue/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center p-4 justify-between h-16">
          <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Agendamento</h2>
        </div>
      </div>
      
      <div className="flex w-full flex-col items-center justify-center py-4 bg-background-light dark:bg-background-dark-blue">
        <div className="flex flex-row gap-2">
          <div className="h-1.5 w-8 rounded-full bg-primary-blue"></div>
          <div className="h-1.5 w-8 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          <div className="h-1.5 w-8 rounded-full bg-slate-300 dark:bg-slate-700"></div>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">Passo 1 de 3</p>
      </div>

      <div className="px-5 pt-2 pb-4">
        <h1 className="text-2xl md:text-[28px] font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          Escolha o serviço
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Selecione o procedimento que deseja realizar hoje.</p>
      </div>

      <div className="w-full pl-5 mb-6">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pr-5">
          {['Todos', 'Cabelo', 'Barba', 'Combos'].map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`group flex flex-col items-center justify-center pb-2 border-b-[3px] transition-all shrink-0 ${isActive ? 'border-primary-blue' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}
              >
                <p className={`text-sm font-bold leading-normal tracking-wide ${isActive ? 'text-primary-blue' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                  {cat}
                </p>
              </button>
            );
          })}
        </div>
        <div className="h-px w-full bg-slate-200 dark:bg-slate-800 -mt-[1px]"></div>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-52 min-h-[300px]">
        {loading ? (
           <div className="flex justify-center pt-10"><span className="size-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin"></span></div>
        ) : filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <label key={service.id} className="group relative cursor-pointer animate-fade-in">
              <input 
                className="peer sr-only" 
                name="service" 
                type="radio" 
                value={service.id} 
                checked={selectedService === service.id}
                onChange={() => setSelectedService(service.id)}
              />
              <div className={`relative flex items-start gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-200 
                  ${selectedService === service.id ? 'border-primary-blue bg-primary-blue/5 dark:bg-primary-blue/10 shadow-md shadow-primary-blue/10' : 'border-slate-200 dark:border-[#233648] bg-white dark:bg-[#1a2632] hover:border-primary-blue/50'}
              `}>
                 {(service as any).category === 'combo' && (
                   <div className="absolute -top-3 right-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                      MAIS POPULAR
                   </div>
                 )}
                 <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors ${selectedService === service.id ? 'bg-primary-blue text-white' : 'bg-slate-100 dark:bg-[#233648] text-slate-600 dark:text-slate-300'}`}>
                   <span className="material-symbols-outlined">{service.icon || 'content_cut'}</span>
                 </div>
                 <div className="flex flex-1 flex-col justify-center">
                   <div className="flex justify-between items-start w-full mb-1">
                     <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">{service.name}</p>
                     <p className="text-base font-bold text-[#e5c07b] ml-2 shrink-0">R$ {service.price.toFixed(2)}</p>
                   </div>
                   <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug mb-2 pr-4">{service.description}</p>
                   <div className="flex items-center gap-1.5">
                     <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                     <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{service.duration} min</p>
                   </div>
                 </div>
                 <div className="absolute right-4 bottom-4 flex items-center justify-center">
                   <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedService === service.id ? 'border-primary-blue' : 'border-slate-300 dark:border-slate-600'}`}>
                     <div className={`h-2.5 w-2.5 rounded-full bg-primary-blue transition-opacity ${selectedService === service.id ? 'opacity-100' : 'opacity-0'}`}></div>
                   </div>
                 </div>
              </div>
            </label>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">search_off</span>
            <p className="text-slate-500 dark:text-slate-400">Nenhum serviço encontrado nesta categoria.</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full z-40">
        <div className="h-8 w-full bg-gradient-to-b from-transparent to-background-light dark:to-background-dark-blue"></div>
        <div className="bg-background-light/95 dark:bg-background-dark-blue/95 backdrop-blur-xl border-t border-slate-200 dark:border-[#233648] p-4 pb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex flex-col">
              <p className="text-xs text-slate-500 dark:text-slate-400">Total estimado</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">R$ <span className="text-xl">{currentService ? currentService.price.toFixed(2) : '0,00'}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">Duração</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{currentService ? currentService.duration : 0} min</p>
            </div>
          </div>
          <button onClick={onNext} disabled={!selectedService} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-blue py-4 text-center text-base font-bold text-white shadow-lg shadow-primary-blue/25 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <span>Continuar</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </div>
    </>
  );
};

const BookingStep2 = ({ onBack, onConfirm }: { onBack: () => void, onConfirm: () => void }) => {
  const [selectedBarber, setSelectedBarber] = useState('1');
  const [selectedTime, setSelectedTime] = useState('11:00');
  const [loading, setLoading] = useState(false);
  const { sendNotification } = useNotifications();
  const { user } = useAuth();
  
  // Calendar Logic State
  const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the month being viewed
  const [selectedDate, setSelectedDate] = useState(new Date().getDate()); // Tracks the selected day number

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(1); // Reset selected day to 1 when changing month
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(1);
  };

  const handleConfirm = async () => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Send notification to Admin
    await sendNotification(
      'admin', // Targeting all admins
      'Novo Agendamento',
      `O cliente ${user?.name} solicitou um agendamento para dia ${selectedDate} às ${selectedTime}.`,
      'info'
    );
    
    setLoading(false);
    onConfirm();
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark-blue pb-40">
       <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark-blue/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center p-4 justify-between h-16">
          <button onClick={onBack} className="text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full p-2 transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Agendamento</h2>
        </div>
      </header>
      
      {/* Professional Selection */}
      <section>
        <div className="flex items-center justify-between px-4 pt-6 pb-2">
          <h3 className="tracking-tight text-xl font-bold leading-tight text-slate-900 dark:text-white">Escolha o Profissional</h3>
          <span className="text-xs font-medium text-primary-blue uppercase tracking-wider cursor-pointer">Ver todos</span>
        </div>
        <div className="flex overflow-x-auto pb-4 pt-2 px-4 gap-4 no-scrollbar snap-x">
           {BARBERS.map(barber => (
             <div 
                key={barber.id} 
                onClick={() => setSelectedBarber(barber.id)}
                className={`flex flex-col items-center gap-3 min-w-[100px] snap-center cursor-pointer group ${selectedBarber !== barber.id ? 'opacity-70 hover:opacity-100' : ''}`}
             >
                <div className={`relative p-1 rounded-full border-2 transition-all transform ${selectedBarber === barber.id ? 'border-primary-gold shadow-[0_0_15px_-3px_rgba(212,175,55,0.4)] scale-105' : 'border-transparent'}`}>
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-20 h-20" style={{ backgroundImage: `url("${barber.image}")`, filter: selectedBarber !== barber.id ? 'grayscale(100%)' : 'none' }}></div>
                  {selectedBarber === barber.id && (
                    <div className="absolute -bottom-1 -right-1 bg-primary-gold text-black rounded-full p-1 border-2 border-background-dark-blue">
                      <span className="material-symbols-outlined text-[14px] font-bold block">check</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-slate-900 dark:text-white text-sm font-semibold leading-normal">{barber.name}</p>
                  <div className="flex items-center justify-center gap-1 text-primary-gold">
                    <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                    <span className="text-xs font-medium">{barber.rating}</span>
                  </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Calendar */}
      <section className="bg-surface-dark-blue/30 border-y border-white/5 py-4">
        <h3 className="tracking-tight text-xl font-bold leading-tight px-4 pb-4 text-slate-900 dark:text-white">Selecione a Data</h3>
        <div className="flex flex-col items-center justify-center px-4">
           {/* Calendar Grid */}
           <div className="w-full max-w-[360px]">
             <div className="flex items-center justify-between mb-4 text-slate-900 dark:text-white select-none">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="font-bold capitalize">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
             </div>
             <div className="grid grid-cols-7 gap-y-2 text-center mb-2">
               {['Dom','Seg','Ter','Qua','Qui','Sex','Sab'].map(d => <span key={d} className="text-slate-400 dark:text-gray-400 text-xs font-bold uppercase">{d}</span>)}
             </div>
             <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {/* Empty slots for days before the first of the month */}
                {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} className="h-10"></div>)}
                
                {/* Actual days */}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDate === day;
                  return (
                    <button 
                      key={day} 
                      onClick={() => setSelectedDate(day)}
                      className={`h-10 w-full rounded-full flex items-center justify-center text-sm font-medium transition-all active:scale-90
                        ${isSelected 
                          ? 'bg-primary-blue text-white shadow-lg shadow-primary-blue/30' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      {day}
                    </button>
                  );
                })}
             </div>
           </div>
        </div>
      </section>

      {/* Time Slots */}
      <section className="px-4 mt-6">
        <h3 className="tracking-tight text-xl font-bold leading-tight pb-4 text-slate-900 dark:text-white">Horários Disponíveis</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'].map(time => (
             <button 
                key={time}
                onClick={() => setSelectedTime(time)}
                disabled={time === '10:30'}
                className={`py-2.5 px-2 rounded-lg text-sm font-medium transition-all relative
                  ${selectedTime === time 
                    ? 'bg-surface-dark-blue border border-primary-blue text-white shadow-[0_0_15px_-5px_rgba(19,127,236,0.5)]' 
                    : time === '10:30' ? 'bg-surface-dark-blue border border-white/10 text-gray-500 line-through opacity-50 cursor-not-allowed' : 'bg-surface-dark-blue border border-white/10 text-gray-300 hover:border-primary-gold/50 hover:text-white'}
                `}
             >
               {time}
               {selectedTime === time && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-blue rounded-full"></div>}
             </button>
          ))}
        </div>
      </section>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-dark-blue/95 backdrop-blur-lg border-t border-white/5 p-4 z-40">
        <div className="flex items-center justify-between mb-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total estimado</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-primary-gold">R$</span>
              <span className="text-2xl font-bold text-white tracking-tight">85,00</span>
            </div>
            <span className="text-xs text-gray-500">Corte Cabelo + Barba</span>
          </div>
          <button 
            onClick={handleConfirm} 
            disabled={loading}
            className="bg-primary-blue hover:bg-primary-blue/90 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-primary-blue/30 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : (
              <>
                <span>Confirmar</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientBooking = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  if (step === 1) return <BookingStep1 onNext={() => setStep(2)} />;
  return <BookingStep2 onBack={() => setStep(1)} onConfirm={() => navigate('/client/dashboard')} />;
};

export default ClientBooking;