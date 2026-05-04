import React, { useState, useEffect } from 'react';
import { LoginDesktop } from '../views/login-desktop';
import { LoginMobile } from '../views/login-mobile';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuth } from '../hooks/use-auth';
import { notify } from '@/components/notification/adaptive-notify';

const LoginPage = () => {
  const [view, setView] = useState('login');
  const [submitted, setSubmitted] = useState(false);
  const [bgImageDesktop, setBgImageDesktop] = useState('');
  const [bgImageMobile, setBgImageMobile] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    confirmPassword: ''
  });

  const isDesktop = useIsDesktop();
  const { login, register, loading, backendError, setBackendError } = useAuth();

  useEffect(() => {
    const randomDeskIndex = Math.floor(Math.random() * 3) + 1; 
    const randomMobIndex = Math.floor(Math.random() * 4) + 1;  
    setBgImageDesktop(`/loginEscritorio/${randomDeskIndex}.webp`);
    setBgImageMobile(`/loginMovil/${randomMobIndex}.webp`);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (backendError) setBackendError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setBackendError(null);
    
    const isLogin = view === 'login';
    const isCorporateEmail = formData.email.trim().toLowerCase().endsWith('@cuadra.com.mx');
    
    if (isLogin) {
      if (!formData.email.trim() || !formData.password.trim()) return;
      
      const success = await login(formData.email.trim(), formData.password);
      if (success) {
        notify.success('¡Sesión iniciada correctamente!');
      }
      
    } else {
      if (!isCorporateEmail || !formData.password.trim() || formData.password !== formData.confirmPassword || !formData.nombre.trim()) return;
      
      const success = await register(formData);
      if (success) {
        notify.success('Solicitud de registro enviada para validación.');
        setView('login');
        setSubmitted(false);
      }
    }
  };

  const handleNavigate = (targetView) => {
    setView(targetView);
    setSubmitted(false);
    setBackendError(null);
  };

  const formProps = {
    formData,
    loading,
    submitted,
    backendError,
    onChange: handleChange,
    onSubmit: handleSubmit,
    onForgot: () => handleNavigate('forgot'),
    onRegister: () => handleNavigate('register'),
    onBack: () => handleNavigate('login')
  };

  return isDesktop ? (
    <LoginDesktop view={view} bgImage={bgImageDesktop} {...formProps} />
  ) : (
    <LoginMobile view={view} bgImage={bgImageMobile} {...formProps} />
  );
};

export default LoginPage;