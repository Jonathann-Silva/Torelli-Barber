import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SERVICES } from '../../constants';
import { useNotifications } from '../../context/NotificationContext';
import { db } from '../../firebaseConfig';
import { Barber } from '../../types';

// --- Types ---
interface Client {
  id: number | string;
  name: string;
  phone: string;
  lastVisit: string;
  totalSpent: number;
  avatar: string | null;
  vip?: boolean;
}

interface Transaction {
  id: number | string;
  desc: string;
  time: string;
  value: number;
  type: 'in' | 'out';
}

interface AdminAppointment {
  id: string;
  clientId?: string;
  clientName: string;
  service: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  type: 'appointment' | 'slot' | 'lunch';
}

// Types for Settings
interface ShopHours {
  open: string;
  close: string;
  lunchStart: string;
  lunchEnd: string;
}

interface AdminService {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  category: 'hair' | 'beard' | 'combo' | 'other';
}

interface GalleryImage {
  id: string;
  url: string;
}

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

// --- INITIAL STATE IS NOW EMPTY FOR REAL TESTING ---
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, sendNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'agenda' | 'clients' | 'financial' | 'settings'>('agenda');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Date State
  const [selectedDay, setSelectedDay] = useState<string>(new Date().getDate().toString());
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // --- Data States (Started Empty) ---
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Settings States ---
  const [shopHours, setShopHours] = useState<ShopHours>({
    open: '09:00',
    close: '19:00',
    lunchStart: '12:00',
    lunchEnd: '13:00'
  });
  
  // Services, Barbers, Gallery, Products
  const [servicesList, setServicesList] = useState<AdminService[]>([]);
  const [barbersList, setBarbersList] = useState<Barber[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [productsList, setProductsList] = useState<AdminProduct[]>([]);
  
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // --- Modal States ---
  const [showClientModal, setShowClientModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
  const [editingService, setEditingService] = useState<AdminService | null>(null);

  // Service Form State
  const [serviceForm, setServiceForm] = useState<Partial<AdminService>>({ name: '', price: 0, duration: 30, category: 'hair' });
  
  // Barber Form State
  const [barberForm, setBarberForm] = useState({ name: '', specialty: '', image: '' });
  
  // Product Form State
  const [productForm, setProductForm] = useState({ name: '', price: 0, category: 'Cabelo', image: '' });
  
  // Client Form
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  // Transaction Form
  const [newTransDesc, setNewTransDesc] = useState('');
  const [newTransValue, setNewTransValue] = useState('');
  const [newTransType, setNewTransType] = useState<'in' | 'out'>('in');

  // --- Logic Helpers ---

  // Agenda Logic
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDay).padStart(2, '0');
    
    const queryDate = `${year}-${month}-${day}`;

    const unsubscribe = db.collection('appointments')
      .where('date', '==', queryDate)
      .onSnapshot((snapshot) => {
        const fetchedAppointments = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            clientId: data.clientId,
            clientName: data.clientName || 'Cliente sem nome',
            service: data.serviceName || 'Serviço',
            time: data.time,
            status: (data.status ? data.status.toLowerCase() : 'pending') as any,
            type: 'appointment'
          } as AdminAppointment;
        });

        fetchedAppointments.sort((a, b) => a.time.localeCompare(b.time));
        setAppointments(fetchedAppointments);
      }, (error) => {
        console.error("Error fetching appointments:", error);
      });

    return () => unsubscribe();
  }, [selectedDay]);

  // Clients Logic
  useEffect(() => {
    const unsubscribe = db.collection('users')
      .where('role', '==', 'client')
      .onSnapshot(snapshot => {
        const fetchedClients = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Sem nome',
            phone: data.phone || '',
            lastVisit: 'Novo', 
            totalSpent: 0,
            avatar: data.avatar || null,
            vip: false
          } as Client;
        });
        setClients(fetchedClients);
      });
    return () => unsubscribe();
  }, []);

  // Services Logic
  useEffect(() => {
    const unsubscribe = db.collection('services').onSnapshot(snapshot => {
        const fetchedServices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AdminService[];
        setServicesList(fetchedServices);
    });
    return () => unsubscribe();
  }, []);

  // Barbers Logic
  useEffect(() => {
    const unsubscribe = db.collection('barbers').onSnapshot(snapshot => {
        const fetchedBarbers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Barber[];
        setBarbersList(fetchedBarbers);
    });
    return () => unsubscribe();
  }, []);

  // Gallery Logic
  useEffect(() => {
    const unsubscribe = db.collection('gallery').onSnapshot(snapshot => {
        const fetchedGallery = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as GalleryImage[];
        setGallery(fetchedGallery);
    });
    return () => unsubscribe();
  }, []);

  // Products Logic
  useEffect(() => {
    const unsubscribe = db.collection('products').onSnapshot(snapshot => {
        const fetchedProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AdminProduct[];
        setProductsList(fetchedProducts);
    });
    return () => unsubscribe();
  }, []);


  const handleStatusChange = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
        await db.collection('appointments').doc(id).update({ 
            status: newStatus === 'confirmed' ? 'Confirmado' : 'Cancelado' 
        });

        const appt = appointments.find(a => a.id === id);
        if (appt) {
            const statusText = newStatus === 'confirmed' ? 'Confirmado' : 'Cancelado';
            const type = newStatus === 'confirmed' ? 'success' : 'error';
            const targetId = appt.clientId || 'unknown_client';

            await sendNotification(
                targetId, 
                `Agendamento ${statusText}`,
                `Seu agendamento de ${appt.service} para ${appt.time} foi ${statusText.toLowerCase()}.`,
                type
            );
        }
    } catch (error) {
        console.error("Error updating status:", error);
    }
  };

  // Client Logic
  const filteredClients = useMemo(() => {
    return clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [clients, searchTerm]);

  const handleAddClient = async () => {
    if (!newClientName || !newClientPhone) return;
    try {
      await db.collection('users').add({
        name: newClientName,
        phone: newClientPhone,
        role: 'client',
        createdAt: new Date().toISOString(),
        email: '',
      });
      setShowClientModal(false);
      setNewClientName('');
      setNewClientPhone('');
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  // Financial Logic
  const financialSummary = useMemo(() => {
    const total = transactions.reduce((acc, t) => t.type === 'in' ? acc + t.value : acc - t.value, 0);
    const todayTotal = transactions.reduce((acc, t) => t.type === 'in' ? acc + t.value : acc, 0); 
    return { total, todayTotal };
  }, [transactions]);

  const handleAddTransaction = () => {
    if (!newTransDesc || !newTransValue) return;
    const newTrans: Transaction = {
      id: Date.now(),
      desc: newTransDesc,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'}),
      value: parseFloat(newTransValue),
      type: newTransType
    };
    setTransactions([newTrans, ...transactions]);
    setShowTransactionModal(false);
    setNewTransDesc('');
    setNewTransValue('');
  };

  // --- Settings Logic ---
  const handleSaveService = async () => {
    if (!serviceForm.name || !serviceForm.price || !serviceForm.duration) return;
    try {
        const payload = {
            name: serviceForm.name,
            price: Number(serviceForm.price),
            duration: Number(serviceForm.duration),
            category: serviceForm.category || 'hair',
            description: 'Serviço especializado', 
            icon: 'content_cut'
        };

        if (editingService) {
            await db.collection('services').doc(editingService.id).update(payload);
        } else {
            await db.collection('services').add(payload);
        }
        setShowServiceModal(false);
        setEditingService(null);
        setServiceForm({ name: '', price: 0, duration: 30, category: 'hair' });
    } catch (error) {
        console.error("Error saving service:", error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      await db.collection('services').doc(id).delete();
    }
  };
  
  // Barber Logic
  const handleSaveBarber = async () => {
    if (!barberForm.name) return;
    try {
        await db.collection('barbers').add({
            name: barberForm.name,
            specialty: barberForm.specialty || 'Barbeiro',
            image: barberForm.image || 'https://via.placeholder.com/150',
            rating: 5.0,
            reviews: 0
        });
        setShowBarberModal(false);
        setBarberForm({ name: '', specialty: '', image: '' });
    } catch (error) {
        console.error("Error saving barber:", error);
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este barbeiro?')) {
        await db.collection('barbers').doc(id).delete();
    }
  };

  // Product Logic
  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) return;
    try {
        await db.collection('products').add({
            name: productForm.name,
            price: Number(productForm.price),
            category: productForm.category,
            image: productForm.image || 'https://via.placeholder.com/150'
        });
        setShowProductModal(false);
        setProductForm({ name: '', price: 0, category: 'Cabelo', image: '' });
    } catch (error) {
        console.error("Error saving product:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
        await db.collection('products').doc(id).delete();
    }
  };

  const openServiceModal = (service?: AdminService) => {
    if (service) {
      setEditingService(service);
      setServiceForm(service);
    } else {
      setEditingService(null);
      setServiceForm({ name: '', price: 0, duration: 30, category: 'hair' });
    }
    setShowServiceModal(true);
  };

  // Gallery Logic: Save to Firestore
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          try {
             await db.collection('gallery').add({
                 url: reader.result,
                 uploadedAt: new Date().toISOString()
             });
          } catch(err) {
              console.error("Error uploading image", err);
              alert("Erro ao salvar imagem. Verifique se o arquivo não é muito grande.");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = async (id: string) => {
    if(window.confirm("Remover imagem da galeria?")) {
        try {
            await db.collection('gallery').doc(id).delete();
        } catch(err) {
            console.error(err);
        }
    }
  };

  const getDaysArray = () => {
    const arr = [];
    const today = new Date();
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    for(let i=0; i<6; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        arr.push({ d: days[d.getDay()], n: d.getDate().toString() });
    }
    return arr;
  };

  const dateList = useMemo(() => getDaysArray(), []);

  return (
    <div className="bg-background-light dark:bg-background-dark-brown font-inter antialiased text-slate-900 dark:text-white min-h-screen pb-24 relative overflow-x-hidden">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative w-64 bg-background-light dark:bg-[#1a160a] h-full shadow-2xl flex flex-col animate-slide-right border-r border-white/5">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary-gold">Menu</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <button onClick={() => { setActiveTab('agenda'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'agenda' ? 'bg-black/5 dark:bg-white/5 text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <span className="material-symbols-outlined">calendar_month</span> Agenda
              </button>
              <button onClick={() => { setActiveTab('clients'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'clients' ? 'bg-black/5 dark:bg-white/5 text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <span className="material-symbols-outlined">groups</span> Clientes
              </button>
              <button onClick={() => { setActiveTab('financial'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'financial' ? 'bg-black/5 dark:bg-white/5 text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <span className="material-symbols-outlined">payments</span> Financeiro
              </button>
              <div className="h-px bg-black/5 dark:bg-white/5 my-2"></div>
              <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-black/5 dark:bg-white/5 text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <span className="material-symbols-outlined">settings</span> Configurações
              </button>
            </nav>
            <div className="p-4 border-t border-black/5 dark:border-white/5">
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-3 rounded-xl font-bold hover:bg-red-500/20 transition-colors">
                <span className="material-symbols-outlined">logout</span> Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark-brown z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-slate-900 dark:text-white">menu</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-slate-500 dark:text-[#cbbc90]">Bem-vindo, {user?.name.split(' ')[0]}</h1>
            <div className="flex items-center gap-1 cursor-pointer group">
              <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                {activeTab === 'agenda' ? 'Visão Geral' : activeTab === 'clients' ? 'Meus Clientes' : activeTab === 'financial' ? 'Financeiro' : 'Configurações'}
              </h2>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                className="size-10 rounded-full flex items-center justify-center bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                 <span className={`material-symbols-outlined text-slate-900 dark:text-white ${unreadCount > 0 ? 'filled text-primary-gold' : ''}`}>notifications</span>
                 {unreadCount > 0 && (
                   <span className="absolute top-2 right-2 size-2.5 bg-red-500 border-2 border-background-light dark:border-background-dark-brown rounded-full"></span>
                 )}
              </button>
              
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1a160a] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                       <h3 className="font-bold text-sm">Notificações</h3>
                       {unreadCount > 0 && <button className="text-[10px] text-primary-blue font-bold uppercase" onClick={() => {}}>Marcar lidas</button>}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                       {notifications.length > 0 ? (
                         notifications.map(notif => (
                           <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-3 border-b border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!notif.read ? 'bg-primary-gold/5' : ''}`}>
                              <div className="flex gap-3">
                                 <div className={`mt-1 size-2 rounded-full shrink-0 ${!notif.read ? 'bg-primary-gold' : 'bg-transparent'}`}></div>
                                 <div>
                                    <h4 className={`text-sm ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>{notif.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{notif.message}</p>
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

           <div className="size-10 rounded-full bg-primary-gold flex items-center justify-center font-bold text-black border-2 border-background-light dark:border-background-dark-brown">
              {user?.name.charAt(0)}
           </div>
        </div>
      </header>

      {/* AGENDA VIEW */}
      {activeTab === 'agenda' && (
        <>
          <div className="flex flex-col bg-background-light dark:bg-background-dark-brown px-4 pb-2 z-10 shadow-sm border-b border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-2 pt-2">
              {dateList.map(day => (
                  <button 
                    key={day.n} 
                    onClick={() => setSelectedDay(day.n)}
                    className={`flex flex-col items-center justify-center min-w-[50px] h-[70px] rounded-xl border border-transparent transition-all
                    ${selectedDay === day.n ? 'bg-primary-gold shadow-lg shadow-primary-gold/20 scale-105' : 'bg-transparent opacity-60 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                    <span className={`text-xs font-medium ${selectedDay === day.n ? 'text-black font-bold' : 'text-slate-500 dark:text-[#cbbc90]'}`}>{day.d}</span>
                    <span className={`text-lg ${selectedDay === day.n ? 'text-black font-black text-xl' : 'font-bold text-slate-700 dark:text-white'}`}>{day.n}</span>
                    {selectedDay === day.n && <div className="h-1 w-1 bg-black rounded-full mt-1"></div>}
                  </button>
              ))}
            </div>
          </div>

          <main className="px-4 pt-4">
            <h2 className="sticky top-[64px] bg-background-light/95 dark:bg-background-dark-brown/95 backdrop-blur-sm px-1 pb-4 text-xl font-bold tracking-tight text-slate-900 dark:text-white z-10">Hoje, {selectedDay}</h2>
            {appointments.length > 0 ? (
                <div className="grid grid-cols-[50px_1fr] gap-x-3">
                  {appointments.map((app, index) => (
                    <React.Fragment key={app.id}>
                      <div className="flex flex-col items-center pt-2 relative">
                        <span className="text-xs font-medium text-slate-500 dark:text-[#8a8168]">{app.time}</span>
                        <div className={`w-[1px] bg-black/10 dark:bg-[#685a31] h-full absolute top-8 bottom-0 left-1/2 -translate-x-1/2 ${index === appointments.length - 1 ? 'hidden' : ''}`}></div>
                      </div>
                      <div className="pb-6">
                         <div className={`relative flex flex-col p-4 rounded-xl bg-white dark:bg-surface-dark-brown shadow-sm transition-all border-l-4 
                            ${app.status === 'confirmed' ? 'border-green-500' : app.status === 'cancelled' ? 'border-red-500 opacity-60' : 'border-primary-gold'}`}>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-slate-900 dark:text-white font-bold text-base">{app.clientName}</h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide 
                                ${app.status === 'confirmed' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : app.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-primary-gold/10 text-primary-gold-dark dark:text-primary-gold'}`}>
                                {app.status === 'confirmed' ? 'Confirmado' : app.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-[#cbbc90] text-sm">{app.service}</p>
                            {app.status === 'pending' && (
                              <div className="mt-3 flex gap-2">
                                <button onClick={() => handleStatusChange(app.id, 'confirmed')} className="flex-1 py-2 rounded-lg bg-primary-gold text-black text-xs font-bold shadow-sm hover:brightness-110">Aceitar</button>
                                <button onClick={() => handleStatusChange(app.id, 'cancelled')} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white text-xs font-medium hover:bg-red-500/20 hover:text-red-500">Recusar</button>
                              </div>
                            )}
                          </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <span className="material-symbols-outlined text-5xl mb-4 text-slate-300 dark:text-slate-600">calendar_today</span>
                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">Agenda Livre</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 max-w-[200px]">Nenhum agendamento para hoje.</p>
                </div>
            )}
          </main>
        </>
      )}

      {/* CLIENTS VIEW */}
      {activeTab === 'clients' && (
        <main className="px-4 pt-2 flex flex-col gap-4">
          <div className="relative mt-2">
             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
             <input 
               type="text" 
               placeholder="Buscar cliente..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-primary-gold transition-colors" 
              />
          </div>
          <div className="flex flex-col gap-3 pb-20">
             {filteredClients.length > 0 ? filteredClients.map(client => (
               <div key={client.id} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark-brown border border-slate-100 dark:border-white/5 shadow-sm active:scale-[0.99] transition-transform">
                  <div className="relative">
                     {client.avatar ? (
                        <div className="size-12 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${client.avatar}")` }}></div>
                     ) : (
                        <div className="size-12 rounded-full bg-primary-gold/20 text-primary-gold flex items-center justify-center font-bold text-lg">
                           {client.name.charAt(0)}
                        </div>
                     )}
                     {client.vip && (
                       <div className="absolute -bottom-1 -right-1 bg-primary-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-background-dark-brown">VIP</div>
                     )}
                  </div>
                  <div className="flex-1">
                     <h3 className="font-bold text-slate-900 dark:text-white">{client.name}</h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400">{client.phone}</p>
                     <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Última visita: {client.lastVisit}</p>
                  </div>
               </div>
             )) : (
               <div className="flex flex-col items-center justify-center py-10 opacity-50">
                  <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                  <p>Nenhum cliente encontrado</p>
               </div>
             )}
          </div>
          <button onClick={() => setShowClientModal(true)} className="fixed bottom-24 right-5 z-40 size-14 rounded-full bg-primary-gold text-black shadow-lg shadow-primary-gold/30 flex items-center justify-center transition-transform active:scale-95 hover:bg-[#eebb14]">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </button>
        </main>
      )}

      {/* FINANCIAL VIEW */}
      {activeTab === 'financial' && (
         <main className="px-4 pt-2 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 mt-2">
               <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-2 opacity-80">
                     <span className="material-symbols-outlined text-sm">calendar_today</span>
                     <span className="text-xs font-bold uppercase">Hoje</span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">R$ {financialSummary.todayTotal.toFixed(2)}</p>
                  <p className="text-[10px] mt-1 opacity-70">Calculado agora</p>
               </div>
               <div className="bg-white dark:bg-surface-dark-brown border border-slate-100 dark:border-white/5 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-[#cbbc90]">
                     <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                     <span className="text-xs font-bold uppercase">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">R$ {financialSummary.total.toFixed(2)}</p>
                  <p className="text-[10px] mt-1 text-slate-400 dark:text-slate-500">Saldo atual</p>
               </div>
            </div>
            <div className="pb-20">
               <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transações Recentes</h3>
               </div>
               {transactions.length > 0 ? (
                    <div className="flex flex-col gap-0 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 bg-white dark:bg-surface-dark-brown">
                        {transactions.map((t, i) => (
                            <div key={t.id} className={`flex items-center justify-between p-4 ${i !== transactions.length -1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}>
                                <div className="flex items-center gap-3">
                                <div className={`size-8 rounded-full flex items-center justify-center ${t.type === 'in' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                                    <span className="material-symbols-outlined text-[18px]">{t.type === 'in' ? 'arrow_downward' : 'arrow_upward'}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.desc}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.time}</p>
                                </div>
                                </div>
                                <span className={`text-sm font-bold ${t.type === 'in' ? 'text-green-600 dark:text-green-500' : 'text-slate-900 dark:text-white'}`}>
                                {t.type === 'in' ? '+' : '-'} R$ {t.value.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
               ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50 border border-dashed border-white/10 rounded-xl">
                        <span className="material-symbols-outlined text-3xl mb-2">receipt_long</span>
                        <p className="text-sm">Nenhuma transação registrada</p>
                    </div>
               )}
            </div>
            <button onClick={() => setShowTransactionModal(true)} className="fixed bottom-24 right-5 z-40 size-14 rounded-full bg-primary-gold text-black shadow-lg shadow-primary-gold/30 flex items-center justify-center transition-transform active:scale-95 hover:bg-[#eebb14]">
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>
         </main>
      )}

      {/* SETTINGS VIEW */}
      {activeTab === 'settings' && (
         <main className="px-4 pt-4 flex flex-col gap-8 pb-24">
            
            {/* 1. Services */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-gold">content_cut</span>
                  Serviços
                </h3>
                <button onClick={() => openServiceModal()} className="text-xs font-bold text-primary-blue bg-primary-blue/10 px-3 py-1.5 rounded-full hover:bg-primary-blue/20">Adicionar</button>
              </div>
              <div className="bg-white dark:bg-surface-dark-brown border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
                 {servicesList.length > 0 ? servicesList.map((service, idx) => (
                   <div key={service.id} className={`p-4 flex items-center justify-between ${idx !== servicesList.length -1 ? 'border-b border-slate-100 dark:border-white/5' : ''} hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer`} onClick={() => openServiceModal(service)}>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{service.name}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                           <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {service.duration} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary-gold-dark dark:text-primary-gold">R$ {service.price.toFixed(2)}</span>
                        <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                      </div>
                   </div>
                 )) : (
                    <div className="p-8 text-center text-slate-500">
                        <p>Nenhum serviço cadastrado.</p>
                    </div>
                 )}
              </div>
            </section>
            
            {/* 2. Barbers */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-gold">badge</span>
                  Profissionais
                </h3>
                <button onClick={() => setShowBarberModal(true)} className="text-xs font-bold text-primary-blue bg-primary-blue/10 px-3 py-1.5 rounded-full hover:bg-primary-blue/20">Adicionar</button>
              </div>
              <div className="bg-white dark:bg-surface-dark-brown border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
                 {barbersList.length > 0 ? barbersList.map((barber, idx) => (
                   <div key={barber.id} className={`p-4 flex items-center justify-between ${idx !== barbersList.length -1 ? 'border-b border-slate-100 dark:border-white/5' : ''} hover:bg-slate-50 dark:hover:bg-white/5 transition-colors`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-cover bg-center border border-slate-200 dark:border-white/10" style={{ backgroundImage: `url("${barber.image}")` }}></div>
                        <span className="font-bold text-slate-900 dark:text-white">{barber.name}</span>
                      </div>
                      <button 
                         onClick={() => handleDeleteBarber(barber.id)}
                         className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                         <span className="material-symbols-outlined">delete</span>
                      </button>
                   </div>
                 )) : (
                    <div className="p-8 text-center text-slate-500">
                        <p>Nenhum barbeiro cadastrado.</p>
                    </div>
                 )}
              </div>
            </section>

            {/* 3. Galeria */}
            <section>
              <div className="flex items-center justify-between mb-3">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-gold">photo_library</span>
                  Galeria do App
                </h3>
                <button onClick={() => galleryInputRef.current?.click()} className="text-xs font-bold text-primary-blue bg-primary-blue/10 px-3 py-1.5 rounded-full hover:bg-primary-blue/20">Upload Foto</button>
                <input type="file" ref={galleryInputRef} onChange={handleGalleryUpload} className="hidden" accept="image/*" />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                 {gallery.map(img => (
                   <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(img.id)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <span className="material-symbols-outlined text-white bg-red-500 rounded-full p-1">delete</span>
                      </button>
                   </div>
                 ))}
                 <button onClick={() => galleryInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 hover:border-primary-gold hover:text-primary-gold transition-colors">
                    <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                 </button>
              </div>
            </section>

            {/* 4. Store Products */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-gold">shopping_bag</span>
                  Produtos da Loja
                </h3>
                <button onClick={() => setShowProductModal(true)} className="text-xs font-bold text-primary-blue bg-primary-blue/10 px-3 py-1.5 rounded-full hover:bg-primary-blue/20">Adicionar</button>
              </div>
              <div className="bg-white dark:bg-surface-dark-brown border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
                 {productsList.length > 0 ? productsList.map((product, idx) => (
                   <div key={product.id} className={`p-4 flex items-center justify-between ${idx !== productsList.length -1 ? 'border-b border-slate-100 dark:border-white/5' : ''} hover:bg-slate-50 dark:hover:bg-white/5 transition-colors`}>
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-lg bg-cover bg-center border border-slate-200 dark:border-white/10" style={{ backgroundImage: `url("${product.image}")` }}></div>
                         <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white">{product.name}</span>
                            <span className="text-xs text-slate-500">{product.category}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="font-bold text-primary-gold">R$ {product.price.toFixed(2)}</span>
                         <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-500">
                            <span className="material-symbols-outlined">delete</span>
                         </button>
                      </div>
                   </div>
                 )) : (
                    <div className="p-8 text-center text-slate-500">
                        <p>Nenhum produto cadastrado.</p>
                    </div>
                 )}
              </div>
            </section>

         </main>
      )}

      {/* Admin Bottom Nav */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-[#221e10] border-t border-slate-200 dark:border-white/5 pb-5 pt-3 px-6 z-50 left-0 right-0 mx-auto">
        <ul className="flex justify-between items-center">
           <li>
              <button 
                 onClick={() => setActiveTab('agenda')}
                 className={`flex flex-col items-center gap-1 transition-colors group ${activeTab === 'agenda' ? 'text-primary-gold' : 'text-slate-400 dark:text-[#8a8168] hover:text-slate-600 dark:hover:text-[#cbbc90]'}`}
              >
                 <span className={`material-symbols-outlined text-2xl ${activeTab === 'agenda' ? 'fill-current' : ''}`}>calendar_month</span>
                 <span className="text-[10px] font-medium">Agenda</span>
              </button>
           </li>
           <li>
              <button 
                 onClick={() => setActiveTab('clients')}
                 className={`flex flex-col items-center gap-1 transition-colors group ${activeTab === 'clients' ? 'text-primary-gold' : 'text-slate-400 dark:text-[#8a8168] hover:text-slate-600 dark:hover:text-[#cbbc90]'}`}
              >
                 <span className={`material-symbols-outlined text-2xl ${activeTab === 'clients' ? 'fill-current' : ''}`}>groups</span>
                 <span className="text-[10px] font-medium">Clientes</span>
              </button>
           </li>
           <li>
              <button 
                 onClick={() => setActiveTab('financial')}
                 className={`flex flex-col items-center gap-1 transition-colors group ${activeTab === 'financial' ? 'text-primary-gold' : 'text-slate-400 dark:text-[#8a8168] hover:text-slate-600 dark:hover:text-[#cbbc90]'}`}
              >
                 <span className={`material-symbols-outlined text-2xl ${activeTab === 'financial' ? 'fill-current' : ''}`}>payments</span>
                 <span className="text-[10px] font-medium">Caixa</span>
              </button>
           </li>
        </ul>
      </nav>

      {/* MODALS */}
      {/* Service Edit/Add Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowServiceModal(false)}></div>
           <div className="relative bg-background-light dark:bg-[#1a160a] w-full max-w-sm rounded-2xl p-6 border border-white/10 animate-fade-in shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Serviço</label>
                    <input 
                      type="text" 
                      value={serviceForm.name}
                      onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="Ex: Corte Degrade"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preço (R$)</label>
                      <input 
                        type="number" 
                        value={serviceForm.price}
                        onChange={e => setServiceForm({...serviceForm, price: parseFloat(e.target.value)})}
                        className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duração (Min)</label>
                      <input 
                        type="number" 
                        value={serviceForm.duration}
                        step="5"
                        onChange={e => setServiceForm({...serviceForm, duration: parseInt(e.target.value)})}
                        className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      />
                   </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                    <select 
                       value={serviceForm.category}
                       onChange={e => setServiceForm({...serviceForm, category: e.target.value as any})}
                       className="w-full mt-1 bg-white dark:bg-[#1a160a] border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                    >
                       <option value="hair" className="bg-white dark:bg-[#1a160a] text-slate-900 dark:text-white">Cabelo</option>
                       <option value="beard" className="bg-white dark:bg-[#1a160a] text-slate-900 dark:text-white">Barba</option>
                       <option value="combo" className="bg-white dark:bg-[#1a160a] text-slate-900 dark:text-white">Combo</option>
                       <option value="other" className="bg-white dark:bg-[#1a160a] text-slate-900 dark:text-white">Outro</option>
                    </select>
                 </div>
                 
                 <button onClick={handleSaveService} className="w-full bg-primary-gold text-black font-bold py-3.5 rounded-xl hover:bg-[#eebb14] transition-colors mt-2">
                    Salvar
                 </button>
                 
                 {editingService && (
                   <button onClick={() => { handleDeleteService(editingService.id); setShowServiceModal(false); }} className="w-full bg-red-500/10 text-red-500 font-bold py-3.5 rounded-xl hover:bg-red-500/20 transition-colors">
                      Excluir Serviço
                   </button>
                 )}
              </div>
              <button onClick={() => setShowServiceModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-white">
                 <span className="material-symbols-outlined">close</span>
              </button>
           </div>
        </div>
      )}
      
      {/* Barber Add Modal */}
      {showBarberModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowBarberModal(false)}></div>
           <div className="relative bg-background-light dark:bg-[#1a160a] w-full max-w-sm rounded-2xl p-6 border border-white/10 animate-fade-in shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Adicionar Barbeiro</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</label>
                    <input 
                      type="text" 
                      value={barberForm.name}
                      onChange={e => setBarberForm({...barberForm, name: e.target.value})}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="Ex: Carlos Silva"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Especialidade</label>
                    <input 
                      type="text" 
                      value={barberForm.specialty}
                      onChange={e => setBarberForm({...barberForm, specialty: e.target.value})}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="Ex: Cortes Clássicos"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL da Foto</label>
                    <input 
                      type="text" 
                      value={barberForm.image}
                      onChange={e => setBarberForm({...barberForm, image: e.target.value})}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="https://..."
                    />
                 </div>
                 
                 <button onClick={handleSaveBarber} className="w-full bg-primary-gold text-black font-bold py-3.5 rounded-xl hover:bg-[#eebb14] transition-colors mt-2">
                    Adicionar
                 </button>
              </div>
              <button onClick={() => setShowBarberModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-white">
                 <span className="material-symbols-outlined">close</span>
              </button>
           </div>
        </div>
      )}

      {/* Product Add Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowProductModal(false)}></div>
           <div className="relative bg-background-light dark:bg-[#1a160a] w-full max-w-sm rounded-2xl p-6 border border-white/10 animate-fade-in shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Novo Produto</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Produto</label>
                    <input 
                      type="text" 
                      value={productForm.name}
                      onChange={e => setProductForm({...productForm, name: e.target.value})}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="Ex: Pomada Matte"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preço (R$)</label>
                    <input 
                      type="number" 
                      value={productForm.price}
                      onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="0.00"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                    <select 
                       value={productForm.category}
                       onChange={e => setProductForm({...productForm, category: e.target.value})}
                       className="w-full mt-1 bg-white dark:bg-[#1a160a] border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                    >
                       <option value="Cabelo">Cabelo</option>
                       <option value="Barba">Barba</option>
                       <option value="Acessórios">Acessórios</option>
                       <option value="Outros">Outros</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL da Imagem</label>
                    <input 
                      type="text" 
                      value={productForm.image}
                      onChange={e => setProductForm({...productForm, image: e.target.value})}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="https://..."
                    />
                 </div>
                 
                 <button onClick={handleSaveProduct} className="w-full bg-primary-gold text-black font-bold py-3.5 rounded-xl hover:bg-[#eebb14] transition-colors mt-2">
                    Salvar Produto
                 </button>
              </div>
              <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-white">
                 <span className="material-symbols-outlined">close</span>
              </button>
           </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowClientModal(false)}></div>
           <div className="relative bg-background-light dark:bg-[#1a160a] w-full max-w-sm rounded-2xl p-6 border border-white/10 animate-fade-in shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Novo Cliente</h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="Ex: Maria Oliveira"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</label>
                    <input 
                      type="tel" 
                      value={newClientPhone}
                      onChange={e => setNewClientPhone(e.target.value)}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="(00) 00000-0000"
                    />
                 </div>
                 <button onClick={handleAddClient} className="w-full bg-primary-gold text-black font-bold py-3.5 rounded-xl hover:bg-[#eebb14] transition-colors mt-2">
                    Cadastrar Cliente
                 </button>
              </div>
              <button onClick={() => setShowClientModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-white">
                 <span className="material-symbols-outlined">close</span>
              </button>
           </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowTransactionModal(false)}></div>
           <div className="relative bg-background-light dark:bg-[#1a160a] w-full max-w-sm rounded-2xl p-6 border border-white/10 animate-fade-in shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Nova Transação</h3>
              <div className="flex gap-2 mb-4 p-1 bg-slate-200 dark:bg-white/5 rounded-lg">
                 <button 
                   onClick={() => setNewTransType('in')} 
                   className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${newTransType === 'in' ? 'bg-green-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}>
                   Entrada
                 </button>
                 <button 
                   onClick={() => setNewTransType('out')} 
                   className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${newTransType === 'out' ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}>
                   Saída
                 </button>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newTransDesc}
                      onChange={e => setNewTransDesc(e.target.value)}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="Ex: Venda de Produto"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor (R$)</label>
                    <input 
                      type="number" 
                      value={newTransValue}
                      onChange={e => setNewTransValue(e.target.value)}
                      className="w-full mt-1 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-primary-gold"
                      placeholder="0,00"
                    />
                 </div>
                 <button onClick={handleAddTransaction} className="w-full bg-primary-gold text-black font-bold py-3.5 rounded-xl hover:bg-[#eebb14] transition-colors mt-2">
                    Adicionar
                 </button>
              </div>
              <button onClick={() => setShowTransactionModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-white">
                 <span className="material-symbols-outlined">close</span>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;