import { useState } from 'react';
import { FamilyProvider, useFamily } from './context/FamilyContext';
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
} from 'lucide-react';

function FamilyAppContent() {
  const { activeTab, setActiveTab, tasks } = useFamily();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Mobile Top Header (only on small screens) */}
      <div className="md:hidden h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-30 shrink-0">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          title="Toggle Navigation Menu"
        >
          {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-sm text-white">Family Chat</span>
        </div>

        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Main Responsive Master-Detail Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Persistent Master Sidebar on iPad landscape & Desktop (width 320px - 360px) */}
        <div className="hidden md:block w-80 lg:w-96 shrink-0 h-full">
          <Sidebar />
        </div>

        {/* Mobile Flyout Drawer */}
        {mobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileDrawerOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative w-4/5 max-w-xs h-full bg-slate-900 shadow-2xl z-50">
              <Sidebar onCloseMobileDrawer={() => setMobileDrawerOpen(false)} />
            </div>
          </div>
        )}

        {/* Detail Workspace View */}
        <main className="flex-1 h-full flex flex-col overflow-hidden bg-slate-950">
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'radar' && <RadarMapView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'members' && <MembersView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (for convenient 1-thumb switching on iPhones/smartphones) */}
      <nav className="md:hidden h-14 bg-slate-900 border-t border-slate-800 grid grid-cols-4 items-center z-30 shrink-0 px-2">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            activeTab === 'chat' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Chats</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('radar')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition relative ${
            activeTab === 'radar' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Radar</span>
          <span className="absolute top-1 right-7 w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition relative ${
            activeTab === 'tasks' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Tasks</span>
          {pendingTasksCount > 0 && (
            <span className="absolute top-1 right-6 px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold">
              {pendingTasksCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            activeTab === 'members' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Family</span>
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
    <FamilyProvider>
      <FamilyAppContent />
    </FamilyProvider>
  );
}
