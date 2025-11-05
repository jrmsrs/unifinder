<script lang="ts">
  import { getNotifications } from '$lib/api/notifications';
  import { notifications } from '$lib/stores/notifications';
  import { onDestroy } from 'svelte';

  interface Props {
    session: any;
  }

  let { session }: Props = $props();

  let pollInterval: NodeJS.Timeout | null = $state(null);
  const POLL_INTERVAL_MS = 30000; // 30 segundos

  // Busca notificações do servidor
  async function fetchNotifications() {
    if (!session?.access_token) return;

    try {
      const response = await getNotifications({ token: session.access_token, size: 50 });
      const serverNotifications = response.items || [];

      // Sincroniza com o servidor: sobrescreve notificações locais com dados do servidor
      // Mantém o estado de entregas do servidor
      notifications.update((current) => {
        const serverMap = new Map(serverNotifications.map((n) => [n.id, n]));
        const currentMap = new Map(current.map((n) => [n.id, n]));

        // Atualiza notificações existentes com dados do servidor
        const updated = current.map((n) => serverMap.get(n.id) || n);

        // Adiciona novas notificações do servidor
        const newNotifications = serverNotifications.filter((n) => !currentMap.has(n.id));

        // Retorna as notificações ordenadas por data (mais recentes primeiro)
        return [...updated, ...newNotifications]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 50);
      });
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }

  // Inicia polling quando há sessão
  $effect(() => {
    if (session?.access_token) {
      // Busca imediatamente
      fetchNotifications();

      // Inicia polling periódico
      pollInterval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    } else {
      // Para o polling se não houver sessão
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }
  });

  onDestroy(() => {
    // Limpa o intervalo quando o componente é destruído
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  });
</script>

<!-- Componente invisível - apenas faz polling em background -->

