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
  Activity
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
      content: "Hello! I'm your AI Assistant. How can I help you today with universities, schemes, or hospitals?",
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
      // Call backend API
      console.log('Sending request to:', 'http://localhost:5001/api/chat');
      console.log('Request payload:', { message: input, user_id: userIdRef.current });
      
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

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

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
      
      // Show actual error or fallback message
      let errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Network error: Unable to connect to the server. Please check your internet connection.";
        } else if (error.message.includes('JSON')) {
          errorMessage = "Server error: Received invalid response. Please try again.";
        }
      }
      
      const botMessage: Message = {
        role: 'bot',
        content: errorMessage,
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
        content: "Hello! I'm your AI Assistant. How can I help you today with universities, schemes, or hospitals?",
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
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto animate-in fade-in duration-500">
      <Card className="flex-grow flex flex-col border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden rounded-2xl border border-gray-100">
        <CardHeader className="border-b bg-white p-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Awam Assist AI
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] py-0">Beta</Badge>
              </CardTitle>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Always active • Ready to help
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow p-0 relative overflow-hidden bg-slate-50/30">
          <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${
                      m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-100'
                    }`}>
                      {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className={`p-3.5 rounded-2xl shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                      </div>
                      <span className={`text-[10px] text-gray-400 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 bg-white border-t border-gray-100">
          <div className="w-full flex flex-col gap-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-50 border-slate-200 text-slate-600 text-[11px] rounded-full hover:bg-slate-100"
                onClick={() => handleQuickAction("Find universities for me")}
              >
                <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                Find Universities
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-50 border-slate-200 text-slate-600 text-[11px] rounded-full hover:bg-slate-100"
                onClick={() => handleQuickAction("Tell me about government schemes")}
              >
                <MessageSquare className="h-3 w-3 mr-1 text-emerald-500" />
                Gov Schemes
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-50 border-slate-200 text-slate-600 text-[11px] rounded-full hover:bg-slate-100"
                onClick={() => handleQuickAction("Find nearest hospitals")}
              >
                <Activity className="h-3 w-3 mr-1 text-purple-500" />
                Nearest Hospitals
              </Button>
            </div>
            <div className="flex w-full items-center space-x-2 relative">
              <div className="relative flex-grow">
                <Input
                  className="pr-12 py-6 rounded-xl border-gray-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-gray-50/50"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </div>
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 w-12 flex items-center justify-center p-0 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-center text-gray-400">
              Awam Assist AI can make mistakes. Verify important info.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIChatbot;
