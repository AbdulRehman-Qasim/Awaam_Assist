import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [userName, setUserName] = useState('');
    const messagesEndRef = useRef(null);

    // Initialize socket and user
    useEffect(() => {
        // Get user from local storage
        const storedUser = localStorage.getItem('user');
        let name = 'Guest';
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                name = parsed.data?.student_name || parsed.data?.name || parsed.admin_name || 'User';
            } catch (e) {
                console.error("Error parsing user", e);
            }
        }
        setUserName(name);

        // Connect to backend
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://awaam-assist.onrender.com', {
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            timeout: 5000,
        });
        setSocket(newSocket);

        // Listen for incoming messages
        newSocket.on('receiveMessage', (message) => {
            setMessages((prev) => [...prev, message]);
            if (!isOpen) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        // Listen for previous messages history
        newSocket.on('previousMessages', (history) => {
            setMessages(history);
        });

        return () => { newSocket.close(); };
    }, [isOpen]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket) {
            const messageData = {
                sender: userName,
                content: newMessage,
                timestamp: new Date(),
            };

            // Emit to server
            socket.emit('sendMessage', messageData);
            setNewMessage('');
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Reset unread count when opened
            setUnreadCount(0);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 ring-1 ring-black/5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
                        <h3 className="font-semibold flex items-center">
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Community Chat
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleChat}
                            className="h-8 w-8 text-white hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        <div className="space-y-4">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender === userName;
                                return (
                                    <div
                                        key={index}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`flex items-baseline space-x-2 mb-1 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                                            <span className="text-xs font-semibold text-gray-600">{msg.sender}</span>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div
                                            className={`px-4 py-2.5 max-w-[85%] break-words shadow-sm text-sm ${isMe
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl rounded-br-none shadow-blue-500/20'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none shadow-sm'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex space-x-2 items-center">
                        <div className="flex-1 relative">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full pr-4 py-5 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-full transition-all duration-200 shadow-inner"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            className={`rounded-full h-10 w-10 shadow-lg transition-transform hover:scale-105 active:scale-95 ${newMessage.trim()
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                }`}
                            disabled={!newMessage.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <Button
                    onClick={toggleChat}
                    className="h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white px-6 flex items-center space-x-2 transition-transform hover:scale-105"
                >
                    <div className="relative">
                        <MessageCircle className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <span className="font-semibold text-lg">Messaging</span>
                    {unreadCount > 0 && (
                        <span className="bg-blue-700 px-2 py-0.5 rounded text-xs ml-2">
                            {unreadCount} New
                        </span>
                    )}
                </Button>
            )}
        </div>
    );
};

export default ChatWidget;
