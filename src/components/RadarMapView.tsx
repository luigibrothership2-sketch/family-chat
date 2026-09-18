import { useEffect, useRef, useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useLanguage } from '../context/LanguageContext';
import { User } from '../types';
import L from 'leaflet';
import {
  BatteryCharging,
  BatteryMedium,
  Radio,
  Navigation,
  MessageSquare,
  BellRing,
  LocateFixed,
} from 'lucide-react';

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distKm: number, isRTL: boolean): string {
  if (distKm < 1) {
    const meters = Math.round(distKm * 1000);
    return isRTL ? `يبعد ${meters} متر` : `${meters} m away`;
  }
  return isRTL ? `يبعد ${distKm.toFixed(1)} كم` : `${distKm.toFixed(1)} km away`;
}

export function RadarMapView() {
  const {
    users,
    currentUser,
    getDisplayName,
    pingMemberLocation,
    startDirectChat,
    isGpsActive,
    enableGpsRadar,
  } = useFamily();

  const { t, isRTL } = useLanguage();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [userId: string]: L.Marker }>({});
  const circleRef = useRef<L.Circle | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(currentUser);
  const [pingAlert, setPingAlert] = useState<string | null>(null);

  if (!currentUser) return null;

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = currentUser.location?.lat || 37.7749;
      const initialLng = currentUser.location?.lng || -122.4194;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
      });

      // Carto Voyager tiles (clean, soft, light map style)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: isRTL ? 'bottomleft' : 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }
  }, [currentUser.location?.lat, currentUser.location?.lng, isRTL]);

  // Update markers when users change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    users.forEach((user) => {
      const lat = user.location?.lat ?? 37.7749;
      const lng = user.location?.lng ?? -122.4194;
      const displayName = getDisplayName(user.id);
      const isMe = user.id === currentUser.id;

      const batteryBg =
        user.batteryLevel > 60
          ? 'bg-emerald-600'
          : user.batteryLevel > 25
          ? 'bg-amber-600'
          : 'bg-red-600';

      const customIconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -50%);">
          <!-- Avatar Frame: Clean light pin -->
          <div class="relative w-11 h-11 rounded-full overflow-hidden border-2 ${
            isMe
              ? 'border-blue-600 ring-2 ring-blue-400/40'
              : 'border-slate-300'
          } shadow-md bg-white">
            <img src="${user.avatarUrl}" alt="${displayName}" class="w-full h-full object-cover" />
            <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              user.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
            }"></span>
          </div>

          <!-- Radar Tag Pill (Custom Nickname + Battery) -->
          <div class="mt-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-900 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
            <span class="text-[11px] font-semibold text-slate-900">${displayName}</span>
            <span class="text-[9px] font-sans px-1 rounded text-white ${batteryBg}">
              ${user.batteryLevel}% 🔋
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customIconHtml,
        className: 'family-radar-marker',
        iconSize: [44, 58],
        iconAnchor: [22, 29],
      });

      if (markersRef.current[user.id]) {
        markersRef.current[user.id].setLatLng([lat, lng]);
        markersRef.current[user.id].setIcon(customIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedUser(user);
          map.panTo([lat, lng], { animate: true });
        });
        markersRef.current[user.id] = marker;
      }
    });

    // Accuracy circle for current user
    if (currentUser.location?.accuracy && currentUser.location?.lat) {
      if (circleRef.current) {
        circleRef.current.setLatLng([currentUser.location.lat, currentUser.location.lng]);
        circleRef.current.setRadius(currentUser.location.accuracy);
      } else {
        circleRef.current = L.circle(
          [currentUser.location.lat, currentUser.location.lng],
          {
            radius: currentUser.location.accuracy || 20,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.12,
            weight: 1,
          }
        ).addTo(map);
      }
    }
  }, [users, getDisplayName, currentUser]);

  const handlePanToUser = (user: User) => {
    setSelectedUser(user);
    if (mapInstanceRef.current && user.location) {
      mapInstanceRef.current.setView([user.location.lat, user.location.lng], 15, {
        animate: true,
      });
    }
  };

  const handlePing = (user: User) => {
    pingMemberLocation(user.id);
    setPingAlert(`${t('pingSent')} ${getDisplayName(user.id)}!`);
    setTimeout(() => setPingAlert(null), 3000);
  };

  const selectedDisplayName = selectedUser ? getDisplayName(selectedUser.id) : '';
  const isSelectedMe = selectedUser?.id === currentUser.id;

  // Calculate real distance from current user to selected user
  const distanceText =
    selectedUser && !isSelectedMe && currentUser.location && selectedUser.location
      ? formatDistance(
          calculateDistanceKm(
            currentUser.location.lat,
            currentUser.location.lng,
            selectedUser.location.lat,
            selectedUser.location.lng
          ),
          isRTL
        )
      : null;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden relative select-none"
    >
      {/* Radar Control Header */}
      <header className="px-4 md:px-6 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-semibold text-base text-slate-900">
                {t('liveRadarTitle')}
              </h2>
              <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                {isGpsActive ? t('gpsActive') : 'GPS Standby'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Continuous live GPS tracking & battery telemetry synced over Firestore.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isGpsActive && (
            <button
              type="button"
              onClick={enableGpsRadar}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <LocateFixed className="w-4 h-4" />
              <span>{t('enableGps')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handlePanToUser(currentUser)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
            title="Recenter Map on Me"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </header>

      {/* Interactive Map Surface */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Family Member Quick-Pan Rail */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-2 overflow-x-auto pb-2 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto bg-white/95 p-1.5 rounded-xl border border-slate-200 shadow-md">
            {users.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              const dName = getDisplayName(u.id);

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handlePanToUser(u)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <img
                    src={u.avatarUrl}
                    alt={dName}
                    className="w-5 h-5 rounded-full object-cover border border-slate-200"
                  />
                  <span>{dName}</span>
                  <span className="text-[10px] font-sans opacity-80">{u.batteryLevel}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Member Detail Overlay Card */}
        {selectedUser && (
          <div className="absolute bottom-6 left-4 right-4 md:left-6 md:right-auto md:w-96 z-20 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedDisplayName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                      selectedUser.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-heading font-semibold text-sm md:text-base text-slate-900">
                      {selectedDisplayName}
                    </h3>
                    {isSelectedMe && (
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.2 rounded-md">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-sans">
                    @{selectedUser.username} • {selectedUser.fullName}
                  </p>
                </div>
              </div>

              {/* Ping button */}
              {!isSelectedMe && (
                <button
                  type="button"
                  onClick={() => handlePing(selectedUser)}
                  className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition border border-amber-200"
                  title={t('pingMember')}
                >
                  <BellRing className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block mb-0.5">Battery & Power:</span>
                <span className="font-sans font-semibold text-emerald-600 flex items-center gap-1">
                  {selectedUser.isCharging ? (
                    <BatteryCharging className="w-4 h-4 text-amber-600" />
                  ) : (
                    <BatteryMedium className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>
                    {selectedUser.batteryLevel}% {selectedUser.isCharging && `(${t('charging')})`}
                  </span>
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block mb-0.5">Proximity / Distance:</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {isSelectedMe ? 'Your device' : distanceText || 'Calculating...'}
                </span>
              </div>
            </div>

            {/* Address / Location text */}
            <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-700">
              <span className="truncate">📍 {selectedUser.location?.address || 'Current Location'}</span>
              <span className="text-[10px] text-slate-400 font-sans shrink-0 ml-2">
                {selectedUser.location?.updatedAt || 'Live'}
              </span>
            </div>

            {/* Bottom Actions */}
            {!isSelectedMe && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startDirectChat(selectedUser.id)}
                  className="flex-1 py-2 rounded-xl bg-[#007aff] hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('connectChat')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Ping Toast */}
        {pingAlert && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white font-medium px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in zoom-in-95">
            <BellRing className="w-4 h-4" />
            <span>{pingAlert}</span>
          </div>
        )}
      </div>
    </div>
  );
}
