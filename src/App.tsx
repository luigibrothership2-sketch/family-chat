import { useState } from 'react';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { RadarMapView } from './components/RadarMapView';
import { TasksView } from './components/TasksView';
import { MembersView } from './components/MembersView';
import { CallOverlay } from './components/CallOverlay';
import { AuthModal } from './components/AuthModal';
import { MemberAliasModal } from './components/MemberAliasModal';
import {
  Menu,
  X,
  MessageSquare,
  Radio,
  CheckSquare,
  Users,
  Shield,
  Languages,
} from 'lucide-react';

function FamilyAppContent() {
  const { currentUser, activeTab, setActiveTab, tasks } = useFamily();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // If user is not logged in, render the Login/Signup screen directly
  if (!currentUser) {
    return <AuthScreen />;
  }

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`h-screen w-screen flex flex-col bg-[#f8fafc] text-slate-900 overflow-hidden ${
        isRTL ? 'font-arabic' : 'font-sans'
      }`}
    >
      {/* Mobile Top Header (only on small screens) */}
      <div className="md:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shrink-0">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
          title={t('appName')}
        >
          {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-heading font-semibold text-sm text-slate-900 tracking-tight">
            {t('appName')}
          </span>
        </div>

        {/* Language switch button */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-600 text-xs font-semibold border border-slate-200 flex items-center gap-1 transition"
          title={t('changeLanguage')}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'عربي' : 'EN'}</span>
        </button>
      </div>

      {/* Main Responsive Master-Detail Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Persistent Master Sidebar on iPad landscape & Desktop (width 320px - 380px) */}
        <div className="hidden md:block w-80 lg:w-96 shrink-0 h-full border-r border-slate-200 bg-white">
          <Sidebar />
        </div>

        {/* Mobile Flyout Drawer */}
        {mobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />
            {/* Drawer Content */}
            <div
              className={`relative w-4/5 max-w-xs h-full bg-white shadow-2xl z-50 ${
                isRTL ? 'mr-auto' : 'ml-auto'
              }`}
            >
              <Sidebar onCloseMobileDrawer={() => setMobileDrawerOpen(false)} />
            </div>
          </div>
        )}

        {/* Detail Workspace View */}
        <main className="flex-1 h-full flex flex-col overflow-hidden bg-[#f8fafc]">
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'radar' && <RadarMapView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'members' && <MembersView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden h-14 bg-white border-t border-slate-200 grid grid-cols-4 items-center z-30 shrink-0 px-2">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            activeTab === 'chat' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('chatsTab')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('radar')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition relative ${
            activeTab === 'radar' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('radarTab')}</span>
          <span className="absolute top-1 right-7 w-1.5 h-1.5 rounded-full bg-blue-600" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition relative ${
            activeTab === 'tasks' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('tasksTab')}</span>
          {pendingTasksCount > 0 && (
            <span className="absolute top-1 right-6 px-1.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">
              {pendingTasksCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            activeTab === 'members' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('familyTab')}</span>
        </button>
      </nav>

      {/* Global Modals & WebRTC Call Overlay */}
      <CallOverlay />
      <AuthModal />
      <MemberAliasModal />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <FamilyProvider>
        <FamilyAppContent />
      </FamilyProvider>
    </LanguageProvider>
  );
}
