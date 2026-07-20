import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/auth-store';
import { useSyncStore } from '@/stores/sync-store';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

// Toma la URL base dependiendo de la configuración y remueve barras diagonales al final
const getApiUrl = () => {
    const mode = import.meta.env.VITE_CONNECTION;
    let url = import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:3000';
    if (mode === 'network') url = import.meta.env.VITE_API_URL_NETWORK || url;
    if (mode === 'prod') url = import.meta.env.VITE_API_URL_PROD || url;
    return (url || '').replace(/\/+$/, '');
};

const API_URL = getApiUrl();
const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const usePushAndSocket = () => {
    const { token, user, isAuthenticated } = useAuthStore();
    const socketRef = useRef(null);
    const navigate = useNavigate();
    const userId = user?.id || user?.data?.id;

    // 1. Setup Push Notifications
    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_KEY) return;
        
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
                const subObj = subscription.toJSON();
                await api.post('/api/notificaciones/subscribe', {
                    endpoint: subObj.endpoint,
                    keys: {
                        p256dh: subObj.keys?.p256dh,
                        auth: subObj.keys?.auth
                    }
                });
            }

        } catch (error) {
            console.error('Error al suscribir a Push:', error);
        }
    };

    // 2. Setup Socket.io & Request Permissions
    useEffect(() => {
        if (!isAuthenticated || !token || !userId) return;

        socketRef.current = io(API_URL, {
            query: { userId },
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socketRef.current.on('connect', () => {
            console.log('Socketio conectado');
            socketRef.current.emit('join_room', userId);
        });

        socketRef.current.on('notificacion_recibida', (data) => {
            useSyncStore.getState().triggerSync();
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
    }, [isAuthenticated, token, userId, navigate]);

    return null;
};

