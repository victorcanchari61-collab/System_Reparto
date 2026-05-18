import { useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

const HUB_URL = '/hubs/delivery-tracking';

type EventHandler = (payload: any) => void;

interface UseRealtimeOptions {
  /** Mapa de evento → handler. Ej: { StockUpdated: (p) => ... } */
  on: Record<string, EventHandler>;
  /** Si false, no conecta (útil cuando no hay sesión activa) */
  enabled?: boolean;
}

/**
 * Hook que mantiene una conexión SignalR persistente al hub de la empresa.
 * Se une automáticamente al grupo company:{companyId} via OnConnectedAsync.
 * Reconecta con back-off exponencial si se pierde la conexión.
 *
 * Uso:
 *   useRealtime({
 *     on: {
 *       StockUpdated:    (p) => setStock(p.newStock),
 *       CompanyCreated:  (p) => refetch(),
 *       ModuleChanged:   (p) => refreshModules(),
 *     }
 *   });
 */
export function useRealtime({ on, enabled = true }: UseRealtimeOptions) {
  const connRef = useRef<signalR.HubConnection | null>(null);
  const onRef   = useRef(on);
  onRef.current = on; // siempre actualiza sin reconectar

  const connect = useCallback(async () => {
    const token = localStorage.getItem('nexus_access_token');
    if (!token || !enabled) return;

    // Evita conexiones duplicadas
    if (connRef.current?.state === signalR.HubConnectionState.Connected) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}?access_token=${encodeURIComponent(token)}`)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Registrar handlers dinámicos
    conn.onreconnected(() => {
      console.info('[SignalR] Reconectado');
    });

    // Proxy genérico: delega al handler del mapa
    const proxyHandler = (eventName: string) => (payload: any) => {
      onRef.current[eventName]?.(payload);
    };

    Object.keys(on).forEach(eventName => {
      conn.on(eventName, proxyHandler(eventName));
    });

    try {
      await conn.start();
      connRef.current = conn;
    } catch (err) {
      console.warn('[SignalR] Conexión fallida:', err);
    }
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    connect();
    return () => {
      connRef.current?.stop();
      connRef.current = null;
    };
  }, [connect]);

  return {
    /** Estado actual de la conexión */
    state: connRef.current?.state ?? signalR.HubConnectionState.Disconnected,
  };
}
