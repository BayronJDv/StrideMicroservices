import { atom } from 'jotai';

// Atoms para manejar estado de autenticación con jotai
export const isLoggedInAtom = atom(false);
export const userAtom = atom(null);
export const loadingAtom = atom(true);
