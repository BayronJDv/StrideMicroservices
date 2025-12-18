import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { supabase } from '../api/supabaseClient';
import { useSetAtom } from 'jotai';
import { isLoggedInAtom, userAtom, loadingAtom } from '../state/authAtoms';

// Componente que inicializa y escucha cambios de sesión de Supabase
export default function AuthListener({ children }) {
    const setIsLoggedIn = useSetAtom(isLoggedInAtom);
    const setUser = useSetAtom(userAtom);
    const setLoading = useSetAtom(loadingAtom);

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!mounted) return;
                setIsLoggedIn(!!session);
                setUser(session?.user || null);
            } catch (error) {
                console.error('Error checking auth:', error);
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsLoggedIn(!!session);
            setUser(session?.user || null);
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [setIsLoggedIn, setUser, setLoading]);

    return (
        <>
            <div>
                <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />
            </div>
            {children}
        </>
    );
}
