'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

const WEBHOOK_URL = 'https://paneln8n.traid.business/webhook/conversacionmexkommozonafit';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface Thread {
  id: string;
  phone: string;
  name: string;
  messages: Message[];
  lastMessageDate: Date;
  pendingResponses?: number;
}

export default function TestingTab() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadsRef = useRef(threads);

  useEffect(() => {
    const saved = localStorage.getItem('conversationThreads');
    if (saved) {
      const parsed = JSON.parse(saved);
      setThreads(parsed.map((t: any) => ({
        ...t,
        lastMessageDate: new Date(t.lastMessageDate),
        messages: t.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      })));
    }
  }, []);

  // Mantener ref actualizado
  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  // Auto-scroll al final de mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, selectedThread]);

  const saveThreads = (updatedThreads: Thread[]) => {
    setThreads(updatedThreads);
    threadsRef.current = updatedThreads;
    localStorage.setItem('conversationThreads', JSON.stringify(updatedThreads));
  };

  const createThread = () => {
    if (!newPhone.trim() || !newName.trim()) {
      toast.error('Completa teléfono y nombre');
      return;
    }

    const newThread: Thread = {
      id: Date.now().toString(),
      phone: newPhone,
      name: newName,
      messages: [],
      lastMessageDate: new Date()
    };

    saveThreads([newThread, ...threads]);
    setSelectedThread(newThread.id);
    setShowNewThread(false);
    setNewPhone('');
    setNewName('');
    toast.success('Conversación creada');
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedThread) {
      toast.error('Escribe un mensaje');
      return;
    }

    const thread = threads.find(t => t.id === selectedThread);
    if (!thread) return;

    const messageId = Date.now().toString();
    const userMessage: Message = {
      id: messageId,
      text: message,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    // Agregar mensaje inmediatamente y limpiar input
    const updatedThreads = threads.map(t =>
      t.id === selectedThread
        ? { ...t, messages: [...t.messages, userMessage], lastMessageDate: new Date() }
        : t
    );
    saveThreads(updatedThreads);

    const currentMessage = message;
    const currentThreadId = selectedThread;
    const currentPhone = thread.phone;
    setMessage('');
    setPendingCount(prev => prev + 1);

    // Enviar de forma asíncrona sin bloquear
    (async () => {
      try {
        const formData = new URLSearchParams();
        formData.append('message[add][0][text]', currentMessage);
        formData.append('message[add][0][contact_id]', currentPhone);
        formData.append('message[add][0][chat_id]', currentThreadId);
        formData.append('message[add][0][talk_id]', currentThreadId);
        formData.append('account[id]', 'latinta');
        formData.append('account[subdomain]', 'latinta');

        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        let data = await res.json();

        // Parsear recursivamente si viene como string JSON
        const parseDeep = (d: any): any => {
          if (typeof d === 'string') {
            try {
              return parseDeep(JSON.parse(d));
            } catch {
              return d;
            }
          }
          return d;
        };
        data = parseDeep(data);

        // Manejar respuesta - puede ser string, array, o objeto con array
        let responses: string[] = [];

        // Extraer respuesta de diferentes estructuras posibles
        const extractResponses = (d: any): string[] => {
          if (!d) return [];

          // Estructura: {"output":{"respuesta":[...]}}
          if (d.output?.respuesta) {
            const resp = d.output.respuesta;
            return Array.isArray(resp) ? resp : [resp];
          }

          // Estructura: {"output.respuesta":[...]}
          if (d['output.respuesta']) {
            const resp = d['output.respuesta'];
            return Array.isArray(resp) ? resp : [resp];
          }

          // Estructura: {"respuesta":[...]}
          if (d.respuesta) {
            const resp = d.respuesta;
            return Array.isArray(resp) ? resp : [resp];
          }

          // Estructura: {"response":[...]}
          if (d.response) {
            return Array.isArray(d.response) ? d.response : [d.response];
          }

          // Array directo de objetos
          if (Array.isArray(d)) {
            return d.flatMap((item: any) => {
              if (typeof item === 'string') return [item];
              return extractResponses(item);
            }).filter(Boolean);
          }

          // Si es string, usarlo directamente
          if (typeof d === 'string') {
            return [d];
          }

          return [];
        };

        responses = extractResponses(data);

        // Fallback: si no encontramos respuestas, mostrar el JSON
        if (responses.length === 0) {
          responses = [JSON.stringify(data, null, 2)];
        }

        // Usar threadsRef para obtener el estado más reciente
        const currentThreads = threadsRef.current;

        // Crear un mensaje por cada respuesta del array
        const agentMessages: Message[] = responses.map((text, i) => ({
          id: (Date.now() + i + 1).toString(),
          text: text,
          sender: 'agent' as const,
          timestamp: new Date()
        }));

        const finalThreads = currentThreads.map(t =>
          t.id === currentThreadId
            ? { ...t, messages: [...t.messages, ...agentMessages], lastMessageDate: new Date() }
            : t
        );
        saveThreads(finalThreads);

        if (res.ok) {
          toast.success('Respuesta recibida');
        } else {
          toast.error(`Error: ${res.status}`);
        }
      } catch (error: any) {
        const currentThreads = threadsRef.current;
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Error: ${error.message}`,
          sender: 'agent',
          timestamp: new Date()
        };

        const finalThreads = currentThreads.map(t =>
          t.id === currentThreadId
            ? { ...t, messages: [...t.messages, errorMessage], lastMessageDate: new Date() }
            : t
        );
        saveThreads(finalThreads);
        toast.error('Error de conexión');
      } finally {
        setPendingCount(prev => Math.max(0, prev - 1));
      }
    })();
  };

  const deleteThread = (threadId: string) => {
    saveThreads(threads.filter(t => t.id !== threadId));
    if (selectedThread === threadId) {
      setSelectedThread(null);
    }
    toast.success('Conversación eliminada');
  };

  const selectedThreadData = threads.find(t => t.id === selectedThread);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestor de Conversaciones</h2>
          <p className="text-gray-400">La Tinta Fine Art Print</p>
        </div>
        <button onClick={() => setShowNewThread(true)} className="btn-primary">
          ➕ Nueva Conversación
        </button>
      </div>

      {showNewThread && (
        <div className="card space-y-4">
          <h3 className="text-lg font-bold text-white">Nueva Conversación</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Teléfono</label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+52..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createThread} className="btn-primary">Crear</button>
            <button onClick={() => setShowNewThread(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de hilos */}
        <div className="card space-y-2 max-h-[600px] overflow-y-auto">
          <h3 className="text-lg font-bold text-white sticky top-0 bg-gray-800 pb-2">Conversaciones</h3>
          {threads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay conversaciones</p>
          ) : (
            threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(thread.id)}
                className={`p-3 rounded cursor-pointer transition ${
                  selectedThread === thread.id
                    ? 'bg-purple-600/20 border-l-4 border-purple-500'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white font-medium">{thread.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteThread(thread.id); }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-xs text-gray-400">{thread.phone}</p>
                <p className="text-xs text-gray-500">
                  {thread.lastMessageDate.toLocaleDateString()} {thread.lastMessageDate.toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-500">{thread.messages.length} mensajes</p>
              </div>
            ))
          )}
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 card flex flex-col h-[600px]">
          {!selectedThreadData ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Selecciona una conversación
            </div>
          ) : (
            <>
              <div className="border-b border-gray-700 pb-3 mb-4">
                <h3 className="text-lg font-bold text-white">{selectedThreadData.name}</h3>
                <p className="text-sm text-gray-400">{selectedThreadData.phone}</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {selectedThreadData.messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay mensajes</p>
                ) : (
                  <>
                    {selectedThreadData.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-gray-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                            {msg.status === 'sending' && ' ⏳'}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
                {pendingCount > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700/50 text-gray-400 rounded-lg p-3 text-sm animate-pulse">
                      Esperando {pendingCount} respuesta{pendingCount > 1 ? 's' : ''}...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe un mensaje... (puedes enviar varios seguidos)"
                  className="flex-1"
                />
                <button
                  onClick={sendMessage}
                  className="btn-primary px-6"
                >
                  📤
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
