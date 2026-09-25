import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const AIChatbot: React.FC = () => {
  const { t, currentLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const getWelcomeText = (lang: string) => {
    if (lang === 'hi') {
      return "नमस्ते! मैं लाइफलिंक क्लीनिकल एआई सहायक हूँ। आप रक्तदान पात्रता, अंतराल या प्लेटफॉर्म के बारे में मुझसे कोई भी सवाल पूछ सकते हैं।";
    }
    if (lang === 'mr') {
      return "नमस्कार! मी लाइफलिंक क्लिनिकल एआय सहाय्यक आहे. तुम्ही रक्तदान पात्रता, अंतर किंवा प्लॅटफॉर्मबद्दल मला कोणताही प्रश्न विचारू शकता.";
    }
    return "Hello! I am your LifeLink Clinical AI Assistant. Ask me anything regarding donation eligibility, interval guidelines, or platform navigation.";
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
  const latestMessageRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll logic on new messages
  useEffect(() => {
    if (!isOpen || messages.length <= 1) return;

    const lastMessage = messages[messages.length - 1];

    const frameId = requestAnimationFrame(() => {
      if (lastMessage.sender === 'user') {
        latestUserMessageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else if (lastMessage.sender === 'bot') {
        const container = messagesContainerRef.current;
        const userEl = latestUserMessageRef.current;
        const botEl = latestMessageRef.current;

        if (container && userEl && botEl) {
          const pairHeight = (botEl.offsetTop + botEl.offsetHeight) - userEl.offsetTop;
          if (pairHeight <= container.clientHeight) {
            userEl.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          } else {
            botEl.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest'
            });
          }
        } else {
          latestMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [messages, isOpen]);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Generate intelligent response based on keywords
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let botResponse = '';

      if (lower.includes('tattoo') || lower.includes('टैटू') || lower.includes('टॅटू')) {
        if (currentLanguage === 'hi') {
          botResponse = "टैटू या पियर्सिंग के बाद आपको रक्तदान करने से पहले 6 महीने का इंतजार करना अनिवार्य है, ताकि किसी भी संभावित संक्रमण से बचाव हो सके।";
        } else if (currentLanguage === 'mr') {
          botResponse = "टॅटू किंवा पियर्सिंगनंतर रक्तदान करण्यापूर्वी किमान 6 महिने थांबणे अनिवार्य आहे, जेणेकरून कोणत्याही संसर्गाचा धोका टाळता येईल.";
        } else {
          botResponse = "You must wait at least 6 months after getting a tattoo or body piercing before donating blood, per National Blood Transfusion Council guidelines.";
        }
      } else if (lower.includes('interval') || lower.includes('gap') || lower.includes('अंतराल') || lower.includes('अंतर') || lower.includes('days')) {
        if (currentLanguage === 'hi') {
          botResponse = "होल ब्लड (Whole Blood) के लिए पुरुषों को 90 दिन और महिलाओं को 120 दिन का अंतर रखना होता है। प्लेटलेट्स (Platelets) दान के लिए न्यूनतम अंतर केवल 14 दिन है।";
        } else if (currentLanguage === 'mr') {
          botResponse = "होल ब्लड (Whole Blood) साठी पुरुषांना 90 दिवस आणि स्त्रियांना 120 दिवसांचे अंतर ठेवावे लागते. प्लेटलेट्स (Platelets) दानासाठी किमान अंतर फक्त 14 दिवस आहे.";
        } else {
          botResponse = "The mandatory interval for Whole Blood is 90 days for men and 120 days for women. For Platelets (apheresis), the interval is just 14 days!";
        }
      } else if (lower.includes('o-') || lower.includes('o negative') || lower.includes('universal') || lower.includes('नेगेटिव') || lower.includes('निगेटिव्ह')) {
        if (currentLanguage === 'hi') {
          botResponse = "O-नेगेटिव (O-) 'यूनिवर्सल रेड सेल डोनर' है। यह रक्त किसी भी अन्य ब्लड ग्रुप (A+, B+, AB+, O+) के मरीज को आपात स्थिति में दिया जा सकता है।";
        } else if (currentLanguage === 'mr') {
          botResponse = "O-निगेटिव्ह (O-) 'युनिव्हर्सल रेड सेल डोनर' आहे. आपत्कालीन परिस्थितीत कोणत्याही रक्तगटाच्या (A+, B+, AB+, O+) रुग्णाला हे रक्त सुरक्षितपणे दिले जाऊ शकते.";
        } else {
          botResponse = "O-Negative is the Universal Red Cell Donor! It can be safely transfused to patients of any blood group in critical trauma emergencies.";
        }
      } else if (lower.includes('weight') || lower.includes('age') || lower.includes('वजन') || lower.includes('उम्र') || lower.includes('वय')) {
        if (currentLanguage === 'hi') {
          botResponse = "रक्तदान के लिए आयु 18 से 65 वर्ष के बीच होनी चाहिए, और न्यूनतम वजन 45 किलोग्राम होना चाहिए। हीमोग्लोबिन स्तर न्यूनतम 12.5 g/dL होना आवश्यक है।";
        } else if (currentLanguage === 'mr') {
          botResponse = "रक्तदानासाठी वय 18 ते 65 वर्षे आणि किमान वजन 45 किलो असणे आवश्यक आहे. हिमोग्लोबिनची पातळी किमान 12.5 g/dL असावी लागते.";
        } else {
          botResponse = "Donors must be between 18 and 65 years old, weigh at least 45 kg (50 kg for platelets), and have a minimum hemoglobin level of 12.5 g/dL.";
        }
      } else if (lower.includes('escalat') || lower.includes('sla') || lower.includes('एस्केलेशन')) {
        if (currentLanguage === 'hi') {
          botResponse = "आपातकालीन अनुरोध 3 स्तरों में जाता है: स्तर 1 (10 किमी के भीतर के दाता), स्तर 2 (शहर-व्यापी दाता), और स्तर 3 (पार्टनर ब्लड बैंक रिजर्व)। यदि 45 सेकंड में प्रतिक्रिया नहीं मिलती, तो सिस्टम स्वतः अगले स्तर पर चला जाता है।";
        } else if (currentLanguage === 'mr') {
          botResponse = "आपत्कालीन विनंती 3 टप्प्यांत जाते: स्तर 1 (10 किमी अंतरातील दाते), स्तर 2 (शहरव्यापी दाते), आणि स्तर 3 (पार्टनर रक्तपेढी साठा). 45 सेकंदात प्रतिसाद न मिळाल्यास, सिस्टीम स्वयंचलितपणे पुढील टप्प्यावर जाते.";
        } else {
          botResponse = "LifeLink uses automated 3-tier escalation: Tier 1 (Nearby Donors <10km) -> Tier 2 (City-wide Donors) -> Tier 3 (Partner Blood Bank Stock). If unfulfilled within the SLA window, failover occurs automatically.";
        }
      } else {
        if (currentLanguage === 'hi') {
          botResponse = "धन्यवाद! एक स्वस्थ वयस्क (18-65 वर्ष, >45kg) हर 3 महीने में सुरक्षित रक्तदान कर सकता है। आप अपने नजदीकी रक्तदान शिविर देखने के लिए एनजीओ या पब्लिक डैशबोर्ड देख सकते हैं।";
        } else if (currentLanguage === 'mr') {
          botResponse = "धन्यवाद! एक निरोगी प्रौढ (वय 18-65, वजन >45kg) दर 3 महिन्यांनी सुरक्षित रक्तदान करू शकतो. आपल्या जवळील रक्तदान शिबिरे पाहण्यासाठी तुम्ही एनजीओ किंवा पब्लिक डॅशबोर्ड पाहू शकता.";
        } else {
          botResponse = "Healthy adults aged 18–65 weighing over 45 kg with normal BP and Hb >= 12.5 can safely donate blood. Every donation can save up to 3 lives!";
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 500);
  };

  return (
    <>
      <button
        type="button"
        className="chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
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
              flex: 1, 
              padding: '1rem', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem', 
              background: 'var(--bg-main)' 
            }}
          >
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              const isLatestUser = msg.sender === 'user' && (
                index === messages.length - 1 || 
                (index === messages.length - 2 && messages[messages.length - 1].sender === 'bot')
              );

              return (
                <div
                  key={msg.id}
                  ref={el => {
                    if (isLast) {
                      latestMessageRef.current = el;
                    }
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
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.83rem',
                    lineHeight: '1.4',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {msg.text}
                  <span style={{
                    display: 'block',
                    fontSize: '0.68rem',
                    color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)',
                    marginTop: '0.25rem',
                    textAlign: 'right'
                  }}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
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
                onClick={() => handleSend(q)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 600
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
              onChange={e => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ marginLeft: '0.5rem', padding: '0.5rem 0.8rem' }}
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

