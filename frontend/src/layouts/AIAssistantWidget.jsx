import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, Trash2, Loader2, ArrowRight } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am the Skillbrix AI Dashboard Assistant. Ask me any analytical question about student results, averages, or departments.",
      suggestions: [
        "Show CSE students who failed",
        "What is the average score of all exams?",
        "List all students in the CSE department"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: text
    };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput("");

    setLoading(true);
    try {
      const res = await api.post("/analytics/assistant", { query: text });
      const replyData = res.data.data;
      
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: replyData.answer,
        columns: replyData.columns || null,
        rows: replyData.rows || null,
        chartType: replyData.chartType || null,
        chartData: replyData.chartData || null
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      toast.error("Failed to query AI Assistant.");
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "I encountered an error querying the analytics database. Please check your network and try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "Hello! I am the Skillbrix AI Dashboard Assistant. Ask me any analytical question about student results, averages, or departments.",
        suggestions: [
          "Show CSE students who failed",
          "What is the average score of all exams?",
          "List all students in the CSE department"
        ]
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-8rem)] bg-slate-900 border border-slate-805 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h3>
                <p className="text-[10px] text-violet-100">Live Database Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleClear}
                type="button"
                title="Clear Chat"
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                type="button"
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-slate-950/40">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[90%] rounded-2xl p-3 text-sm leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-violet-600 text-white rounded-tr-none" 
                    : "bg-slate-900 border border-slate-800/80 text-slate-100 rounded-tl-none space-y-3"
                }`}>
                  <p>{msg.text}</p>

                  {/* Render Table Data if available */}
                  {msg.columns && msg.rows && msg.rows.length > 0 && (
                    <div className="overflow-x-auto border border-slate-800 rounded-lg mt-3 bg-slate-950/40 max-w-full">
                      <table className="w-full text-left text-[11px] border-collapse min-w-[280px]">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/50">
                            {msg.columns.map((col, i) => (
                              <th key={i} className="px-2.5 py-2 font-bold text-slate-400">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {msg.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-slate-900 last:border-0 hover:bg-slate-900/30">
                              {row.map((val, cIdx) => (
                                <td key={cIdx} className="px-2.5 py-2 text-slate-300 font-medium">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Render Custom CSS Charts */}
                  {msg.chartType === "BAR" && msg.chartData && msg.chartData.length > 0 && (
                    <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl mt-3 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Performance Chart</p>
                      <div className="space-y-2">
                        {msg.chartData.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                              <span>{item.label}</span>
                              <span className="font-bold text-slate-200">{item.value}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                              <div 
                                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.chartType === "PIE" && msg.chartData && msg.chartData.length > 0 && (
                    <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Distribution Summary</p>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {msg.chartData.map((item, idx) => {
                          const colors = ["bg-violet-500", "bg-fuchsia-500", "bg-pink-500", "bg-indigo-500"];
                          const color = colors[idx % colors.length];
                          return (
                            <div key={idx} className="flex items-center gap-2 p-1.5 bg-slate-900/60 rounded border border-slate-800/30">
                              <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                              <div className="truncate">
                                <p className="text-slate-400 font-semibold truncate">{item.label}</p>
                                <p className="font-black text-slate-200">{item.value}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions List */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(sug)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-violet-400 hover:text-violet-300 rounded-lg flex items-center gap-1 transition-all text-left"
                      >
                        {sug} <ArrowRight size={10} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
                <Loader2 size={14} className="animate-spin text-violet-500" />
                <span>AI is analyzing database query...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900/90 border-t border-slate-800 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Ask Assistant: CSE pass rate, failures..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="w-14 h-14 bg-gradient-to-tr from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-500/25 transition-all duration-300 hover:scale-105 active:scale-95 relative group"
      >
        <span className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping group-hover:hidden duration-1000" />
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
      </button>
    </div>
  );
};
export default AIAssistantWidget;
