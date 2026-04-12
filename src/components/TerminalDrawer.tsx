import React, { useEffect, useRef, useState } from 'react';
import { podApi, Pod } from '@/lib/api';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface Props {
  pod: Pod | null;
  onClose: () => void;
}

export default function TerminalDrawer({ pod, onClose }: Props) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!pod || !terminalRef.current) return;

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

    podApi.getTerminalUrl(pod.namespace, pod.name).then((url) => {
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
  }, [pod]);

  if (!pod) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div className="w-full max-w-5xl h-[85vh] bg-slate-900 shadow-2xl flex flex-col border border-slate-700 rounded-xl overflow-hidden transform transition-all pointer-events-auto">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between text-slate-100 bg-slate-950">
          <div className="flex items-center space-x-3">
            <TerminalIcon className="text-blue-400" size={24} />
            <div>
              <h2 className="text-lg font-bold font-mono">Web Terminal</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                <span>{pod.namespace} / {pod.name}</span>
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
    </div>
    </>
  );
}
