import { writable } from 'svelte/store';

// Store para controlar qual modal está aberto
export const modals = writable({
  notifications: false
  // outros modais podem ser adicionados aqui futuramente
});

// Ações para controlar os modais
export const modalActions = {
  openNotifications() {
    modals.update((state) => ({ ...state, notifications: true }));
  },

  closeNotifications() {
    modals.update((state) => ({ ...state, notifications: false }));
  },

  closeAll() {
    modals.set({
      notifications: false
    });
  }
};
