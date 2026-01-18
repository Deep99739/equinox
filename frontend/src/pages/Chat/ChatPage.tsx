import React, { useState, useRef, useEffect } from 'react';
import './ChatPage.css';

export default function ChatInterface() {
    const [messages, setMessages] = useState<{ text: string; sender: string; id: number }[]>([]);
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [input]);

    const handleSubmit = async () => {
        if (!input.trim()) return;
        const PORT = import.meta.env.REACT_APP_BACKEND_PORT || '8000';
        const userMsg = { text: input, sender: 'user', id: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const res = await fetch(`http://localhost:${PORT}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });

            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }

            const data = await res.json();
            const replyText =
                data && typeof (data as any).reply === 'string'
                    ? (data as any).reply
                    : 'Unexpected response from AI';

            setMessages(prev => [...prev, { text: replyText, sender: 'bot', id: Date.now() }]);
        } catch {
            setMessages(prev => [...prev, { text: 'Error connecting to AI', sender: 'bot', id: Date.now() }]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="chat-container">
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <h2>How can I help you today?</h2>
                        <p>Start a conversation by typing a message below</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.sender}`}>
                            <div className="message-content">
                                <div className="message-avatar">
                                    {msg.sender === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="input-section">
                <div className="input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message Equinox..."
                        className="chat-input"
                        rows={1}
                    />
                    <button 
                        onClick={handleSubmit} 
                        className="send-button"
                        disabled={!input.trim()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    </button>
                </div>
                <div className="input-footer">
                    <button className="footer-button">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12l2 2 4-4" />
                        </svg>
                        Add Agents
                    </button>
                    <div className="footer-info">
                        Equinox can make mistakes. Please verify important information.
                    </div>
                </div>
            </div>
        </div>
    );
}