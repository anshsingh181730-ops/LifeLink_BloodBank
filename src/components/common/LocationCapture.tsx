import React, { useState } from 'react';
import { Location } from '../../types';
import { 
  captureBrowserLocation, 
  geocodeAddressNominatim, 
  GeocodeSuggestion 
} from '../../services/locationService';
import { 
  MapPin, Navigation, Search, Check, AlertCircle, 
  Loader2, Compass, CheckCircle2 
} from 'lucide-react';

interface LocationCaptureProps {
  value: Location;
  onChange: (location: Location) => void;
  label?: string;
  placeholder?: string;
}

export const LocationCapture: React.FC<LocationCaptureProps> = ({
  value,
  onChange,
  label = 'Location & Destination Pin',
  placeholder = 'Search hospital, address, or landmark in your city...'
}) => {
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Trigger browser Geolocation API
  const handleShareLocation = async () => {
    setIsDetecting(true);
    setErrorMessage(null);
    try {
      const res = await captureBrowserLocation();
      onChange(res.location);
      setSearchQuery('');
      setSuggestions([]);
      setIsSearchOpen(false);
    } catch (err: any) {
      console.warn('Geolocation capture failed:', err);
      setErrorMessage(err.message || 'Unable to retrieve your current location. Please search and select your address below.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Search address using OpenStreetMap Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);
    try {
      const results = await geocodeAddressNominatim(searchQuery);
      setSuggestions(results);
      setIsSearchOpen(true);
      if (results.length === 0) {
        setErrorMessage(`No matching locations found for "${searchQuery}". Please refine your search.`);
      }
    } catch (err: any) {
      console.warn('Nominatim geocode failed:', err);
      setErrorMessage('Location search service temporarily unavailable. Please enter coordinates or try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (s: GeocodeSuggestion) => {
    onChange({
      address: s.address,
      city: s.city,
      lat: s.lat,
      lng: s.lng,
      source: 'manual',
      timestamp: Date.now()
    });
    setSearchQuery('');
    setSuggestions([]);
    setIsSearchOpen(false);
    setErrorMessage(null);
  };

  const isBrowserGps = value.source === 'browser';
  const isManual = value.source === 'manual';

  return (
    <div className="form-group" style={{ marginBottom: '1.1rem' }}>
      {label && <label className="form-label">{label}</label>}

      {/* Action Row: Primary "Share My Location" Button + Search Bar */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
        <button
          type="button"
          onClick={handleShareLocation}
          disabled={isDetecting}
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.1rem',
            fontSize: '0.84rem',
            background: isDetecting ? 'var(--text-muted)' : 'var(--primary-navy)',
            whiteSpace: 'nowrap'
          }}
          title="Detect real coordinates using browser GPS"
        >
          {isDetecting ? (
            <>
              <Loader2 size={16} className="spin-animation" />
              <span>Detecting GPS Location...</span>
            </>
          ) : (
            <>
              <Navigation size={15} />
              <span>Share My Location</span>
            </>
          )}
        </button>

        {/* Search Input for OpenStreetMap Nominatim */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 3) {
                  // Pre-load suggestions
                  geocodeAddressNominatim(e.target.value)
                    .then(res => {
                      setSuggestions(res);
                      setIsSearchOpen(true);
                    })
                    .catch(() => {});
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder={placeholder}
              style={{ paddingLeft: '2.2rem', paddingRight: '4.5rem' }}
            />
            <MapPin 
              size={15} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching || !searchQuery.trim()}
              style={{
                position: 'absolute',
                right: '0.4rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--secondary-blue)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: searchQuery.trim() ? 'pointer' : 'default',
                opacity: searchQuery.trim() ? 1 : 0.6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              {isSearching ? <Loader2 size={12} className="spin-animation" /> : <Search size={12} />}
              <span>Find</span>
            </button>
          </div>

          {/* Autocomplete / Suggestions Dropdown */}
          {isSearchOpen && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '0.3rem'
            }}>
              {suggestions.map((s, idx) => (
                <div
                  key={`${s.lat}-${s.lng}-${idx}`}
                  onClick={() => handleSelectSuggestion(s)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <strong style={{ display: 'block', color: 'var(--primary-navy)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {s.address}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {s.city} • Lat: {s.lat.toFixed(3)}, Lng: {s.lng.toFixed(3)}
                    </span>
                  </div>
                  <Check size={14} color="#10B981" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error or Fallback Warning */}
      {errorMessage && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem 0.75rem',
          marginBottom: '0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.76rem',
          color: '#DC2626'
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Status Indicator Required by Section 1 */}
      <div style={{
        padding: '0.55rem 0.85rem',
        borderRadius: 'var(--radius-md)',
        background: isBrowserGps ? '#F0FDF4' : isManual ? '#EFF6FF' : '#F8FAFC',
        border: isBrowserGps ? '1px solid #BBF7D0' : isManual ? '1px solid #BFDBFE' : '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.78rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {isBrowserGps ? (
            <Compass size={16} color="#16A34A" />
          ) : isManual ? (
            <MapPin size={16} color="#2563EB" />
          ) : (
            <CheckCircle2 size={16} color="#64748B" />
          )}

          <div>
            {isBrowserGps ? (
              <span style={{ color: '#166534' }}>
                <strong>Using your current location:</strong> {value.address}
                {value.accuracy && (
                  <span style={{ marginLeft: '0.4rem', opacity: 0.8, fontSize: '0.72rem' }}>
                    (GPS High Accuracy: ±{Math.round(value.accuracy)}m)
                  </span>
                )}
              </span>
            ) : isManual ? (
              <span style={{ color: '#1E40AF' }}>
                <strong>Using entered location:</strong> {value.address} ({value.city})
              </span>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong>Location:</strong> {value.address} ({value.city})
              </span>
            )}
          </div>
        </div>

        <span style={{
          fontSize: '0.7rem',
          color: isBrowserGps ? '#15803D' : isManual ? '#1D4ED8' : 'var(--text-muted)',
          fontFamily: 'monospace',
          fontWeight: 700
        }}>
          {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
};
