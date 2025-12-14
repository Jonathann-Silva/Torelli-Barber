import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, logout, sendVerificationEmail, reloadUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if verified and logged in
  React.useEffect(() => {
    if (user && user.emailVerified) {
      if (user.role === UserRole.ADMIN) navigate('/admin/dashboard');
      else navigate('/client/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      // AuthContext will update 'user'. 
      // If user.emailVerified is false, the UI will switch to the verification view below.
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else {
        setError('Erro ao fazer login. Verifique sua conexão.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setInfoMessage('');
      setIsLoading(true);
      await sendVerificationEmail();
      setInfoMessage('E-mail de verificação reenviado! Verifique sua caixa de entrada e spam.');
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        setError('Aguarde um momento antes de reenviar o e-mail.');
      } else {
        setError('Erro ao enviar e-mail. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsLoading(true);
    setError('');
    try {
      await reloadUser();
      // If verification is successful, the useEffect above will trigger the redirect
      // If not, we stay on this screen
    } catch (err) {
      console.error("Erro ao verificar status:", err);
      setError("Não foi possível atualizar o status. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // If user is logged in BUT not verified, show verification screen
  if (user && !user.emailVerified) {
    return (
      <div className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-background-light dark:bg-background-dark-blue font-jakarta text-white antialiased">
         <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#111a22] opacity-95"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30 mix-blend-overlay"></div>
          <div className="absolute top-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-primary-blue/10 blur-[80px]"></div>
        </div>

        <div className="relative z-10 flex w-full flex-col px-6 py-8 sm:px-10 items-center max-w-md mx-auto text-center">
            <div className="size-20 rounded-full bg-primary-gold/10 flex items-center justify-center mb-6 text-primary-gold animate-bounce">
               <span className="material-symbols-outlined text-4xl">mark_email_unread</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifique seu E-mail</h1>
            <p className="text-[#92adc9] mb-6">
              Enviamos um link de confirmação para <strong>{user.email}</strong>. 
              Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
            </p>

            {infoMessage && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm mb-4 w-full animate-fade-in">{infoMessage}</div>}
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm mb-4 w-full animate-fade-in">{error}</div>}

            <button 
              onClick={handleResendEmail}
              disabled={isLoading}
              className="w-full bg-primary-blue hover:bg-blue-600 text-white font-bold py-3.5 rounded-lg shadow-lg mb-3 transition-colors disabled:opacity-50"
            >
              Reenviar E-mail
            </button>
            
            <button 
              onClick={handleCheckVerification}
              disabled={isLoading}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-lg border border-white/10 mb-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : "Já confirmei, atualizar"}
            </button>

            <button 
              onClick={() => logout()}
              className="text-sm text-slate-400 hover:text-white"
            >
              Sair / Entrar com outra conta
            </button>
        </div>
      </div>
    );
  }

  // Standard Login Form
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-background-light dark:bg-background-dark-blue font-jakarta text-white antialiased">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#111a22] opacity-95"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-primary-blue/10 blur-[80px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] h-[200px] w-[200px] rounded-full bg-accent-gold/10 blur-[60px]"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex w-full flex-col px-6 py-8 sm:px-10">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent-gold/30 bg-[#192633] shadow-lg shadow-black/40">
            <span className="material-symbols-outlined text-5xl text-accent-gold">content_cut</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Torelli Barber</h1>
          <p className="mt-2 text-center text-sm text-[#92adc9]">O seu estilo, no seu tempo.</p>
        </div>

        <form onSubmit={handleLogin} className="mx-auto w-full max-w-sm space-y-5">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center font-medium">{error}</div>}
          
          <div className="group">
            <label className="mb-2 block text-sm font-medium text-[#92adc9]" htmlFor="email">E-mail</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-[#92adc9] group-focus-within:text-primary-blue">mail</span>
              <input 
                className="form-input block w-full rounded-lg border border-[#324d67] bg-[#192633] py-3.5 pl-12 pr-4 text-white placeholder-[#92adc9]/50 focus:border-primary-blue focus:outline-none focus:ring-1 focus:ring-primary-blue" 
                id="email" 
                placeholder="exemplo@email.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="group">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-[#92adc9]" htmlFor="password">Senha</label>
              <a className="text-xs font-medium text-accent-gold hover:text-accent-gold/80 transition-colors" href="#">Esqueceu a senha?</a>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-[#92adc9] group-focus-within:text-primary-blue">lock</span>
              <input 
                className="form-input block w-full rounded-lg border border-[#324d67] bg-[#192633] py-3.5 pl-12 pr-12 text-white placeholder-[#92adc9]/50 focus:border-primary-blue focus:outline-none focus:ring-1 focus:ring-primary-blue" 
                id="password" 
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 flex items-center text-[#92adc9] hover:text-white focus:outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-primary-blue py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : "ENTRAR"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#324d67]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#111a22] px-2 text-[#92adc9]">Ou</span>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-[#92adc9]">
            Não tem uma conta? 
            <button type="button" onClick={() => navigate('/signup')} className="font-bold text-primary-blue hover:underline ml-1">Cadastre-se</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;