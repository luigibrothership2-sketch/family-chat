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
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (isMounted) {
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setHasRealCameraStream(true);
        }
      } catch (e) {
        setHasRealCameraStream(false);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [callSession.isActive, callSession.isCameraOff]);

  if (!callSession.isActive || !currentUser) return null;

  const minutes = Math.floor(callDuration / 60);
  const seconds = callDuration % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const participants = users.filter((u) => callSession.participantIds.includes(u.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-white text-sm sm:text-base">
                {callSession.channelName}
              </h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                {callSession.type === 'video' ? 'HD Video Call' : 'Voice Call'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{timeFormatted}</span>
              <span>•</span>
              <span>End-to-End Encrypted</span>
            </p>
          </div>
        </div>

        {/* Secondary header buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title={isSpeakerMuted ? 'Unmute Speakers' : 'Mute Speakers'}
          >
            {isSpeakerMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
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
          <div className="relative w-full h-full min-h-[220px] max-h-[380px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col items-center justify-center group">
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
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full border-2 border-slate-700 overflow-hidden mx-auto shadow-lg mb-3">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-slate-400 font-medium">Camera Turned Off</p>
              </div>
            )}

            {/* Speaking waveform badge */}
            {!callSession.isMuted && (
              <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                {[8, 14, 20, 10, 16].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-400 rounded-full"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            )}

            {/* Bottom Tag */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="bg-slate-900/90 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5">
                <span>{getDisplayName(currentUser.id)} (You)</span>
                {callSession.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
              </span>

              {callSession.isScreenSharing && (
                <span className="bg-blue-500/30 text-blue-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-blue-500/50">
                  Sharing Screen
                </span>
              )}
            </div>
          </div>

          {/* Remote Participants Tiles */}
          {participants.map((p) => {
            const displayName = getDisplayName(p.id);
            return (
              <div
                key={p.id}
                className="relative w-full h-full min-h-[220px] max-h-[380px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col items-center justify-center"
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
                    <div className="w-20 h-20 rounded-full border-2 border-slate-700 overflow-hidden mx-auto shadow-lg mb-3">
                      <img
                        src={p.avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{displayName}</p>
                  </div>
                )}

                {/* Audio Voice Wave for participant */}
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                  {[10, 18, 12, 22, 14].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>

                {/* Participant Label */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="bg-slate-900/90 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5">
                    <span>{displayName}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{p.batteryLevel}% 🔋</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Calling Control Dock */}
      <div className="p-5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-center gap-3 sm:gap-4 z-20">
        {/* Toggle Microphone */}
        <button
          type="button"
          onClick={toggleMute}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
            callSession.isMuted
              ? 'bg-red-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title={callSession.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {callSession.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Toggle Camera Stream */}
        <button
          type="button"
          onClick={toggleCamera}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
            callSession.isCameraOff
              ? 'bg-red-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title={callSession.isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {callSession.isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Toggle Screen Share */}
        <button
          type="button"
          onClick={toggleScreenShare}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition hidden sm:flex ${
            callSession.isScreenSharing
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title="Share Screen"
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* End Call Button */}
        <button
          type="button"
          onClick={endCall}
          className="w-14 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition shadow-lg shadow-red-600/30"
          title="End Family Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
