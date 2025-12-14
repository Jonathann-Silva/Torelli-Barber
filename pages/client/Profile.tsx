import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';

// Mock History Data REMOVED
const MOCK_HISTORY: any[] = [];

const ClientProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '+55 (11) 99876-5432',
    email: user?.email || ''
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvatarClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  // Function to compress image before saving
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500; // Limit width to 500px
          const scaleSize = MAX_WIDTH / img.width;
          
          // Calculate new dimensions
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const compressedBase64 = await compressImage(file);
        await updateUser({ avatar: compressedBase64 });
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        alert("Erro ao enviar imagem. Tente uma foto menor.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser({ name: formData.name, email: formData.email, phone: formData.phone });
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Erro ao salvar alterações.");
    }
  };

  return (
    <ClientLayout>
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background-light/90 dark:bg-background-dark-blue/90 backdrop-blur-md p-4 transition-all duration-300">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full active:bg-slate-200 dark:active:bg-surface-dark-blue transition-colors">
          <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Meu Perfil</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className={`flex size-10 items-center justify-center rounded-full transition-colors ${isEditing ? 'bg-primary-blue text-white' : 'active:bg-slate-200 dark:active:bg-surface-dark-blue'}`}
        >
          <span className="material-symbols-outlined text-slate-900 dark:text-white">{isEditing ? 'check' : 'edit'}</span>
        </button>
      </header>

      <main className="flex flex-col gap-6 px-4 pt-2 pb-6">
        <section className="flex flex-col items-center gap-4">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="h-28 w-28 rounded-full p-[2px] bg-gradient-to-tr from-primary-blue to-[#d4af37]">
              {uploading ? (
                <div className="h-full w-full rounded-full bg-surface-dark-blue flex items-center justify-center">
                  <span className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                </div>
              ) : (
                <div 
                  className="h-full w-full rounded-full border-4 border-background-light dark:border-background-dark-blue bg-cover bg-center transition-opacity group-hover:opacity-80" 
                  style={{ backgroundImage: user?.avatar ? `url("${user.avatar}")` : 'none', backgroundColor: '#192633' }}
                >
                  {!user?.avatar && (
                    <div className="flex h-full w-full items-center justify-center text-white/50">
                      <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full bg-primary-blue text-white shadow-lg border-2 border-background-light dark:border-background-dark-blue group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm">camera_alt</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
          
          <div className="flex flex-col items-center text-center w-full max-w-xs space-y-2">
            {isEditing ? (
              <div className="w-full flex flex-col gap-3 animate-fade-in">
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full text-center bg-white dark:bg-surface-dark-blue border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-white font-bold text-lg focus:border-primary-blue outline-none"
                  placeholder="Seu Nome"
                />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full text-center bg-white dark:bg-surface-dark-blue border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-500 dark:text-slate-400 text-sm font-medium focus:border-primary-blue outline-none"
                  placeholder="Seu Telefone"
                />
                 <button 
                  onClick={handleSaveProfile}
                  className="mt-2 w-full bg-primary-blue text-white font-bold py-2 rounded-lg shadow-lg active:scale-95 transition-transform"
                >
                  Salvar Alterações
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">{user?.name}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{formData.phone}</p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-surface-dark-blue px-3 py-1 border border-accent-gold/30">
                  <span className="material-symbols-outlined text-accent-gold text-xs">workspace_premium</span>
                  <span className="text-xs font-semibold text-accent-gold tracking-wide uppercase">Membro VIP</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-white dark:bg-surface-dark-blue p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="text-3xl font-bold tracking-tight text-primary-blue">0</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cortes Totais</p>
          </div>
          <div className="relative flex flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-surface-dark-blue to-[#1a1500] p-4 shadow-sm border border-accent-gold/40 overflow-hidden">
            <div className="absolute -right-4 -top-4 size-16 rounded-full bg-accent-gold/10 blur-xl"></div>
            <p className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] bg-clip-text text-transparent drop-shadow-sm">0</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-accent-gold text-xs">star</span>
              <p className="text-xs font-medium text-accent-gold uppercase tracking-wider">Pontos Gold</p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="ml-1 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1">Geral</h3>
          
          <button 
            onClick={() => setIsEditing(true)} 
            className="group flex items-center justify-between rounded-xl bg-white dark:bg-surface-dark-blue p-4 shadow-sm border border-transparent dark:border-slate-800 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary-blue/10 text-primary-blue dark:bg-primary-blue/20 dark:text-primary-blue">
                <span className="material-symbols-outlined">person</span>
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Meus Dados</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>

          <div className="flex flex-col rounded-xl bg-white dark:bg-surface-dark-blue shadow-sm border border-transparent dark:border-slate-800 overflow-hidden">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex w-full items-center justify-between p-4 active:bg-slate-50 dark:active:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary-blue/10 text-primary-blue dark:bg-primary-blue/20 dark:text-primary-blue">
                  <span className="material-symbols-outlined">content_cut</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Histórico de Cortes</span>
              </div>
              <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${showHistory ? 'rotate-90' : ''}`}>chevron_right</span>
            </button>
            
            {/* Expanded History List */}
            {showHistory && (
              <div className="bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-700/50">
                {MOCK_HISTORY.length > 0 ? MOCK_HISTORY.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.service}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.date} • {item.barber}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary-gold">R$ {item.price.toFixed(2)}</p>
                  </div>
                )) : (
                    <div className="p-4 text-center text-slate-500 text-sm">Nenhum histórico disponível.</div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2">
           <h3 className="ml-1 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1 mt-2">App</h3>
           <button onClick={handleLogout} className="group flex items-center justify-between rounded-xl bg-white dark:bg-surface-dark-blue p-4 shadow-sm border border-transparent dark:border-slate-800 active:scale-[0.99] transition-all">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <span className="font-semibold text-red-500">Sair da Conta</span>
            </div>
          </button>
        </section>
      </main>
    </ClientLayout>
  );
};

export default ClientProfile;