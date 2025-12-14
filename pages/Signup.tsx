import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create user and send verification email
      await signUp(formData.email, formData.password, formData.name, formData.phone, UserRole.CLIENT);
      
      // Navigate to login page (which will show the 'Verify Email' state since user is logged in but unverified)
      navigate('/');
      
    } catch (err: any) {
      console.error(err);
      if (err.message === 'LIMIT_REACHED') {
        setError('Limite de usuários atingido. Entre em contato com o administrador.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-jakarta antialiased text-white bg-background-light dark:bg-background-dark-blue min-h-screen flex flex-col overflow-x-hidden">
      <div className="relative flex flex-col flex-grow w-full max-w-md mx-auto bg-background-light dark:bg-background-dark-blue shadow-xl min-h-screen">
        <div className="absolute inset-0 z-0 h-64 w-full opacity-20 bg-gradient-to-b from-primary-gold/20 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center p-4 justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full text-white/80 hover:bg-white/10 active:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center px-6 pt-2 pb-6 text-center">
          <div className="size-16 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b87333] flex items-center justify-center mb-4 shadow-lg shadow-[#d4af37]/20">
            <span className="material-symbols-outlined text-white text-[32px]">content_cut</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Criar Conta</h1>
          <p className="text-white/60 text-sm font-medium leading-relaxed max-w-[280px]">
            Junte-se ao clube. Agende seu horário e mantenha o estilo em dia.
          </p>
        </div>

        <div className="relative z-10 flex flex-col px-6 gap-5 pb-8 flex-grow">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center font-medium">{error}</div>}

          <div className="group">
            <label className="block text-[#d4af37]/80 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Nome Completo</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-white/40 material-symbols-outlined text-[20px]">person</span>
              <input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#192633] border border-[#324d67] text-white text-base rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all placeholder:text-white/20" 
                placeholder="Ex: João Silva" 
                type="text"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[#d4af37]/80 text-xs font-bold uppercase tracking-wider mb-2 ml-1">E-mail</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-white/40 material-symbols-outlined text-[20px]">mail</span>
              <input 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#192633] border border-[#324d67] text-white text-base rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all placeholder:text-white/20" 
                placeholder="exemplo@email.com" 
                type="email"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[#d4af37]/80 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Telefone / WhatsApp</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-white/40 material-symbols-outlined text-[20px]">call</span>
              <input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-[#192633] border border-[#324d67] text-white text-base rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all placeholder:text-white/20" 
                placeholder="(00) 00000-0000" 
                type="tel"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[#d4af37]/80 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Senha</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-white/40 material-symbols-outlined text-[20px]">lock</span>
              <input 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#192633] border border-[#324d67] text-white text-base rounded-xl py-4 pl-12 pr-12 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all placeholder:text-white/20" 
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-white/40 hover:text-white/70 transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <div className="group">
            <label className="block text-[#d4af37]/80 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Confirmar Senha</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-white/40 material-symbols-outlined text-[20px]">lock_reset</span>
              <input 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full bg-[#192633] border border-[#324d67] text-white text-base rounded-xl py-4 pl-12 pr-12 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all placeholder:text-white/20" 
                placeholder="••••••••" 
                type={showConfirmPassword ? "text" : "password"}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 text-white/40 hover:text-white/70 transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <div className="h-4"></div>

          <button 
            onClick={handleSignup} 
            disabled={isLoading}
            className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-bold text-lg rounded-full py-4 shadow-lg shadow-primary-blue/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Cadastrar</span>
                <span className="material-symbols-outlined text-[20px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>

          <div className="mt-auto text-center pt-6 pb-2">
            <p className="text-white/60 text-sm">
              Já possui uma conta? 
              <button onClick={() => navigate('/')} className="text-primary-blue font-bold hover:text-primary-blue/80 transition-colors ml-1">Entrar</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;