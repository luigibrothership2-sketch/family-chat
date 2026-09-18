import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { TaskStatus, TaskPriority, FamilyTask } from '../types';
import {
  CheckSquare,
  Plus,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Filter,
  Calendar,
  Sparkles,
  Home,
  ShoppingBag,
  BookOpen,
  HeartPulse,
  Tag,
  X,
} from 'lucide-react';

export function TasksView() {
  const {
    tasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    users,
    currentUser,
    getDisplayName,
    activeGroupId,
    groups,
  } = useFamily();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState(currentUser?.id || '');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newCategory, setNewCategory] = useState<'chores' | 'errands' | 'school' | 'health' | 'event'>('chores');
  const [newDueDate, setNewDueDate] = useState('Today, 6:00 PM');

  if (!currentUser) return null;

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter !== 'all' && t.status !== activeFilter) return false;
    if (assigneeFilter !== 'all' && t.assignedToId !== assigneeFilter) return false;
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTask({
      groupId: activeGroupId,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      assignedToId: newAssigneeId,
      createdById: currentUser.id,
      status: 'pending',
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate || 'Today',
    });

    setNewTitle('');
    setNewDesc('');
    setIsCreateModalOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chores':
        return <Home className="w-3.5 h-3.5" />;
      case 'errands':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'school':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'health':
        return <HeartPulse className="w-3.5 h-3.5" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-4 md:px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-lg text-white">Shared Family Tasks</h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
              {activeGroup?.name || 'Household'}
            </span>
          </div>
          <p className="text-xs text-slate-400">Collaborative to-dos assigned to family members</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Family Task</span>
        </button>
      </header>

      {/* Metrics & Filter Bar */}
      <div className="px-4 md:px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Pending ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'in_progress'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-sky-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>In Progress ({inProgressCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Completed ({completedCount})</span>
          </button>
        </div>

        {/* Assignee Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Assigned to: Anyone</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {getDisplayName(u.id)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400/50 mb-3" />
            <h4 className="font-heading font-bold text-white text-base">No tasks in this view</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              All shared household responsibilities in this category are completed or none have been assigned yet.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const assignee = users.find((u) => u.id === task.assignedToId);
            const assigneeName = getDisplayName(task.assignedToId);
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                    : isInProgress
                    ? 'bg-slate-900 border-sky-500/30 shadow-sm'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Status Checkbox / Switcher */}
                    <button
                      type="button"
                      onClick={() =>
                        updateTaskStatus(
                          task.id,
                          isCompleted ? 'pending' : 'completed'
                        )
                      }
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 hover:border-emerald-400 bg-slate-950'
                      }`}
                    >
                      {isCompleted && <CheckSquare className="w-3.5 h-3.5 font-bold" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`font-heading font-bold text-sm md:text-base ${
                            isCompleted ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            task.priority === 'high'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Category badge */}
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-700">
                          {getCategoryIcon(task.category)}
                          <span className="capitalize">{task.category}</span>
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Meta information row: Assignee with Custom Nickname & Due Date */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                        {/* Assignee pill */}
                        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                          <img
                            src={assignee?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                            alt={assigneeName}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-slate-300 font-medium">Assigned: {assigneeName}</span>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Controls: Status Selector & Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className={`text-xs font-semibold rounded-xl px-2.5 py-1 border focus:outline-none ${
                        task.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : task.status === 'in_progress'
                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create New Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-white">Create Household Task</h3>
                  <p className="text-xs text-slate-400">Shared with {activeGroup?.name || 'Family'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Pick up milk & eggs, Ahmad finish science project"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Details / Instructions (Optional)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Any specific store location, notes, or checklist items..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Assign to Family Member */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assign Directly To:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {users.map((u) => {
                    const isSelected = u.id === newAssigneeId;
                    const nickname = getDisplayName(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setNewAssigneeId(u.id)}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-left transition ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <img
                          src={u.avatarUrl}
                          alt={nickname}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold truncate">{nickname}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority ⚠️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="chores">Home Chores 🏡</option>
                    <option value="errands">Errands & Shopping 🛒</option>
                    <option value="school">School / Homework 📚</option>
                    <option value="health">Health & Medical 🩺</option>
                    <option value="event">Family Event 🎉</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Due Date / Time
                </label>
                <input
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="e.g. Today 5 PM, Saturday morning"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition font-heading"
                >
                  <Plus className="w-4 h-4" />
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
