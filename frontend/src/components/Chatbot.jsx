import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am the AuraLive Assistant. Looking for a room? Just ask me!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', { message: userMsg });
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting to the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-[#2872A1] p-4 text-white flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg"><Bot className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-sm">AuraLive Assistant</h3>
                  <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4 custom-scrollbar">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-[#CBDDE9] text-[#2872A1]' : 'bg-[#2872A1] text-white'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#2872A1] text-white rounded-tr-none' 
                      : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2872A1] text-white flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask about a room..." 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#2872A1] transition-colors"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-[#2872A1] text-white p-2.5 rounded-full hover:bg-[#1f5a80] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-[#2872A1] text-white p-4 rounded-full shadow-2xl hover:shadow-[#CBDDE9] transition-all flex items-center gap-2 group"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold text-sm">
            Ask AI Assistant
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default Chatbot;