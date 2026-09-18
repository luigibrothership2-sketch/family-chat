import { useEffect, useRef, useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';

export function CallOverlay() {
  const {
    callSession,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    currentUser,
    users,
    getDisplayName,
  } = useFamily();

  const [callDuration, setCallDuration] = useState<number>(0);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasRealCameraStream, setHasRealCameraStream] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Call timer
  useEffect(() => {
    if (!callSession.isActive) {
      setCallDuration(0);
      return;
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callSession.isActive]);

  // Request actual camera stream if available
  useEffect(() => {
    if (!callSession.isActive || callSession.isCameraOff) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setHasRealCameraStream(false);
      }
      return;
    }

    let isMounted = true;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaStreamRef.current = stream;
        setHasRealCameraStream(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        // Fallback to simulated high-fidelity avatar stream
        console.log('Camera permission not granted, using simulated stream:', err);
        setHasRealCameraStream(false);
      });

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callSession.isActive, callSession.isCameraOff]);

  if (!callSession.isActive) return null;

  const minutes = Math.floor(callDuration / 60);
  const seconds = callDuration % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Participants in the call (excluding currentUser)
  const participants = users.filter(
    (u) => callSession.participantIds.includes(u.id) && u.id !== currentUser.id
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col backdrop-blur-xl animate-in fade-in duration-300">
      {/* Top Floating Control Bar */}
      <div className="p-4 sm:p-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            {callSession.type === 'video' ? <Video className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-white text-sm sm:text-base">
                {callSession.channelName || 'Family Conference Call'}
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                E2EE HD
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{timeDisplay}</span>
              <span>•</span>
              <span>{participants.length + 1} connected</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title={isSpeakerMuted ? 'Unmute Speakers' : 'Mute Speakers'}
          >
            {isSpeakerMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition hidden sm:flex"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video / Audio Grid Stage */}
      <div className="flex-1 px-4 sm:px-6 pb-4 flex items-center justify-center overflow-hidden">
        <div
          className={`w-full max-w-5xl h-full grid gap-4 ${
            participants.length === 0
              ? 'grid-cols-1 max-w-md'
              : participants.length === 1
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-2 lg:grid-cols-3'
          } items-center justify-center`}
        >
          {/* My Own Local Video Tile */}
          <div className="relative w-full h-full min-h-[220px] max-h-[380px] bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl flex flex-col items-center justify-center group">
            {callSession.type === 'video' && !callSession.isCameraOff ? (
              hasRealCameraStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                /* Simulated video stream tile with animated portrait */
                <div className="relative w-full h-full">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                </div>
              )
            ) : (
              /* Camera Off State */
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full border-4 border-slate-700 overflow-hidden mx-auto shadow-2xl mb-3">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-slate-400 font-semibold">Camera Turned Off</p>
              </div>
            )}

            {/* Speaking waveform badge */}
            {!callSession.isMuted && (
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1">
                {[8, 16, 24, 12, 18].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-400 rounded-full animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Bottom Tag */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-slate-800 flex items-center gap-1.5">
                <span>{getDisplayName(currentUser.id)} (You)</span>
                {callSession.isMuted && <MicOff className="w-3 h-3 text-rose-400" />}
              </span>

              {callSession.isScreenSharing && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/30">
                  Sharing Screen
                </span>
              )}
            </div>
          </div>

          {/* Remote Participants Tiles */}
          {participants.map((p, idx) => {
            const displayName = getDisplayName(p.id);
            return (
              <div
                key={p.id}
                className="relative w-full h-full min-h-[220px] max-h-[380px] bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl flex flex-col items-center justify-center"
              >
                {callSession.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <img
                      src={p.avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-700 overflow-hidden mx-auto shadow-2xl mb-3">
                      <img
                        src={p.avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">{displayName}</p>
                  </div>
                )}

                {/* Animated Audio Voice Wave for participant */}
                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1">
                  {[12, 22, 14, 26, 18].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full animate-pulse"
                      style={{ height: `${h}px`, animationDelay: `${(i + idx) * 150}ms` }}
                    />
                  ))}
                </div>

                {/* Participant Label */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-slate-800 flex items-center gap-1.5">
                    <span>{displayName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.batteryLevel}% 🔋</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Calling Control Dock */}
      <div className="p-6 bg-slate-950 border-t border-slate-800/80 flex items-center justify-center gap-3 sm:gap-4 z-20">
        {/* Toggle Microphone */}
        <button
          type="button"
          onClick={toggleMute}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition shadow-lg ${
            callSession.isMuted
              ? 'bg-rose-500 text-white shadow-rose-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
          }`}
          title={callSession.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {callSession.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Toggle Camera Stream */}
        <button
          type="button"
          onClick={toggleCamera}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition shadow-lg ${
            callSession.isCameraOff
              ? 'bg-rose-500 text-white shadow-rose-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
          }`}
          title={callSession.isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {callSession.isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        {/* Toggle Screen Share */}
        <button
          type="button"
          onClick={toggleScreenShare}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition shadow-lg hidden sm:flex ${
            callSession.isScreenSharing
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
          }`}
          title="Share Screen"
        >
          <Monitor className="w-6 h-6" />
        </button>

        {/* End Call Button */}
        <button
          type="button"
          onClick={endCall}
          className="w-16 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95"
          title="End Family Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
