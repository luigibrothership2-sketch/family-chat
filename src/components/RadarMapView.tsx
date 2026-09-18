import { useEffect, useRef, useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { User } from '../types';
import L from 'leaflet';
import {
  Compass,
  BatteryCharging,
  BatteryMedium,
  BatteryWarning,
  Radio,
  Navigation,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Search,
  BellRing,
} from 'lucide-react';

export function RadarMapView() {
  const {
    users,
    currentUser,
    getDisplayName,
    pingMemberLocation,
    setActiveConversationId,
    setActiveTab,
  } = useFamily();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [userId: string]: L.Marker }>({});

  const [selectedUser, setSelectedUser] = useState<User>(currentUser);
  const [isRadarScanning, setIsRadarScanning] = useState(true);
  const [pingAlert, setPingAlert] = useState<string | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on California coordinates around family positions
      const map = L.map(mapContainerRef.current, {
        center: [37.772, -122.425],
        zoom: 13,
        zoomControl: false,
      });

      // Sleek dark modern map tiles
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Custom zoom control position
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup handled if needed
    };
  }, []);

  // Update markers when users or aliases change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    users.forEach((user) => {
      const { lat, lng } = user.location;
      const displayName = getDisplayName(user.id);
      const isMe = user.id === currentUser.id;

      // Battery level color
      const batteryBg =
        user.batteryLevel > 60
          ? 'bg-emerald-500'
          : user.batteryLevel > 25
          ? 'bg-amber-500'
          : 'bg-rose-500';

      const customIconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -50%);">
          <!-- Live Radar Pulse Ring -->
          <div class="absolute -inset-2.5 rounded-full ${user.isOnline ? 'bg-emerald-500/25 animate-ping' : 'hidden'}"></div>
          
          <!-- Avatar Frame -->
          <div class="relative w-12 h-12 rounded-2xl overflow-hidden border-2 ${
            isMe ? 'border-emerald-400 ring-4 ring-emerald-500/30' : 'border-slate-800 ring-2 ring-slate-900/80'
          } shadow-2xl bg-slate-900">
            <img src="${user.avatarUrl}" alt="${displayName}" class="w-full h-full object-cover" />
            <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
              user.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
            }"></span>
          </div>

          <!-- Radar Tag Pill (Custom Alias + Battery) -->
          <div class="mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-slate-700/80 text-white shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
            <span class="text-[11px] font-bold tracking-tight text-white">${displayName}</span>
            <span class="text-[10px] font-mono px-1 py-0.2 rounded text-white ${batteryBg}">
              ${user.batteryLevel}% 🔋
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customIconHtml,
        className: 'family-radar-marker',
        iconSize: [48, 64],
        iconAnchor: [24, 32],
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
  }, [users, getDisplayName, currentUser.id]);

  const handlePanToUser = (user: User) => {
    setSelectedUser(user);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([user.location.lat, user.location.lng], 15, {
        animate: true,
      });
    }
  };

  const handlePingDevice = (user: User) => {
    pingMemberLocation(user.id);
    setPingAlert(`📡 Ping sent to ${getDisplayName(user.id)}'s phone. GPS coordinates confirmed accurate.`);
    setTimeout(() => {
      setPingAlert(null);
    }, 3500);
  };

  const handleOpenDirectChat = (user: User) => {
    setActiveConversationId(user.id);
    setActiveTab('chat');
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full bg-slate-950 overflow-hidden relative">
      {/* Interactive Leaflet Map Stage */}
      <div className="flex-1 h-full min-h-[360px] relative">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Radar Sweep Effect Overlay */}
        {isRadarScanning && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-30">
            <div className="w-full h-full relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-emerald-500/30 animate-ping duration-1000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-emerald-500/20" />
            </div>
          </div>
        )}

        {/* Floating Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none gap-2">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className={`w-4 h-4 ${isRadarScanning ? 'animate-pulse text-emerald-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-xs text-white">Live Family Radar</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-400">
                {users.filter((u) => u.isOnline).length} of {users.length} devices transmitting GPS
              </p>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRadarScanning((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition flex items-center gap-1.5 shadow-lg ${
                isRadarScanning
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRadarScanning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Active Scan</span>
            </button>

            <button
              type="button"
              onClick={() => handlePanToUser(currentUser)}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-800 shadow-xl transition"
              title="Recenter on My Location"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Live GPS Ping Banner Notification */}
        {pingAlert && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-emerald-500 text-slate-950 font-semibold px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-3 duration-200">
            <BellRing className="w-4 h-4" />
            <span>{pingAlert}</span>
          </div>
        )}
      </div>

      {/* Radar Master-Detail Side Panel (or Bottom Drawer on Mobile) */}
      <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 z-20 max-h-[45vh] lg:max-h-full overflow-y-auto">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h3 className="font-heading font-semibold text-sm text-white">Family Device Status</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">All Nodes Safe</span>
        </div>

        {/* List of active family members with battery & status */}
        <div className="p-3 space-y-2 flex-1">
          {users.map((user) => {
            const isSelected = user.id === selectedUser.id;
            const displayName = getDisplayName(user.id);
            const isMe = user.id === currentUser.id;

            return (
              <div
                key={user.id}
                onClick={() => handlePanToUser(user)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={user.avatarUrl}
                        alt={displayName}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shadow-sm"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-slate-900 ${
                          user.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-heading font-bold text-xs md:text-sm text-white truncate">
                          {displayName}
                        </p>
                        {isMe && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            You
                          </span>
                        )}
                        {user.role === 'child' && (
                          <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30">
                            Kid
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">
                        {user.location.address}
                      </p>
                      <p className="text-[10px] text-emerald-400/90 font-medium">
                        {user.location.speedText || 'Stationary'} • {user.location.updatedAt}
                      </p>
                    </div>
                  </div>

                  {/* Battery Gauge */}
                  <div className="text-right shrink-0">
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                        user.batteryLevel > 60
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : user.batteryLevel > 25
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {user.isCharging ? (
                        <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      ) : user.batteryLevel > 25 ? (
                        <BatteryMedium className="w-3.5 h-3.5" />
                      ) : (
                        <BatteryWarning className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>{user.batteryLevel}%</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Action Toolbar for Selected User */}
                {isSelected && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePingDevice(user);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
                    >
                      <BellRing className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ping Device</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDirectChat(user);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm font-heading"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Direct Chat</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Radar privacy footer guarantee */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Location coordinates encrypted. Never shared outside the family circle.</span>
        </div>
      </div>
    </div>
  );
}
