import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { BloodBank } from '../../types';
import { 
  captureBrowserLocation, 
  geocodeAddressNominatim, 
  calculateHaversineDistance,
  GeocodeSuggestion 
} from '../../services/locationService';
import { 
  MapPin, Navigation, Search, X, ExternalLink, 
  Compass, Check, Loader2, AlertCircle
} from 'lucide-react';

interface BloodReservesMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  bloodBanks: BloodBank[];
  selectedCity: string;
  onSelectLocation: (city: string, details?: { name: string; bankName?: string; distanceKm?: number; lat?: number; lng?: number; isGps?: boolean }) => void;
}

export const BloodReservesMapModal: React.FC<BloodReservesMapModalProps> = ({
  isOpen,
  onClose,
  bloodBanks,
  selectedCity,
  onSelectLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const bankMarkersMapRef = useRef<Map<string, L.Marker>>(new Map());

  const [activeCity, setActiveCity] = useState<string>(selectedCity);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string; city: string; accuracy?: number } | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState<boolean>(false);

  // Selected bank for detail preview
  const [focusedBank, setFocusedBank] = useState<BloodBank | null>(null);

  // List of unique cities from available blood banks
  const availableCities = Array.from(new Set(bloodBanks.map(b => b.city)));

  // Synchronize initial activeCity when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveCity(selectedCity);
      setErrorMessage(null);
    }
  }, [isOpen, selectedCity]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing map if it exists to prevent container reuse error
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Determine initial center
    const currentCityBanks = bloodBanks.filter(b => b.city.toLowerCase() === activeCity.toLowerCase());
    const initialCenter: [number, number] = userLocation 
      ? [userLocation.lat, userLocation.lng]
      : currentCityBanks.length > 0
        ? [currentCityBanks[0].location.lat, currentCityBanks[0].location.lng]
        : [28.6139, 77.2090]; // Delhi fallback

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      scrollWheelZoom: true
    });

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Trigger size invalidation once modal is rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update Markers whenever activeCity, bloodBanks, or userLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    markersLayer.clearLayers();
    bankMarkersMapRef.current.clear();

    // Custom SVG Pin for Blood Banks with prominent name badge
    const createBankIcon = (bankName: string, isShortage: boolean, isSelected: boolean) => {
      const pinColor = isSelected ? '#0D47A1' : isShortage ? '#E53935' : '#1E88E5';
      const scale = isSelected ? 'transform: scale(1.15);' : '';
      const parts = bankName.split(' ');
      const shortName = parts.slice(0, 2).join(' ');

      return L.divIcon({
        className: 'custom-bank-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; width: 130px; cursor: pointer; ${scale} transition: transform 0.2s ease;">
            <svg viewBox="0 0 34 42" width="38" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 0C7.611 0 0 7.611 0 17C0 27.5 17 42 17 42C17 42 34 27.5 34 17C34 7.611 26.389 0 17 0Z" fill="${pinColor}" stroke="#FFFFFF" stroke-width="2.5" filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.4))"/>
              <circle cx="17" cy="16" r="10" fill="#FFFFFF"/>
              <path d="M17 10V22M11 16H23" stroke="${pinColor}" stroke-width="2.8" stroke-linecap="round"/>
            </svg>
            <div style="background: rgba(13, 71, 161, 0.95); color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.35); white-space: nowrap; margin-top: 1px; text-align: center; max-width: 125px; overflow: hidden; text-overflow: ellipsis; border: 1.5px solid #FFFFFF;">
              🏥 ${shortName}
            </div>
          </div>
        `,
        iconSize: [130, 68],
        iconAnchor: [65, 46],
        popupAnchor: [0, -44]
      });
    };

    // Filter banks to display: prioritize active city, but show all if user zoomed out or all
    const banksToDisplay = bloodBanks.filter(b => b.city.toLowerCase() === activeCity.toLowerCase());
    const displayList = banksToDisplay.length > 0 ? banksToDisplay : bloodBanks;

    const bounds: [number, number][] = [];

    // 1. Plot User Marker if GPS is active
    if (userLocation) {
      bounds.push([userLocation.lat, userLocation.lng]);

      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; inset: -8px; border-radius: 50%; background: rgba(37, 99, 235, 0.25); animation: pulse 2s infinite;"></div>
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(markersLayer);
      userMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 2px;">
          <strong style="color: #2563EB; display: block; font-size: 13px; margin-bottom: 2px;">📍 Your Detected GPS Location</strong>
          <div style="color: #475569; font-size: 11px;">${userLocation.address}</div>
          ${userLocation.accuracy ? `<div style="font-size: 10px; color: #16A34A; margin-top: 4px;">High Accuracy: ±${Math.round(userLocation.accuracy)}m</div>` : ''}
        </div>
      `);

      // Draw accuracy circle if high accuracy available
      if (userLocation.accuracy && userLocation.accuracy <= 500) {
        L.circle([userLocation.lat, userLocation.lng], {
          radius: userLocation.accuracy,
          color: '#2563EB',
          fillColor: '#3B82F6',
          fillOpacity: 0.1,
          weight: 1
        }).addTo(markersLayer);
      }
    }

    // 2. Plot Blood Bank Markers
    displayList.forEach(bank => {
      bounds.push([bank.location.lat, bank.location.lng]);

      // Check critical shortage (<8 units of any critical group like O-)
      const isShortage = (bank.inventorySummary['O-'] || 0) < 8;
      const isSelected = focusedBank?.id === bank.id;

      const marker = L.marker([bank.location.lat, bank.location.lng], {
        icon: createBankIcon(bank.name, isShortage, isSelected)
      }).addTo(markersLayer);

      bankMarkersMapRef.current.set(bank.id, marker);

      const distanceText = userLocation
        ? `${calculateHaversineDistance(userLocation.lat, userLocation.lng, bank.location.lat, bank.location.lng)} km away`
        : null;

      // Popup Content (Styled rich card)
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 220px; max-width: 280px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; color: #0D47A1; background: #E3F2FD; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${bank.city}
            </span>
            ${distanceText ? `<span style="font-size: 10px; font-weight: 700; color: #16A34A;">● ${distanceText}</span>` : ''}
          </div>
          <strong style="color: #0D47A1; font-size: 13px; display: block; line-height: 1.3; margin-bottom: 4px;">
            ${bank.name}
          </strong>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px; line-height: 1.4;">
            📍 ${bank.location.address}<br/>
            ⏰ ${bank.operatingHours}
          </div>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 6px; margin-bottom: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748B; margin-bottom: 4px; text-transform: uppercase;">Live Telemetry Reserves:</div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; text-align: center;">
              <span style="font-size: 10px; padding: 2px; border-radius: 3px; background: ${(bank.inventorySummary['O-'] || 0) < 8 ? '#FEE2E2; color: #DC2626; font-weight: 800;' : '#EFF6FF; color: #1E40AF;'}">O-: ${bank.inventorySummary['O-'] || 0}</span>
              <span style="font-size: 10px; padding: 2px; border-radius: 3px; background: #EFF6FF; color: #1E40AF;">O+: ${bank.inventorySummary['O+'] || 0}</span>
              <span style="font-size: 10px; padding: 2px; border-radius: 3px; background: ${(bank.inventorySummary['AB-'] || 0) < 8 ? '#FEE2E2; color: #DC2626; font-weight: 800;' : '#EFF6FF; color: #1E40AF;'}">AB-: ${bank.inventorySummary['AB-'] || 0}</span>
              <span style="font-size: 10px; padding: 2px; border-radius: 3px; background: #EFF6FF; color: #1E40AF;">A+: ${bank.inventorySummary['A+'] || 0}</span>
            </div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button id="select-bank-btn-${bank.id}" style="flex: 1; background: #0D47A1; color: #FFFFFF; border: none; padding: 5px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Select Center
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${bank.location.lat},${bank.location.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; padding: 5px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-decoration: none;">
              Directions ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Handle popup open and internal button clicks
      marker.on('popupopen', () => {
        setFocusedBank(bank);
        const btn = document.getElementById(`select-bank-btn-${bank.id}`);
        if (btn) {
          btn.onclick = () => {
            handleSelectBank(bank);
          };
        }
      });

      marker.on('click', () => {
        setFocusedBank(bank);
      });
    });

    // Draw dashed connection line if user GPS exists and there is a nearest bank
    if (userLocation && displayList.length > 0) {
      let nearest = displayList[0];
      let minDistance = calculateHaversineDistance(userLocation.lat, userLocation.lng, nearest.location.lat, nearest.location.lng);

      displayList.forEach(b => {
        const d = calculateHaversineDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
        if (d < minDistance) {
          minDistance = d;
          nearest = b;
        }
      });

      L.polyline([[userLocation.lat, userLocation.lng], [nearest.location.lat, nearest.location.lng]], {
        color: '#2563EB',
        weight: 3,
        dashArray: '5, 8',
        opacity: 0.8
      }).addTo(markersLayer);
    }

    // Auto-fit bounds if we have points
    if (bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }

    // Allow clicking anywhere on the map canvas to locate nearest blood center
    map.off('click');
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (displayList.length === 0) return;
      let nearest = displayList[0];
      let minDist = calculateHaversineDistance(e.latlng.lat, e.latlng.lng, nearest.location.lat, nearest.location.lng);

      displayList.forEach(b => {
        const d = calculateHaversineDistance(e.latlng.lat, e.latlng.lng, b.location.lat, b.location.lng);
        if (d < minDist) {
          minDist = d;
          nearest = b;
        }
      });

      if (nearest) {
        setFocusedBank(nearest);
        const m = bankMarkersMapRef.current.get(nearest.id);
        if (m) {
          m.openPopup();
        }
      }
    });
  }, [activeCity, bloodBanks, userLocation, focusedBank?.id]);

  // Handle GPS Auto-Detection
  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setErrorMessage(null);
    try {
      const res = await captureBrowserLocation();
      const loc = res.location;

      setUserLocation({
        lat: loc.lat,
        lng: loc.lng,
        address: loc.address,
        city: loc.city,
        accuracy: loc.accuracy
      });

      // Find closest blood bank
      let closestBank = bloodBanks[0];
      let minDist = calculateHaversineDistance(loc.lat, loc.lng, closestBank.location.lat, closestBank.location.lng);

      bloodBanks.forEach(b => {
        const dist = calculateHaversineDistance(loc.lat, loc.lng, b.location.lat, b.location.lng);
        if (dist < minDist) {
          minDist = dist;
          closestBank = b;
        }
      });

      setFocusedBank(closestBank);

      // If closest bank matches an available city, switch activeCity
      if (closestBank) {
        setActiveCity(closestBank.city);
      }

      // Pan map to detected coordinates
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 13, { duration: 1.2 });
      }
    } catch (err: any) {
      console.warn('Geolocation detection failed:', err);
      setErrorMessage(err.message || 'Unable to detect your GPS location. Please select your city or search an address.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Handle Address Search
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);
    try {
      const results = await geocodeAddressNominatim(searchQuery);
      setSuggestions(results);
      setIsSuggestionsOpen(true);
      if (results.length === 0) {
        setErrorMessage(`No matching places found for "${searchQuery}".`);
      }
    } catch (err: any) {
      console.warn('Geocode search failed:', err);
      setErrorMessage('Search service temporarily unavailable. Please select from quick cities.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (s: GeocodeSuggestion) => {
    setUserLocation({
      lat: s.lat,
      lng: s.lng,
      address: s.address,
      city: s.city
    });
    setSearchQuery('');
    setSuggestions([]);
    setIsSuggestionsOpen(false);

    // Find nearest bank
    let closestBank = bloodBanks[0];
    let minDist = calculateHaversineDistance(s.lat, s.lng, closestBank.location.lat, closestBank.location.lng);

    bloodBanks.forEach(b => {
      const dist = calculateHaversineDistance(s.lat, s.lng, b.location.lat, b.location.lng);
      if (dist < minDist) {
        minDist = dist;
        closestBank = b;
      }
    });

    setFocusedBank(closestBank);
    if (closestBank) {
      setActiveCity(closestBank.city);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([s.lat, s.lng], 13, { duration: 1 });
    }
  };

  // Select a bank and apply to dashboard
  const handleSelectBank = (bank: BloodBank) => {
    const dist = userLocation
      ? calculateHaversineDistance(userLocation.lat, userLocation.lng, bank.location.lat, bank.location.lng)
      : undefined;

    onSelectLocation(bank.city, {
      name: bank.location.address,
      bankName: bank.name,
      distanceKm: dist,
      lat: bank.location.lat,
      lng: bank.location.lng,
      isGps: !!userLocation
    });
    onClose();
  };

  // Apply current active city selection
  const handleApplyCity = () => {
    const dist = userLocation && focusedBank
      ? calculateHaversineDistance(userLocation.lat, userLocation.lng, focusedBank.location.lat, focusedBank.location.lng)
      : undefined;

    onSelectLocation(activeCity, {
      name: userLocation ? userLocation.address : `${activeCity} Regional Centers`,
      bankName: focusedBank?.name,
      distanceKm: dist,
      lat: userLocation?.lat ?? focusedBank?.location.lat,
      lng: userLocation?.lng ?? focusedBank?.location.lng,
      isGps: !!userLocation
    });
    onClose();
  };

  if (!isOpen) return null;

  const currentCityBanks = bloodBanks.filter(b => b.city.toLowerCase() === activeCity.toLowerCase());

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="modal-content"
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg, 12px)',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle, #E2E8F0)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                background: 'rgba(13, 71, 161, 0.1)',
                color: '#0D47A1',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPin size={20} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0D47A1', margin: 0 }}>
                Clinical Blood Centers & Regional Reserve Map
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748B)', marginTop: '0.2rem' }}>
              Live telemetry map of licensed blood centres, inventory counts & GPS-based proximity matching.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href={`https://www.google.com/maps/search/blood+banks+near+${encodeURIComponent(userLocation?.city || activeCity)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0D47A1',
                background: '#FFFFFF',
                border: '1px solid rgba(13, 71, 161, 0.25)',
                padding: '0.45rem 0.8rem',
                borderRadius: 'var(--radius-sm, 6px)',
                textDecoration: 'none'
              }}
              title="Open blood center search in Google Maps"
            >
              <ExternalLink size={14} />
              <span>Google Maps View</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted, #94A3B8)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close Map Modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Action & Controls Bar (Google Maps style) */}
        <div style={{
          padding: '0.85rem 1.5rem',
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* GPS Auto-Detect Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                fontSize: '0.82rem',
                background: isDetecting ? '#94A3B8' : '#0D47A1',
                whiteSpace: 'nowrap',
                fontWeight: 700
              }}
            >
              {isDetecting ? (
                <>
                  <Loader2 size={15} className="spin-animation" />
                  <span>Detecting GPS Coordinates...</span>
                </>
              ) : (
                <>
                  <Navigation size={15} />
                  <span>Auto-Detect My Location</span>
                </>
              )}
            </button>

            {/* Address / Landmark Search Bar */}
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search locality, hospital, or city..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length >= 3) {
                      geocodeAddressNominatim(e.target.value)
                        .then(res => {
                          setSuggestions(res);
                          setIsSuggestionsOpen(true);
                        })
                        .catch(() => {});
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  style={{
                    paddingLeft: '2.2rem',
                    paddingRight: '4.5rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    fontSize: '0.82rem'
                  }}
                />
                <Search 
                  size={15} 
                  color="var(--text-muted, #94A3B8)" 
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} 
                />
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  disabled={isSearching || !searchQuery.trim()}
                  style={{
                    position: 'absolute',
                    right: '0.35rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#0D47A1',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: '4px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: searchQuery.trim() ? 'pointer' : 'default',
                    opacity: searchQuery.trim() ? 1 : 0.6
                  }}
                >
                  {isSearching ? <Loader2 size={12} className="spin-animation" /> : 'Find'}
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {isSuggestionsOpen && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle, #E2E8F0)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: 9999,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '0.35rem'
                }}>
                  {suggestions.map((s, idx) => (
                    <div
                      key={`${s.lat}-${s.lng}-${idx}`}
                      onClick={() => handleSelectSuggestion(s)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ overflow: 'hidden' }}>
                        <strong style={{ display: 'block', color: '#0D47A1', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {s.address}
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
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

          {/* Quick Metro City Selector Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Quick Cities:
            </span>
            {availableCities.map(city => {
              const isSelected = activeCity.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setActiveCity(city);
                    const matchingBanks = bloodBanks.filter(b => b.city.toLowerCase() === city.toLowerCase());
                    if (matchingBanks.length > 0) {
                      setFocusedBank(matchingBanks[0]);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([matchingBanks[0].location.lat, matchingBanks[0].location.lng], 12);
                      }
                    }
                  }}
                  style={{
                    background: isSelected ? '#0D47A1' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    border: isSelected ? '1px solid #0D47A1' : '1px solid #CBD5E1',
                    borderRadius: 'var(--radius-full, 9999px)',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {city === 'Delhi' ? 'Delhi NCR' : city}
                </button>
              );
            })}
          </div>

          {/* Interactive Pin Tip Banner */}
          <div style={{
            background: 'rgba(13, 71, 161, 0.05)',
            border: '1px solid rgba(13, 71, 161, 0.15)',
            borderRadius: '6px',
            padding: '0.35rem 0.75rem',
            fontSize: '0.74rem',
            color: '#0D47A1',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span>💡</span>
            <span>
              <strong>Clickable Map Pins:</strong> Click on any large <strong>LifeLink Center Pin (with hospital name tag)</strong> or click a center card below to view live stock and get Google Maps directions.
            </span>
          </div>

          {/* Location Status Banner */}
          {userLocation && (
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '6px',
              padding: '0.45rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.76rem',
              color: '#166534'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Compass size={15} color="#16A34A" />
                <span>
                  <strong>Your GPS Location:</strong> {userLocation.address} ({userLocation.city})
                  {focusedBank && (
                    <span style={{ marginLeft: '0.5rem', color: '#0D47A1', fontWeight: 700 }}>
                      • Nearest Center: {focusedBank.name} ({calculateHaversineDistance(userLocation.lat, userLocation.lng, focusedBank.location.lat, focusedBank.location.lng)} km)
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyCity}
                style={{
                  background: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Use This Location
              </button>
            </div>
          )}

          {errorMessage && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              padding: '0.45rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.76rem',
              color: '#DC2626'
            }}>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Map Container Area */}
        <div style={{ position: 'relative', height: '390px', width: '100%', background: '#F1F5F9' }}>
          <div 
            ref={mapContainerRef} 
            style={{ width: '100%', height: '100%', outline: 'none' }}
          />

          {/* Floating Map Legend */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(4px)',
            borderRadius: '6px',
            padding: '0.45rem 0.75rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            fontSize: '0.72rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0D47A1' }}></span>
              <span style={{ fontWeight: 600, color: '#334155' }}>Participating Blood Center</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E53935' }}></span>
              <span style={{ fontWeight: 600, color: '#334155' }}>Critical Reserve Center</span>
            </div>
            {userLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563EB', border: '1px solid #FFFFFF' }}></span>
                <span style={{ fontWeight: 600, color: '#334155' }}>Your Detected Location</span>
              </div>
            )}
          </div>
        </div>

        {/* Participating Centers List & Footer for Selected City */}
        <div style={{
          padding: '1rem 1.5rem',
          background: '#F8FAFC',
          borderTop: '1px solid var(--border-subtle, #E2E8F0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxHeight: '210px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0D47A1', textTransform: 'uppercase' }}>
              Participating Centers in {activeCity === 'Delhi' ? 'Delhi NCR' : activeCity} ({currentCityBanks.length})
            </span>
            <button
              type="button"
              onClick={handleApplyCity}
              className="btn-primary"
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.9rem',
                fontWeight: 700,
                background: '#0D47A1'
              }}
            >
              Update Dashboard to {activeCity === 'Delhi' ? 'Delhi NCR' : activeCity}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
            {currentCityBanks.map(bank => {
              const isSelected = focusedBank?.id === bank.id;
              const dist = userLocation
                ? calculateHaversineDistance(userLocation.lat, userLocation.lng, bank.location.lat, bank.location.lng)
                : undefined;

              return (
                <div
                  key={bank.id}
                  onClick={() => {
                    setFocusedBank(bank);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([bank.location.lat, bank.location.lng], 14, { duration: 0.8 });
                      setTimeout(() => {
                        const m = bankMarkersMapRef.current.get(bank.id);
                        if (m) m.openPopup();
                      }, 250);
                    }
                  }}
                  style={{
                    background: isSelected ? '#EFF6FF' : '#FFFFFF',
                    border: isSelected ? '1.5px solid #2563EB' : '1px solid var(--border-subtle, #E2E8F0)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'none'
                  }}
                  title="Click to view and center this blood bank on map"
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0D47A1' }}>
                        {bank.name}
                      </span>
                      {dist !== undefined && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '1px 5px', borderRadius: '4px' }}>
                          {dist} km
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} color="#0D47A1" />
                      <span>{bank.location.address}</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.4rem',
                    borderTop: '1px solid #F1F5F9'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                      License: <strong>{bank.license}</strong>
                    </span>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${bank.location.lat},${bank.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: '#2563EB',
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        Maps ↗
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBank(bank);
                        }}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          background: '#0D47A1',
                          border: 'none',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
