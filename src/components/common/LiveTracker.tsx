import React, { useEffect, useRef } from 'react';
import { BloodRequest } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateHaversineDistance } from '../../services/locationService';
import L from 'leaflet';
import { 
  Clock, Phone, ArrowUpRight, CheckCircle, Award, 
  MapPin 
} from 'lucide-react';

interface LiveTrackerProps {
  request: BloodRequest;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({ request }) => {
  const { escalateRequest, users, donorProfiles, t } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const steps = [
    { key: 'matching', label: t.status.matching, num: 1 },
    { key: 'notified', label: t.status.notified, num: 2 },
    { key: 'accepted', label: t.status.accepted, num: 3 },
    { key: 'en_route', label: t.status.en_route, num: 4 },
    { key: 'fulfilled', label: t.status.fulfilled, num: 5 }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'matching': return 0;
      case 'notified': return 1;
      case 'accepted': return 2;
      case 'en_route': return 3;
      case 'fulfilled': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(request.status);

  // Initialize and update Leaflet map preview showing patient and donor markers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const patientLat = request.location?.lat ?? 28.5355;
    const patientLng = request.location?.lng ?? 77.2910;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [patientLat, patientLng],
        zoom: 12,
        scrollWheelZoom: false,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing dynamic layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.CircleMarker || layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // 1. Patient Location Marker (Red Pin)
    const patientMarker = L.circleMarker([patientLat, patientLng], {
      color: '#B91C1C',
      fillColor: '#EF4444',
      fillOpacity: 0.95,
      radius: 9,
      weight: 3
    }).addTo(map);

    patientMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; min-width: 150px;">
        <strong style="color: #DC2626; display: block; font-size: 13px;">🏥 Patient / Delivery Destination</strong>
        <div style="margin-top: 3px; color: #334155;">
          ${request.location?.address || 'Apollo ICU Delivery'}<br/>
          <strong>Requirement:</strong> ${request.units} Units of ${request.bloodGroup} (${request.component})
        </div>
      </div>
    `);

    // 2. Matched Donor or Nearby Candidate Donors
    if (request.matchedDonorId || request.matchedDonorName) {
      const matchedProfile = request.matchedDonorId ? donorProfiles[request.matchedDonorId] : undefined;
      const matchedUser = request.matchedDonorId ? users.find(u => u.id === request.matchedDonorId) : undefined;

      const donorLat = matchedProfile?.currentLocation?.lat ?? matchedUser?.location?.lat ?? (patientLat + 0.024);
      const donorLng = matchedProfile?.currentLocation?.lng ?? matchedUser?.location?.lng ?? (patientLng + 0.018);

      const distanceKm = calculateHaversineDistance(patientLat, patientLng, donorLat, donorLng);

      // Donor Marker (Green Pin)
      const donorMarker = L.circleMarker([donorLat, donorLng], {
        color: '#15803D',
        fillColor: '#22C55E',
        fillOpacity: 0.95,
        radius: 9,
        weight: 3
      }).addTo(map);

      donorMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 150px;">
          <strong style="color: #16A34A; display: block; font-size: 13px;">🩸 Matched Lifesaver Donor</strong>
          <div style="margin-top: 3px; color: #334155;">
            <strong>${request.matchedDonorName || 'Verified Donor'}</strong><br/>
            Real Proximity: <strong>${distanceKm} km away</strong> (Haversine GPS)<br/>
            Status: ${request.status === 'en_route' ? '🚀 Traveling to Hospital' : '✅ Match Accepted'}
          </div>
        </div>
      `);

      // Visual Proximity Polyline connecting Patient and Donor
      L.polyline([[patientLat, patientLng], [donorLat, donorLng]], {
        color: '#2563EB',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.85
      }).addTo(map);

      // Fit bounds to enclose both patient and donor markers
      map.fitBounds([[patientLat, patientLng], [donorLat, donorLng]], {
        padding: [30, 30],
        maxZoom: 14
      });
    } else {
      // If still matching/broadcasting: plot nearby available donors and radar search circle
      L.circle([patientLat, patientLng], {
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.08,
        radius: 10000, // 10km buffer
        weight: 1,
        dashArray: '4, 4'
      }).addTo(map);

      // Candidate donor pins
      const candidateDonors = [
        { name: 'Vikram Malhotra', lat: 28.5494, lng: 77.2001, bg: 'O-' },
        { name: 'Priya Nair', lat: 28.5677, lng: 77.2433, bg: 'O-' },
        { name: 'Rohan Deshmukh', lat: 28.5245, lng: 77.2066, bg: 'O+' }
      ];

      candidateDonors.forEach((cd) => {
        const dist = calculateHaversineDistance(patientLat, patientLng, cd.lat, cd.lng);
        const cm = L.circleMarker([cd.lat, cd.lng], {
          color: '#1D4ED8',
          fillColor: '#60A5FA',
          fillOpacity: 0.9,
          radius: 7,
          weight: 2
        }).addTo(map);

        cm.bindPopup(`
          <div style="font-family: inherit; font-size: 11px;">
            <strong>Candidate Donor: ${cd.name} (${cd.bg})</strong><br/>
            Proximity: ${dist} km away
          </div>
        `);
      });

      map.setView([patientLat, patientLng], 12);
    }

  }, [request, users, donorProfiles]);

  // Clean up Leaflet on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="card" style={{ borderLeft: request.isPriority ? '4px solid #F59E0B' : '4px solid var(--primary-navy)' }}>
      <div className="card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className={`urgency-badge ${request.urgency}`}>
              {request.urgency}
            </span>
            {request.isPriority && (
              <span className="priority-verified-donor-badge" id={`badge-priority-${request.id}`}>
                <Award size={13} color="#D97706" />
                Priority Request — Verified Donor
              </span>
            )}
            <h3 className="card-title">
              {request.units} Units of {request.bloodGroup} {request.component}
            </h3>
          </div>
          <div className="card-desc">
            Clinical Reference: <strong>{request.patientCaseId || 'Emergency Case'}</strong> • Delivery: {request.location.address}
          </div>
          {request.isPriority && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.35rem',
              fontSize: '0.75rem',
              color: '#B45309',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <Award size={12} color="#D97706" />
              <span>
                Prioritized via verified donation history ({request.donorTotalDonations || 1} donation{request.donorTotalDonations !== 1 ? 's' : ''} • {request.donorContributionScore || 94}% score boost)
              </span>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Escalation Layer</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--secondary-blue)' }}>
            {request.currentTier === 1 && "Tier 1: Nearby Donors (<10km)"}
            {request.currentTier === 2 && "Tier 2: City-wide Donors"}
            {request.currentTier >= 3 && "Tier 3: Partner Blood Bank Reserve"}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="tracker-container">
        <div className="tracker-steps">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex || request.status === 'fulfilled';
            const isActive = idx === currentIndex && request.status !== 'fulfilled';
            return (
              <div 
                key={step.key} 
                className={`tracker-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="tracker-node">
                  {isCompleted ? <CheckCircle size={16} /> : step.num}
                </div>
                <span className="tracker-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Small Leaflet Spatial Proximity Map Preview (Section 5 Requirement) */}
      <div style={{ marginTop: '1.25rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.45rem',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
            <MapPin size={14} color="#2563EB" />
            <span>Spatial Proximity Preview (Leaflet & OpenStreetMap)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.72rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#DC2626' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
              Patient Pin
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#16A34A' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
              Donor Location
            </span>
            <span style={{ color: '#1D4ED8', background: '#EFF6FF', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              Haversine Telemetry
            </span>
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          style={{
            height: '210px',
            width: '100%',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
            zIndex: 1
          }}
        />
      </div>

      {/* Matched Details & Escalation Controls */}
      <div style={{
        marginTop: '1.25rem',
        padding: '0.9rem 1.1rem',
        background: '#F8FAFC',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          {request.matchedDonorName && (
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Volunteer: </span>
              <strong style={{ color: 'var(--primary-navy)' }}>{request.matchedDonorName}</strong>
              {request.matchedDonorPhone && (
                <a 
                  href={`tel:${request.matchedDonorPhone}`}
                  style={{ marginLeft: '0.6rem', color: 'var(--secondary-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', fontWeight: 700 }}
                >
                  <Phone size={13} /> {request.matchedDonorPhone}
                </a>
              )}
            </div>
          )}

          {request.matchedBankName && (
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Reserve Center: </span>
              <strong style={{ color: 'var(--primary-navy)' }}>{request.matchedBankName}</strong> (Stock Reserved)
            </div>
          )}

          {!request.matchedDonorName && !request.matchedBankName && (
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-blue)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <Clock size={15} /> Telemetry search running across donor pool...
            </div>
          )}
        </div>

        {/* Demo Trigger: Force Escalation */}
        {request.status !== 'fulfilled' && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => escalateRequest(request.id)}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
            title="Simulate SLA timer timeout to test automatic tier promotion"
          >
            <ArrowUpRight size={13} />
            <span>Simulate SLA Timeout (Escalate Tier)</span>
          </button>
        )}
      </div>
    </div>
  );
};
