import React, { useEffect, useRef, useState } from 'react';
import { ApplicationDeployment, api } from '@/lib/api';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface Props {
  app: ApplicationDeployment | null;
  onClose: () => void;
}

export default function TerminalDrawer({ app, onClose }: Props) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!app || !terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#0a0a0a',
        foreground: '#d4d4d8',
        cursor: '#3b82f6',
        selectionBackground: '#1e3a8a',
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    api.getTerminalUrl(app.namespace, app.name, `${app.name}-pod`).then((url) => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        term.writeln('\x1b[32m[Connected to Terminal]\x1b[0m');
      };

      ws.onmessage = (event) => {
        term.write(event.data);
      };

      ws.onclose = () => {
        setConnected(false);
        term.writeln('\n\x1b[31m[Connection Closed]\x1b[0m');
      };

      ws.onerror = () => {
        setConnected(false);
        term.writeln('\n\x1b[31m[Connection Error]\x1b[0m');
      };

      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });
    }).catch(err => {
      term.writeln(`\x1b[31m[Error fetching terminal URL]: ${err.message}\x1b[0m`);
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      wsRef.current?.close();
      term.dispose();
    };
  }, [app]);

  if (!app) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-4xl bg-slate-900 shadow-2xl flex flex-col border-l border-slate-700 transform transition-transform duration-300">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between text-slate-100 bg-slate-950">
          <div className="flex items-center space-x-3">
            <TerminalIcon className="text-blue-400" size={24} />
            <div>
              <h2 className="text-lg font-bold font-mono">Web Terminal</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                <span>{app.namespace} / {app.name}</span>
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span>{connected ? 'Connected' : 'Disconnected'}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 bg-[#0a0a0a] p-4 overflow-hidden relative">
          <div ref={terminalRef} className="w-full h-full" />
        </div>
      </div>
    </>
  );
}
