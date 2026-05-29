import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigate } from 'react-router-dom';

// Toma la URL base dependiendo de la configuración
const getApiUrl = () => {
    const mode = import.meta.env.VITE_CONNECTION;
    if (mode === 'network') return import.meta.env.VITE_API_URL_NETWORK;
    if (mode === 'prod') return import.meta.env.VITE_API_URL_PROD;
    return import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:3000';
};

const API_URL = getApiUrl();
const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const usePushAndSocket = () => {
    const { token, user, isAuthenticated } = useAuthStore();
    const socketRef = useRef(null);
    const navigate = useNavigate();

    // 1. Setup Push Notifications
    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        
        try {
            const registration = await navigator.serviceWorker.ready;
            
            let subscription = await registration.pushManager.getSubscription();
            
            if (!subscription) {
                const padding = '='.repeat((4 - VAPID_KEY.length % 4) % 4);
                const base64 = (VAPID_KEY + padding).replace(/-/g, '+').replace(/_/g, '/');
                const rawData = window.atob(base64);
                const outputArray = new Uint8Array(rawData.length);
                for (let i = 0; i < rawData.length; ++i) {
                    outputArray[i] = rawData.charCodeAt(i);
                }

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: outputArray
                });
            }

            if (token) {
                await fetch(`${API_URL}/api/notificaciones/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(subscription)
                });
            }

        } catch (error) {
            console.error('Error al suscribir a Push:', error);
        }
    };

    // 2. Setup Socket.io & Request Permissions
    useEffect(() => {
        if (!isAuthenticated || !token || !user) return;

        socketRef.current = io(API_URL, {
            query: { userId: user.id },
            auth: { token }
        });

        socketRef.current.on('connect', () => {
            console.log('Socketio conectado');
        });

        socketRef.current.on('notificacion_recibida', (data) => {
            toast.info(data.mensaje || data.titulo, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
                onClick: () => {
                    if (data.actionUrl) {
                        navigate(data.actionUrl);
                    }
                }
            });
        });

        // Intentar registro Push si el navegador lo soporta de forma segura
        if ('Notification' in window) {
            if (window.Notification.permission === 'granted') {
                subscribeToPush();
            } else if (window.Notification.permission !== 'denied') {
                window.Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        subscribeToPush();
                    }
                });
            }
        } else {
            console.warn('[Push] Notificaciones no soportadas en este navegador o dispositivo.');
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isAuthenticated, token, user, navigate]);

    return null;
};
