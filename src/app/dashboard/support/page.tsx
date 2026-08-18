'use client';

import React, { useState, useEffect } from 'react';
import { supportApi, SupportTicket } from '@/lib/api/support';
import { MessageSquare, Clock, Plus, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function StudentSupportPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // New ticket modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Reply state
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      fetchTickets();
    }
  }, [user, authLoading]);

  const fetchTickets = async () => {
    try {
      const data = await supportApi.getMyTickets();
      setTickets(data);
      if (data.length > 0 && !activeTicketId) {
        setActiveTicketId(data[0].id);
      }
    } catch (err) {
      toast.error('Failed to load your support tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    try {
      await supportApi.createTicket(newSubject.trim(), newMessage.trim());
      setNewSubject('');
      setNewMessage('');
      setIsNewModalOpen(false);
      toast.success('Support ticket created successfully');
      fetchTickets();
    } catch (err) {
      toast.error('Failed to create ticket');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !activeTicketId) return;
    try {
      await supportApi.addMessage(activeTicketId, replyText.trim());
      setReplyText('');
      fetchTickets();
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  if (isLoading || authLoading) {
    return <div className="p-8 text-center animate-pulse text-slate-400">Loading support portal...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Support & Help</h1>
          <p className="text-slate-500 font-medium mt-1">Contact our support team for any issues with your account or courses.</p>
          <p className="text-slate-500 font-medium mt-1 text-sm">We typically respond within 24–48 business hours. For urgent issues: <a href="mailto:emberquest1@gmail.com" className="text-blue-600 hover:underline">emberquest1@gmail.com</a></p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Ticket
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-[600px]">
        {/* Left column - Ticket List */}
        <div className="w-full md:w-1/3 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-900 dark:text-slate-50">Your Tickets</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {tickets.length > 0 ? tickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setActiveTicketId(ticket.id)}
                className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-colors ${activeTicketId === ticket.id ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm font-bold truncate ${activeTicketId === ticket.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-slate-50'}`}>
                    {ticket.subject}
                  </h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0 ${
                    ticket.status === 'open' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    ticket.status === 'pending' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    {ticket.status === 'open' ? 'Under Review' : ticket.status === 'pending' ? 'Action Required' : 'Resolved'}
                  </span>
                </div>
                <div className="flex items-center text-xs text-slate-500 gap-1 mt-2">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm font-bold">You have no support tickets.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Ticket Chat */}
        <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {activeTicket ? (
            <>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">{activeTicket.subject}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Ticket ID: #{activeTicket.id.substring(0,8).toUpperCase()}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/50 custom-scrollbar">
                {activeTicket.messages?.map((msg) => {
                  const isMe = msg.sender.id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm'
                      }`}>
                        <div className={`text-xs font-bold mb-1 opacity-70 flex items-center gap-1.5 ${isMe ? 'justify-end' : ''}`}>
                          {isMe ? 'You' : 'Support Agent'}
                          <Clock className="w-3 h-3" />
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeTicket.status !== 'resolved' ? (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900">
                  <div className="flex gap-3">
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-14"
                    />
                    <button 
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl px-6 font-bold transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 text-center text-sm font-bold text-slate-500">
                  This ticket has been resolved.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
              <p className="font-bold text-lg">Select a ticket</p>
              <p className="text-sm mt-1">Choose a ticket from the list or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/50">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-50">Create Support Ticket</h2>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Briefly describe your issue..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Provide details about your issue..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                />
              </div>
              <button 
                onClick={handleCreateTicket}
                disabled={!newSubject.trim() || !newMessage.trim()}
                className="w-full flex items-center justify-center py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
