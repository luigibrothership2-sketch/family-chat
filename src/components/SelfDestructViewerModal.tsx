import { useState, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useLanguage } from '../context/LanguageContext';
import { Message } from '../types';
import { Shield, Clock, AlertTriangle, Eye, Flame, Trash2, X, Lock } from 'lucide-react';

interface SelfDestructViewerModalProps {
  message: Message | null;
  onClose: () => void;
}

export function SelfDestructViewerModal({ message, onClose }: SelfDestructViewerModalProps) {
  const { openSelfDestructMedia, purgeSelfDestructMedia, fastForwardTimer } = useFamily();
  const { t, isRTL } = useLanguage();
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);

  useEffect(() => {
    if (message?.media?.isSelfDestruct) {
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
  const isExpired = media.isExpired || timeLeftSec <= 0 || !media.url;

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Security Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {t('confidentialView')}
                </span>
                <span className="text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                  {t('hoursRemaining')}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{media.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-amber-100/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer Bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-amber-600 animate-pulse'}`} />
            <span className="text-xs text-slate-600">Auto-Purge Countdown:</span>
            {isExpired ? (
              <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                {t('autoPurged')}
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isExpired && (
              <button
                type="button"
                onClick={() => fastForwardTimer(message.id)}
                className="text-[11px] font-semibold bg-white hover:bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 transition shadow-2xs"
                title="Simulate 1 hour elapsed to test auto-destruction"
              >
                <Flame className="w-3 h-3 text-amber-600" />
                <span>{t('fastForwardTest')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                purgeSelfDestructMedia(message.id);
              }}
              className="text-[11px] font-semibold bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3 h-3 text-red-600" />
              <span>{t('purgeNow')}</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-6 relative bg-slate-100/60 flex flex-col items-center justify-center min-h-[320px]">
          {isExpired ? (
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-3xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="font-heading text-lg font-bold text-slate-900 mb-2">{t('mediaExpiredText')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                As configured by the family security protocol, this file was permanently purged from cloud storage after 1 hour of first viewing. No copies remain.
              </p>
            </div>
          ) : media.type === 'image' ? (
            <div className="w-full flex justify-center">
              <img
                src={media.url}
                alt={media.title}
                className="max-h-[480px] w-auto max-w-full rounded-2xl object-contain shadow-md border border-slate-200"
              />
            </div>
          ) : (
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-slate-900 text-sm mb-1">{media.title}</h4>
              <p className="text-xs text-slate-500 mb-4">{media.fileSize}</p>
              <a
                href={media.url}
                download={media.title}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#007aff] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Download Document ({String(minutes)}m remaining)
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Vault active: Self-purges immediately upon timer expiration.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
