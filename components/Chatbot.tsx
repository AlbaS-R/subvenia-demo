
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, Modality, Chat, GenerateContentResponse } from '@google/genai';
import { robotIcon } from './icons/RobotIcon';
import { Button } from './common/Button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy Explora, tu asistente de Find. ¿Quieres que te guíe paso a paso para encontrar convocatorias y generar tu informe?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatMode, setChatMode] = useState<'text' | 'audio'>('text');
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [liveSession, setLiveSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAudioStreaming, setIsAudioStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const nextStartTimeRef = useRef(0);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const currentAssistantMessageIdRef = useRef<string | null>(null);
  const currentTranscriptionRef = useRef<string>('');
  const currentUserMessageIdRef = useRef<string | null>(null);
  const currentUserTranscriptionRef = useRef<string>('');
  const liveSessionRef = useRef<any>(null);
  const liveSessionPromiseRef = useRef<Promise<any> | null>(null);

  const BASE_SYSTEM_PROMPT = `Actúa como un Experto Guiador en el uso del software Find. Tu nombre es Explora. Tu cargo es Grants & Funding Specialist. Debes orientar al usuario en las etapas del software: 1. Recoger Info, 2. Definir Proyecto, 3. Filtros, 4. Buscar, 5. Distribuir, 6. Dashboard. Responde siempre en español de manera clara y concisa.`;

  const getSystemInstructionWithHistory = () => {
    const historyMessages = messages.filter(msg => msg.id !== '1');
    if (historyMessages.length === 0) return BASE_SYSTEM_PROMPT;
    const historyText = historyMessages.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n\n');
    return `${BASE_SYSTEM_PROMPT}\n\nHistorial:\n${historyText}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  useEffect(() => {
    if (isOpen) {
      if (chatMode === 'text' && !chatSession) {
        initializeTextChat();
      } else if (chatMode === 'audio' && !liveSession) {
        initializeAudioChat();
      }
    }
  }, [isOpen]);

  const initializeTextChat = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Updated model to gemini-3-flash-preview
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: getSystemInstructionWithHistory(),
          temperature: 0.7,
        },
      });
      setChatSession(chat);
    } catch (e: any) {
      setError("No se pudo iniciar el asistente.");
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAudioChat = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => setIsLoading(false),
          onmessage: async (message) => {
            const transcription = message.serverContent?.outputTranscription?.text;
            const inputTranscription = message.serverContent?.inputTranscription?.text;
            const isTurnComplete = message.serverContent?.turnComplete;
            if (inputTranscription) {
              if (!currentUserMessageIdRef.current) {
                const newId = Date.now().toString();
                currentUserMessageIdRef.current = newId;
                currentUserTranscriptionRef.current = inputTranscription;
                addMessage('user', inputTranscription, newId);
              } else {
                currentUserTranscriptionRef.current += inputTranscription;
                setMessages(prev => prev.map(msg => msg.id === currentUserMessageIdRef.current ? { ...msg, content: currentUserTranscriptionRef.current } : msg));
              }
            }
            if (transcription) {
              if (!currentAssistantMessageIdRef.current) {
                const newId = Date.now().toString();
                currentAssistantMessageIdRef.current = newId;
                currentTranscriptionRef.current = transcription;
                addMessage('assistant', transcription, newId);
              } else {
                currentTranscriptionRef.current += transcription;
                setMessages(prev => prev.map(msg => msg.id === currentAssistantMessageIdRef.current ? { ...msg, content: currentTranscriptionRef.current } : msg));
              }
            }
            if (isTurnComplete) {
              currentAssistantMessageIdRef.current = null;
              currentTranscriptionRef.current = '';
              currentUserMessageIdRef.current = null;
              currentUserTranscriptionRef.current = '';
            }
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              if (!outputAudioContextRef.current) outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
              const ctx = outputAudioContextRef.current;
              const nextStartTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTime);
              nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
            }
          },
          onerror: () => {
            setError("Error en la conexión de audio.");
            setIsLoading(false);
          },
          onclose: () => {
            setLiveSession(null);
            liveSessionPromiseRef.current = null;
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: getSystemInstructionWithHistory(),
        },
      });
      liveSessionPromiseRef.current = sessionPromise;
      const session = await sessionPromise;
      setLiveSession(session);
      liveSessionRef.current = session;
    } catch (e: any) {
      setError("No se pudo iniciar el modo audio.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchChatMode = async (newMode: 'text' | 'audio') => {
    if (newMode === chatMode) return;
    setIsLoading(true);
    if (chatMode === 'audio') stopAudioStream();
    if (liveSessionRef.current) liveSessionRef.current.close();
    setChatSession(null);
    setLiveSession(null);
    setChatMode(newMode);
  };

  const addMessage = (role: 'user' | 'assistant', content: string, id?: string): string => {
    const newMessage: Message = { id: id || `${Date.now()}-${Math.random()}`, role, content, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    setIsLoading(true);
    try {
      if (chatMode === 'text' && chatSession) {
        const assistantMessageId = addMessage('assistant', '...');
        const responseStream = await chatSession.sendMessageStream({ message: userMessage });
        let fullResponse = '';
        for await (const chunk of responseStream) {
          const c = chunk as GenerateContentResponse;
          fullResponse += c.text;
          updateMessageContent(assistantMessageId, fullResponse);
        }
      } else if (chatMode === 'audio' && liveSession) {
        await liveSession.sendClientContent({ turns: [{ role: "user", parts: [{ text: userMessage }] }], turnComplete: true });
      }
    } catch (e: any) {
      addMessage('assistant', 'Error al procesar el mensaje.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessageContent = (id: string, newContent: string) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, content: newContent } : msg));
  };

  const startAudioStream = async () => {
    if (isAudioStreaming) return;
    const session = await liveSessionPromiseRef.current;
    if (!session) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const ctx = audioContextRef.current;
      mediaStreamSourceRef.current = ctx.createMediaStreamSource(stream);
      scriptProcessorRef.current = ctx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current.onaudioprocess = (ev) => {
        const inputData = ev.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        liveSessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: pcmBlob }));
      };
      mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(ctx.destination);
      setIsAudioStreaming(true);
    } catch (err) {
      setError("No se pudo acceder al micrófono.");
    }
  };

  const stopAudioStream = () => {
    if (!isAudioStreaming) return;
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamSourceRef.current?.disconnect();
    scriptProcessorRef.current?.disconnect();
    setIsAudioStreaming(false);
  };

  const handleClose = () => {
    stopAudioStream();
    if (liveSessionRef.current) liveSessionRef.current.close();
    onClose();
  };

  const statusInfo = chatMode === 'text' ? { text: "Modo Texto", color: "bg-tertiary-500" } : { text: "Modo Audio", color: "bg-primary-500" };

  return (
    isOpen && (
      <div className={`fixed bottom-4 right-4 z-50 glass-panel rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden border border-white/10 ${isExpanded ? 'w-[calc(100vw-2rem)] max-w-[600px] h-[calc(100vh-2rem)] max-h-[700px]' : 'w-96 h-[500px]'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img src={robotIcon} alt="Explora" className="w-10 h-10 object-contain" />
            <div>
              <h3 className="font-semibold text-foreground font-poppins">Explora</h3>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
                <span className="text-xs text-muted-foreground font-roboto">{statusInfo.text}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => switchChatMode(chatMode === 'text' ? 'audio' : 'text')} className="rounded-full !p-0 w-8 h-8 text-muted-foreground hover:bg-accent"><span className="material-symbols-outlined text-lg leading-none">graphic_eq</span></Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="rounded-full !p-0 w-8 h-8 text-muted-foreground hover:bg-accent"><span className="material-symbols-outlined text-lg leading-none">open_in_full</span></Button>
            <Button variant="ghost" size="sm" onClick={handleClose} className="rounded-full !p-0 w-8 h-8 text-muted-foreground hover:bg-accent"><span className="material-symbols-outlined text-lg leading-none">close</span></Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-roboto custom-scrollbar">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-base border shadow-sm ${m.role === 'user' ? 'bg-primary/20 text-neutral-100 border-primary/25' : 'bg-white/8 text-neutral-200 border-white/10'}`}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-white/10 flex gap-2 bg-black/10">
          {chatMode === 'audio' && (
            <Button onMouseDown={startAudioStream} onMouseUp={stopAudioStream} variant={isAudioStreaming ? 'destructive' : 'outline'} className="p-3"><span className="material-symbols-outlined text-2xl leading-none">mic</span></Button>
          )}
          <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} className="flex-1 px-4 py-3 border border-white/10 rounded-xl bg-card/70 text-base font-roboto backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60" placeholder="Escribe..." />
          <Button onClick={sendMessage}><span className="material-symbols-outlined text-2xl leading-none">send</span></Button>
        </div>
      </div>
    )
  );
};

export default Chatbot;
