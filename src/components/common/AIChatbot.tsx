import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { generateAIChatResponse, ChatHistoryItem } from '../../services/aiService';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

/**
 * FIX 3: Formats markdown in messages without showing raw asterisks.
 * Converts **bold** into <strong>, bullet asterisks into clean lists,
 * and handles paragraphs cleanly.
 */
interface FormattedChatTextProps {
  text: string;
  isUser: boolean;
}

const FormattedChatText: React.FC<FormattedChatTextProps> = ({ text, isUser }) => {
  if (isUser) {
    return <span style={{ whiteSpace: 'pre-line' }}>{text}</span>;
  }

  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="chat-markdown-body">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();

        // Empty line spacer
        if (!line) {
          return <div key={idx} style={{ height: '0.35rem' }} />;
        }

        // Bullet list check: starts with "* ", "- ", "• ", or "1. "
        const bulletMatch = line.match(/^([*\-•]|\d+\.)\s+(.+)$/);
        if (bulletMatch) {
          const bulletContent = bulletMatch[2];
          return (
            <div key={idx} className="chat-markdown-bullet">
              <span className="chat-markdown-bullet-icon">•</span>
              <span style={{ flex: 1 }}>{renderInlineTokens(bulletContent)}</span>
            </div>
          );
        }

        // Heading check: ### or ## or #
        const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
        if (headingMatch) {
          return (
            <div 
              key={idx} 
              style={{ 
                fontWeight: 700, 
                fontSize: '0.92rem', 
                color: 'var(--primary-navy)', 
                marginTop: idx > 0 ? '0.35rem' : 0, 
                marginBottom: '0.2rem' 
              }}
            >
              {renderInlineTokens(headingMatch[2])}
            </div>
          );
        }

        // Regular line
        return (
          <div key={idx} style={{ marginBottom: '0.25rem' }}>
            {renderInlineTokens(line)}
          </div>
        );
      })}
    </div>
  );
};

function renderInlineTokens(text: string): React.ReactNode[] {
  if (!text) return [];

  // Tokenize **bold**, __bold__, *italic*, `code`
  const tokens = text.split(/(\*\*.*?\*\*|__.*?__|`.*?`|\*.*?\*)/g);

  return tokens.map((token, i) => {
    if (!token) return null;

    // Bold with **text** or __text__
    if ((token.startsWith('**') && token.endsWith('**') && token.length >= 4) || 
        (token.startsWith('__') && token.endsWith('__') && token.length >= 4)) {
      const inner = token.slice(2, -2);
      return <strong key={i} style={{ fontWeight: 700, color: 'inherit' }}>{inner}</strong>;
    }

    // Code with `text`
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      const inner = token.slice(1, -1);
      return (
        <code key={i} style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.85em' }}>
          {inner}
        </code>
      );
    }

    // Italic with *text*
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      const inner = token.slice(1, -1);
      return <em key={i} style={{ fontStyle: 'italic' }}>{inner}</em>;
    }

    return token;
  });
}

