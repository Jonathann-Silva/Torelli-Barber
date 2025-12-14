import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAppointmentDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-[#121212] text-gray-900 dark:text-white h-screen flex flex-col overflow-hidden font-grotesk">
      <header className="flex-none bg-[#181818]/95 backdrop-blur-md dark:border-b dark:border-white/5 sticky top-0 z-50">
        <div className="flex items-center p-4 justify-between h-16">
          <button onClick={() => navigate(-1)} className="text-white flex size-10 items-center justify-center hover:bg-white/10 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Detalhes</h2>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <section className="bg-[#1E1E1E] px-4 py-6 mb-1 border-b border-white/5">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="bg-center bg-no-repeat bg-cover rounded-full h-20 w-20 ring-2 ring-primary-gold/50 shadow-lg shadow-black/50" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBtqNjpqZ91H0zifs27pSbNCqzmi9umZSe3WEgncYWoMuCDVTC9Nl5THUFHQjIiT3v78-5fPpPySmZ7fjJsCQIZaR1Bk4-483BFDr6VkUaYZTezHfCf90bvW4c-bgPuehH0C1Bvf41cpT1ljz-oOxdJdeZ_56WT2vA-0ORaKXYAsictLY1f8syT8LuomtR4eVjBtNtYF9Y9F6N1KOf5imsTHwuSLJ69sf8kwrB02368bxQl7O9pZrg2ADcQ6hLI72Lr1QxEKjbpL4vI")' }}></div>
                <div className="absolute bottom-0 right-0 bg-primary-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#1E1E1E]">VIP</div>
              </div>
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <h3 className="text-white text-2xl font-bold leading-tight truncate">João Silva</h3>
                <p className="text-gray-400 text-sm font-medium flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[16px] text-primary-gold">star</span>
                  4.9 • 48 visitas
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-4 bg-green-700/20 hover:bg-green-700/30 border border-green-600/30 text-green-400 text-sm font-bold transition-all active:scale-95">
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>WhatsApp</span>
              </button>
              <button className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all active:scale-95">
                <span className="material-symbols-outlined text-[20px]">call</span>
                <span>Ligar</span>
              </button>
            </div>
          </div>
        </section>

        <section className="p-4 space-y-4">
          <div className="bg-[#1E1E1E] rounded-xl p-4 border border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary-gold/10 p-2.5 rounded-lg text-primary-gold"><span className="material-symbols-outlined">calendar_today</span></div>
                <div><p className="text-white font-bold text-lg">12 Out, Qui</p><p className="text-gray-400 text-sm">2023</p></div>
              </div>
              <div className="h-8 w-[1px] bg-white/10"></div>
              <div className="flex items-center gap-3 text-right">
                <div><p className="text-white font-bold text-lg">14:30</p><p className="text-gray-400 text-sm">45 min</p></div>
                <div className="bg-primary-gold/10 p-2.5 rounded-lg text-primary-gold"><span className="material-symbols-outlined">schedule</span></div>
              </div>
            </div>
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block pl-1">Status Atual</label>
              <div className="relative">
                <select className="w-full bg-[#181818] text-white border border-white/10 rounded-lg h-12 pl-4 pr-10 appearance-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold outline-none transition-all font-medium">
                  <option value="confirmed">Confirmado</option>
                  <option value="inprogress">Em Atendimento</option>
                  <option value="finished">Finalizado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-4">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3 text-gray-500 pl-1">Serviços</h3>
          <div className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-white/5">
             <div className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
               <div className="bg-[#181818] p-2 rounded-lg text-gray-300"><span className="material-symbols-outlined">content_cut</span></div>
               <div className="flex-1"><p className="text-white text-base font-semibold">Corte Cabelo + Barba</p><p className="text-gray-500 text-sm">30 min</p></div>
               <div className="text-right"><p className="text-white font-bold">R$ 80,00</p></div>
             </div>
             <div className="bg-[#181818]/50 p-4 flex justify-between items-center border-t border-white/10">
               <p className="text-gray-400 text-sm font-medium">Total Estimado</p>
               <p className="text-primary-gold text-xl font-bold">R$ 95,00</p>
             </div>
          </div>
        </section>

        <section className="px-4 pb-4">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3 text-gray-500 pl-1">Observações do Barbeiro</h3>
          <div className="bg-[#1E1E1E] rounded-xl p-1 border border-white/5 focus-within:border-primary-gold/50 transition-colors">
            <textarea className="w-full bg-transparent text-white placeholder-gray-600 p-3 min-h-[100px] outline-none resize-none rounded-lg text-sm leading-relaxed" placeholder="Adicione notas sobre o corte..."></textarea>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-[#181818]/90 backdrop-blur-lg border-t border-white/5 p-4 z-40 pb-6">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="flex-1 h-12 bg-[#1E1E1E] hover:bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2">
             <span className="material-symbols-outlined text-[20px]">close</span>Cancelar
          </button>
          <button onClick={() => navigate(-1)} className="flex-[2] h-12 bg-primary-gold hover:bg-yellow-400 text-black rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(244,209,37,0.3)] active:scale-95 flex items-center justify-center gap-2">
             <span className="material-symbols-outlined text-[20px]">check</span>Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointmentDetails;