import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Paperclip, 
  MoreHorizontal, 
  RefreshCw,
  MessageSquare,
  Sparkles,
  Activity,
  GraduationCap,
  Landmark
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: "Hello! I'm your Awam Assist AI Assistant. How can I help you discover universities, government schemes, or healthcare facilities today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userIdRef = useRef<string>('');

  useEffect(() => {
    const storedId = localStorage.getItem('awam_assist_chat_user_id');
    if (storedId) {
      userIdRef.current = storedId;
      return;
    }

    const generatedId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    userIdRef.current = generatedId;
    localStorage.setItem('awam_assist_chat_user_id', generatedId);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          user_id: userIdRef.current || 'anonymous'
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          role: 'bot',
          content: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const botMessage: Message = {
        role: 'bot',
        content: "I'm having trouble connecting right now. Please check your connection or try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  const handleRefresh = () => {
    setMessages([
      {
        role: 'bot',
        content: "Chat reset. How can I help you today?",
        timestamp: new Date()
      }
    ]);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
      
      {/* ── Hero Header ── */}
      <section className="relative overflow-hidden rounded-3xl hero-gradient-ai p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
        <div className="absolute top-4 right-6 w-24 h-24 rounded-full bg-white/5 animate-float" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="h-3 w-3 text-blue-300" />
              <span>AI Powered Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Awam Assist <span className="text-blue-300">AI</span>
            </h1>
            <p className="text-white/70 max-w-xl text-sm md:text-base font-medium">
              Your personalized digital companion for navigating government services, 
              education opportunities, and healthcare support in Pakistan.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 ai-pulse">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <div className="text-center">
              <div className="text-xs font-black uppercase tracking-tighter text-blue-200">System Status</div>
              <div className="flex items-center gap-1.5 justify-center">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold">Online</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Chat Container ── */}
      <Card className="flex flex-col h-[650px] border-none shadow-2xl overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/50">
        <CardHeader className="bg-white/40 border-b border-white/50 px-6 py-4 flex flex-row items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black">Secure AI Terminal</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Encrypted End-to-End</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/50" onClick={handleRefresh} title="Reset Chat">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
            <div className="h-4 w-[1px] bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/50 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow p-0 relative overflow-hidden bg-slate-50/20">
          <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`} style={{ animationDelay: '100ms' }}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-md ${
                      m.role === 'user' ? 'bg-primary text-white' : 'bg-white text-primary border border-primary/10'
                    }`}>
                      {m.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className={`p-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white text-foreground rounded-tl-none border border-white shadow-lg shadow-primary/5'
                      }`}>
                        {m.content}
                      </div>
                      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'user' ? 'You' : 'Assistant'} • {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-2xl bg-white border border-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-white flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-6 bg-white/40 border-t border-white/50 backdrop-blur-md">
          <div className="w-full space-y-4">
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Find Universities", icon: GraduationCap, color: "text-blue-500", query: "Find universities for me" },
                { label: "Gov Schemes", icon: Landmark, color: "text-purple-500", query: "Tell me about government schemes" },
                { label: "Hospitals Nearby", icon: Activity, color: "text-rose-500", query: "Find nearest hospitals" }
              ].map((action) => (
                <Button 
                  key={action.label}
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-xl bg-white/50 border-white hover:bg-white transition-all text-[11px] font-bold shadow-sm"
                  onClick={() => handleQuickAction(action.query)}
                >
                  <action.icon className={`h-3.5 w-3.5 mr-2 ${action.color}`} />
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex items-end gap-3">
              <div className="relative flex-grow">
                <Input
                  className="min-h-[56px] py-4 pl-5 pr-12 rounded-[1.25rem] border-white focus-visible:ring-primary focus-visible:border-primary bg-white/80 shadow-inner text-base"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-3 bottom-3 h-8 w-8 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </div>
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                className="h-[56px] w-[56px] rounded-[1.25rem] gradient-accent text-white shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="h-6 w-6" />
              </Button>
            </div>
            
            <p className="text-[10px] text-center font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
              Powered by AwamAssist Recommendation Engine
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};


export default AIChatbot;