export const AIChatbot: React.FC = () => {
  const { t, currentLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // FIX 1: Subtle attention animation that stops once opened, persisted across the session
  const [hasInteracted, setHasInteracted] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('lifelink_chatbot_interacted') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleOpen = () => {
    if (!isOpen) {
      setHasInteracted(true);
      try {
        sessionStorage.setItem('lifelink_chatbot_interacted', 'true');
      } catch (e) {
        // Storage failover
      }
    }
    setIsOpen(!isOpen);
  };
  
  const getWelcomeText = (lang: string) => {
    if (lang === 'hi') {
      return "नमस्ते! मैं लाइफलिंक क्लीनिकल एआई सहायक हूँ। आप रक्तदान पात्रता, अंतराल या रक्त स्वास्थ्य के बारे में मुझसे कोई भी सवाल पूछ सकते हैं।";
    }
    if (lang === 'mr') {
      return "नमस्कार! मी लाइफलिंक क्लिनिकल एआय सहाय्यक आहे. तुम्ही रक्तदान पात्रता, अंतर किंवा रक्त आरोग्याबद्दल मला कोणताही प्रश्न विचारू शकता.";
    }
    return "Hello! I am your LifeLink Clinical AI Assistant. Ask me anything regarding donation eligibility, interval guidelines, or blood health.";
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'bot',
      text: getWelcomeText(currentLanguage),
      timestamp: 'Just now'
    }
  ]);

  // Synchronize initial welcome message when user switches language without chat activity
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'msg-0') {
        return [{ ...prev[0], text: getWelcomeText(currentLanguage) }];
      }
      return prev;
    });
  }, [currentLanguage]);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const latestUserMessageRef = useRef<HTMLDivElement | null>(null);

  // Identify the latest user question ID
  const latestUserMsgId = [...messages].reverse().find(m => m.sender === 'user')?.id;

  // BUG 2 FIX: Auto-scroll so the latest user question is anchored near top of visible chat area
  useEffect(() => {
    if (!isOpen || messages.length <= 1) return;

    // Wait slightly for DOM, buffering animation, and markdown to finish layout
    const scrollTimer = setTimeout(() => {
      const container = messagesContainerRef.current;
      const userEl = latestUserMessageRef.current;
      if (!container || !userEl) return;

      const targetScroll = userEl.offsetTop - 12;
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      } else {
        userEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 50);

    return () => clearTimeout(scrollTimer);
  }, [messages, isLoading, isOpen]);

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    const history: ChatHistoryItem[] = updatedMessages.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      text: m.text
    }));

    try {
      const botResponse = await generateAIChatResponse(userText, history, currentLanguage);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.warn('AI chatbot response error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: currentLanguage === 'hi' 
            ? "माफ़ कीजिए, उत्तर प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।"
            : currentLanguage === 'mr'
            ? "क्षमस्व, उत्तर मिळवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा."
            : "I am ready to assist. Please ask any question about blood donation eligibility, hemoglobin, RBC levels, or platform guidelines.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FIX 1: Subtle Gemini-like attention pulse until user first opens the chatbot */}
      <button
        type="button"
        className={`chatbot-trigger ${!hasInteracted && !isOpen ? 'chatbot-pulse-attention' : ''}`}
        onClick={handleToggleOpen}
        aria-label="Open LifeLink Clinical AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className="chatbot-panel">
          {/* Header in Primary Navy Blue */}
          <div style={{
            background: 'var(--primary-navy)',
            padding: '0.85rem 1rem',
            borderBottom: '1px solid var(--primary-navy-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#FFFFFF'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-navy)'
              }}>
                <Bot size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF' }}>{t.chatbot.title}</div>
                <span style={{ fontSize: '0.72rem', color: '#90CAF9', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ● {t.chatbot.subtitle}
                </span>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} style={{ color: '#E3F2FD' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            style={{ 
              position: 'relative',
              flex: 1, 
              padding: '1rem', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem', 
              background: 'var(--bg-main)' 
            }}
          >
            {messages.map((msg) => {
              const isLatestUser = msg.id === latestUserMsgId;

              return (
                <div
                  key={msg.id}
                  ref={el => {
                    if (isLatestUser) {
                      latestUserMessageRef.current = el;
                    }
                  }}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.sender === 'user' ? 'var(--secondary-blue)' : 'var(--bg-card)',
                    color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                    padding: '0.7rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.86rem',
                    lineHeight: '1.45',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* FIX 3: Render formatted markdown without raw asterisks */}
                  <FormattedChatText text={msg.text} isUser={msg.sender === 'user'} />
                  
                  <span style={{
                    display: 'block',
                    fontSize: '0.68rem',
                    color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)',
                    marginTop: '0.3rem',
                    textAlign: 'right'
                  }}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* FIX 2: Continuous video-buffering style animation & wave pattern */}
            {isLoading && (
              <div className="chatbot-buffering-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="buffering-dots" aria-hidden="true">
                    <span className="buffering-dot" />
                    <span className="buffering-dot" />
                    <span className="buffering-dot" />
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {currentLanguage === 'hi'
                      ? 'लाइफलिंक एआई विश्लेषण कर रहा है...'
                      : currentLanguage === 'mr'
                      ? 'लाइफलिंक एआई विश्लेषण करत आहे...'
                      : 'LifeLink AI is analyzing...'}
                  </span>
                </div>

                {/* Video-buffering indeterminate sliding beam */}
                <div className="buffering-track">
                  <div className="buffering-bar" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions Pill Bar */}
          <div style={{ 
            padding: '0.45rem 0.75rem', 
            background: 'var(--bg-subtle)', 
            borderTop: '1px solid var(--border-subtle)', 
            overflowX: 'auto', 
            display: 'flex', 
            gap: '0.4rem', 
            whiteSpace: 'nowrap' 
          }}>
            {t.chatbot.suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSend(q)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend(input);
            }}
            style={{
              display: 'flex',
              padding: '0.6rem 0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)'
            }}
          >
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)' }}
              placeholder={t.chatbot.askPlaceholder}
              value={input}
              disabled={isLoading}
              onChange={e => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ marginLeft: '0.5rem', padding: '0.5rem 0.8rem', opacity: isLoading ? 0.7 : 1 }}
              disabled={isLoading || !input.trim()}
              aria-label={t.chatbot.send}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
