import React from 'react';
import * as signalR from '@microsoft/signalr';

interface Props {
  state: signalR.HubConnectionState;
}

const CONFIG: Record<signalR.HubConnectionState, { dot: string; label: string }> = {
  [signalR.HubConnectionState.Connected]:     { dot: 'bg-green-500', label: 'En vivo' },
  [signalR.HubConnectionState.Connecting]:    { dot: 'bg-yellow-400 animate-pulse', label: 'Conectando...' },
  [signalR.HubConnectionState.Reconnecting]:  { dot: 'bg-yellow-400 animate-pulse', label: 'Reconectando...' },
  [signalR.HubConnectionState.Disconnected]:  { dot: 'bg-gray-300', label: 'Sin conexión' },
  [signalR.HubConnectionState.Disconnecting]: { dot: 'bg-gray-300', label: 'Desconectando' },
};

const LiveIndicator: React.FC<Props> = ({ state }) => {
  const cfg = CONFIG[state];
  return (
    <div className="flex items-center gap-1.5" title={cfg.label}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <span className="text-[11px] text-gray-400 hidden md:inline">{cfg.label}</span>
    </div>
  );
};

export default LiveIndicator;
