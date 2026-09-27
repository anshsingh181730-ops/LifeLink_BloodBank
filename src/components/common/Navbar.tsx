import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleSimulator } from './RoleSimulator';
import { Droplet, Languages, AlertCircle, Sparkles, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../services/i18n';

export const Navbar: React.FC = () => {
  const { currentLanguage, setLanguage, setIsEmergencyModalOpen, t, switchRole } = useApp();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLangOption = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      <header className="navbar">
        <div className="nav-brand" onClick={() => switchRole('public')}>
          <div className="brand-icon">
            <Droplet size={20} fill="#FFFFFF" />
          </div>
          <div>
            <div className="brand-title">Life<span>Link</span></div>
            <span className="brand-sub">Unified Blood Coordination</span>
          </div>
        </div>

        <div className="nav-right-group">
          <RoleSimulator />

          <div className="nav-controls">
            {/* Multi-language Dropdown Switcher */}
            <div className="lang-dropdown-wrapper" ref={langRef}>
              <button 
                type="button" 
                className="lang-dropdown-btn"
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label={t.nav.language}
                aria-expanded={isLangOpen}
                title={t.nav.language}
              >
                <Languages size={15} />
                <span>{activeLangOption.nativeLabel}</span>
                <ChevronDown size={13} style={{ transform: isLangOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {isLangOpen && (
                <div className="lang-dropdown-menu">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`lang-dropdown-item ${currentLanguage === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                    >
                      <span className="lang-native">{lang.nativeLabel}</span>
                      <span className="lang-english">({lang.label})</span>
                      {currentLanguage === lang.code && <Check size={14} className="lang-check" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Emergency SOS Button */}
            <button
              type="button"
              className="btn-emergency-sos"
              onClick={() => setIsEmergencyModalOpen(true)}
              title="Immediate emergency blood request"
            >
              <AlertCircle size={17} />
              <span>{t.emergency.sos}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="disclaimer-strip">
        <span>
          <Sparkles size={14} color="#F59E0B" />
          <strong>PROTOTYPE NOTICE:</strong> {t.nav.auditDisclaimer} (Aadhaar/ABHA & ML Forecasting are simulated for UX review).
        </span>
        <span className="disclaimer-badge">Phase 1–4 UX Demo</span>
      </div>
    </>
  );
};

