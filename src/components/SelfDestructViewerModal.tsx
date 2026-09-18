import { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { Message } from '../types';
import { Shield, Clock, AlertTriangle, Eye, Flame, Trash2, X, Lock } from 'lucide-react';

interface SelfDestructViewerModalProps {
  message: Message | null;
  onClose: () => void;
}

export function SelfDestructViewerModal({ message, onClose }: SelfDestructViewerModalProps) {
  const { openSelfDestructMedia, purgeSelfDestructMedia, fastForwardTimer } = useFamily();
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);

  useEffect(() => {
    if (message?.media?.isSelfDestruct) {
      // Ensure openedAt is initialized
      if (!message.media.openedAt) {
        openSelfDestructMedia(message.id);
      }
    }
  }, [message, openSelfDestructMedia]);

  useEffect(() => {
    if (!message?.media || !message.media.isSelfDestruct || message.media.isExpired) {
      return;
    }

    const updateTimer = () => {
      if (!message.media?.expiresAt) {
        setTimeLeftSec(3600);
        return;
      }
      const remaining = Math.max(0, Math.floor((message.media.expiresAt - Date.now()) / 1000));
      setTimeLeftSec(remaining);
      if (remaining === 0 && !message.media.isExpired) {
        purgeSelfDestructMedia(message.id);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [message, purgeSelfDestructMedia]);

  if (!message || !message.media) return null;

  const { media } = message;
  const isExpired = media.isExpired || timeLeftSec <= 0;

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Security Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border-b border-amber-500/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Private Self-Destructing Vault
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                  1-Hour Auto-Purge
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{media.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isExpired ? 'text-rose-500' : 'text-amber-400 animate-pulse'}`} />
            <span className="text-xs text-slate-400">Auto-Purge Countdown:</span>
            {isExpired ? (
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                EXPIRED & DELETED
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} remaining
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isExpired && (
              <button
                type="button"
                onClick={() => fastForwardTimer(message.id)}
                className="text-[11px] font-semibold bg-slate-800 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 transition"
                title="Fast forward 1 hour to test the auto-purge behavior"
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Fast-Forward 1-Hr (Test)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                purgeSelfDestructMedia(message.id);
              }}
              className="text-[11px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>Purge Immediately</span>
            </button>
          </div>
        </div>

        {/* Content Viewer / Masked view */}
        <div className="p-6 relative bg-slate-950 flex flex-col items-center justify-center min-h-[320px]">
          {isExpired ? (
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="font-heading text-lg font-bold text-white mb-2">Media Expired & Permanently Masked</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                As configured by the sender, this sensitive family document has automatically purged after 1 hour of first viewing. No unencrypted copies remain on this device.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 font-mono">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero-Knowledge Family Privacy Protocol</span>
              </div>
            </div>
          ) : (
            <div className="relative group w-full flex flex-col items-center">
              {/* Document security watermark */}
              <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 text-[11px] text-amber-300 font-mono">
                <Eye className="w-3.5 h-3.5" />
                <span>CONFIDENTIAL • ACTIVE RECIPIENT VIEW</span>
              </div>

              {media.type === 'document' ? (
                <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        ID
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Family Health & Identity Card</p>
                        <p className="text-[10px] text-slate-400 font-mono">Policy ID: FAM-90210-JENKINS</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  <div className="my-4 rounded-xl overflow-hidden border border-slate-700/60 max-h-72">
                    <img
                      src={media.url || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'}
                      alt="Encrypted Document"
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800 text-slate-400">
                    <div>Primary Insured: <span className="text-white font-medium">David Jenkins</span></div>
                    <div>Dependents: <span className="text-white font-medium">Ahmad, Maya, Leo</span></div>
                    <div>Group #: <span className="text-white font-mono">884-JNK</span></div>
                    <div>Rx BIN: <span className="text-white font-mono">004336</span></div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-96 shadow-2xl">
                  <img
                    src={media.url}
                    alt={media.title}
                    className="max-h-96 w-auto object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Screen captures and downloads are disabled for self-destruct files.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
