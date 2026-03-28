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

  // ==========================================
  // SMART TEXT FORMATTER: Converts AI Markdown into Beautiful React Elements!
  // ==========================================
  const formatMessage = (text) => {
    // 1. Regex to find markdown links: [Text](/url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Push text before the link
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Push the extracted Link as a Beautiful Button
      parts.push(
        <a 
          key={match.index} 
          href={match[2]} 
          className="inline-block mt-3 mb-1 bg-white text-[#2872A1] px-5 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase border-2 border-[#2872A1] hover:bg-[#2872A1] hover:text-white transition-all shadow-sm"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    
    // Push remaining text after the last link
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // 2. Loop through all the parts and format **Bold** text
    return parts.map((part, i) => {
      if (typeof part === 'string') {
        const boldSplit = part.split(/(\*\*.*?\*\*)/g);
        return (
          <span key={i}>
            {boldSplit.map((bPart, j) => {
              if (bPart.startsWith('**') && bPart.endsWith('**')) {
                // Return bolded text
                return <strong key={j} className="text-gray-900 font-extrabold">{bPart.slice(2, -2)}</strong>;
              }
              // Return normal text
              return <span key={j}>{bPart}</span>;
            })}
          </span>
        );
      }
      return part; // Return the button component
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white w-[380px] h-[550px] rounded-[2rem] shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1f5a80] to-[#2872A1] p-5 text-white flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><Bot className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold text-base tracking-wide">AuraLive Assistant</h3>
                  <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-5 overflow-y-auto bg-gray-50 flex flex-col gap-5 custom-scrollbar">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-1 ${msg.sender === 'user' ? 'bg-[#CBDDE9] text-[#2872A1]' : 'bg-[#2872A1] text-white shadow-md'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  {/* whitespace-pre-wrap ensures newlines (Enters) are rendered properly! */}
                  <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-[#2872A1] text-white rounded-br-sm shadow-md' 
                      : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm shadow-sm'
                  }`}>
                    {formatMessage(msg.text)}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2872A1] text-white flex items-center justify-center shrink-0 mb-1 shadow-md"><Bot className="w-4 h-4" /></div>
                  <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-[#CBDDE9] rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[#CBDDE9] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-[#CBDDE9] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask about a room..." 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#2872A1] focus:bg-white transition-all font-medium"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-[#2872A1] text-white p-3 rounded-full hover:bg-[#1f5a80] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              >
                <Send className="w-5 h-5 ml-1 mr-0.5" />
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
          className="bg-[#2872A1] text-white p-4 rounded-full shadow-xl shadow-[#2872A1]/40 hover:shadow-2xl transition-all flex items-center gap-3 group border-4 border-white"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold text-sm pr-1">
            Chat with Aura!
          </span>
        </motion.button>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBDDE9; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Chatbot;