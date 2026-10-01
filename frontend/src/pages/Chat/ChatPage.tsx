
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChatPage.css';
import { User, Sparkles } from 'lucide-react';
import { sendChatMessage, saveThread, getThread } from '../../api/chatApi';
import SignedInNavbar from '../../components/Navbar/SignedInNavbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getUserEmail, signOut } from '../../utils/authUtils';

// Typing indicator component
const TypingIndicator = () => (
    <div className="message bot">
        <div className="message-content">
            <div className="message-avatar">
                <Sparkles size={20} />
            </div>
            <div className="message-bubble typing-bubble">
                <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    </div>
);

export default function ChatInterface() {
    const { email: routeEmail, threadId } = useParams();
    const navigate = useNavigate();

    // Sign out handler for navbar
    const handleSignOut = () => {
        void signOut();
    };

    const [messages, setMessages] = useState<{ text: string; sender: string; id: number }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // ProtectedLayout has already checked the backend session and stored its account.
    useEffect(() => {
        let cancelled = false;
        const email = getUserEmail();
        if (!email) {
            navigate('/', { replace: true });
        } else if (!threadId || routeEmail !== email) {
            navigate(`/chat/${encodeURIComponent(email)}/${crypto.randomUUID()}`, { replace: true });
        } else {
            getThread(email, threadId)
                .then(data => {
                    if (!cancelled) setMessages(data.messages);
                })
                .catch(() => {
                    if (!cancelled) setMessages([]);
                });
        }
        return () => { cancelled = true; };
    }, [routeEmail, threadId, navigate]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [input]);

    // Auto-scroll to bottom when messages change or loading state changes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async () => {
        if (!input.trim()) return;
        // Use params or fallback
        const effectiveEmail = routeEmail || localStorage.getItem('user_email');

        const userMsg = { text: input, sender: 'user', id: Date.now() };
        // Optimistic update
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Pass threadId if available
            const data = await sendChatMessage(input, 'supervisor', effectiveEmail, threadId);
            // handle both wellness (response) and supervisor (summary) formats
            const replyText =
                data?.response || data?.summary || data?.reply || 'Unexpected response from AI';

            const botMsg = { text: replyText, sender: 'bot', id: Date.now() + 1 };
            const finalMessages = [...updatedMessages, botMsg];

            setMessages(finalMessages);

            // Persist thread
            if (effectiveEmail && threadId) {
                await saveThread(effectiveEmail, threadId, finalMessages, "Conversation");
            }
        } catch {
            const errorMsg = { text: 'Error connecting to AI', sender: 'bot', id: Date.now() + 1 };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <>
            <SignedInNavbar onSignOut={handleSignOut} />
            <div className="chat-container">
                <div className="messages-container" ref={messagesContainerRef}>
                    {messages.length === 0 && !isLoading ? (
                        <div className="empty-state">
                            <div className="empty-icon-wrapper">
                                <Sparkles size={48} className="empty-sparkle" />
                            </div>
                            <h2>How can I help you today?</h2>
                            <p>Start a conversation by typing a message below</p>
                            <div className="suggestion-chips">
                                <button className="suggestion-chip" onClick={() => setInput('Summarize my emails')}>📧 Summarize my emails</button>
                                <button className="suggestion-chip" onClick={() => setInput('How is my wellness today?')}>💪 Check my wellness</button>
                                <button className="suggestion-chip" onClick={() => setInput('What tasks do I have?')}>📋 Show my tasks</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message ${msg.sender}`}>
                                    <div className="message-content">
                                        <div className="message-avatar">
                                            {msg.sender === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                                        </div>
                                        <div className="message-bubble">
                                            {msg.sender === 'bot' ? (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.text}
                                                </ReactMarkdown>
                                            ) : (
                                                msg.text
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </>
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
                            disabled={!input.trim() || isLoading}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                style={{ zIndex: 20, position: 'relative', display: 'block' }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
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
        </>
    );
}
