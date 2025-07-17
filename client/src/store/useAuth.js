import { create } from 'zustand';

const useAuth = create((set) => ({
  user: JSON.parse(localStorage.getItem('bankUser')) || null,

  login: (userData) => {
    localStorage.setItem('bankUser', JSON.stringify(userData));
    set({ user: userData });
  },

  logout: () => {
    localStorage.removeItem('bankUser');
    set({ user: null });
  },
}));

export default useAuth;
