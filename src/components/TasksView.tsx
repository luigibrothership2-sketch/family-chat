import React, { useState } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useLanguage } from '../context/LanguageContext';
import { TaskStatus, TaskPriority } from '../types';
import {
  CheckSquare,
  Plus,
  Clock,
  Trash2,
  Filter,
  CheckCircle2,
  Home,
  ShoppingBag,
  BookOpen,
  HeartPulse,
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

  const { t, isRTL } = useLanguage();

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createTask({
      groupId: activeGroupId || groups[0]?.id || 'household',
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      assignedToId: newAssigneeId || currentUser.id,
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
        return <Home className="w-3.5 h-3.5 text-blue-600" />;
      case 'errands':
        return <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />;
      case 'school':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-600" />;
      case 'health':
        return <HeartPulse className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden select-none"
    >
      {/* Header */}
      <header className="px-4 md:px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-lg text-slate-900">{t('tasksTab')}</h2>
            <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-md border border-blue-100">
              {activeGroup?.name || 'Household'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time household responsibilities and family coordination.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#007aff] hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newTask')}</span>
        </button>
      </header>

      {/* Metrics & Filter Bar */}
      <div className="px-4 md:px-6 py-3 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'pending'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-600 hover:text-amber-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Pending ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'in_progress'
                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                : 'bg-slate-100 text-slate-600 hover:text-sky-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>In Progress ({inProgressCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'completed'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 hover:text-emerald-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Completed ({completedCount})</span>
          </button>
        </div>

        {/* Assignee Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
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
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-blue-500/60 mb-3" />
            <h4 className="font-heading font-semibold text-slate-900 text-base">No tasks in this view</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
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
                className={`p-4 rounded-xl border transition ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : isInProgress
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Status Checkbox */}
                    <button
                      type="button"
                      onClick={() =>
                        updateTaskStatus(task.id, isCompleted ? 'pending' : 'completed')
                      }
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                        isCompleted
                          ? 'bg-[#007aff] border-blue-600 text-white'
                          : 'border-slate-300 hover:border-blue-500 bg-white'
                      }`}
                    >
                      {isCompleted && <CheckSquare className="w-3.5 h-3.5 font-bold" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`font-heading font-semibold text-sm md:text-base ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h4>

                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.2 rounded-md border ${
                            task.priority === 'high'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200">
                          {getCategoryIcon(task.category)}
                          <span className="capitalize">{task.category}</span>
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/70">
                          <img
                            src={assignee?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                            alt={assigneeName}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-slate-700 font-medium">Assigned: {assigneeName}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className={`text-xs font-semibold rounded-lg px-2.5 py-1 border focus:outline-none ${
                        task.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : task.status === 'in_progress'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
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

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-slate-900">Create Household Task</h3>
                  <p className="text-xs text-slate-500">Shared with {activeGroup?.name || 'Family'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Pick up milk & eggs, Ahmad finish science project"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Details / Instructions (Optional)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Any specific store location, notes, or checklist items..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                            ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <img
                          src={u.avatarUrl}
                          alt={nickname}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="text-xs font-semibold truncate">{nickname}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority ⚠️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Due Date / Time
                </label>
                <input
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="e.g. Today 5 PM, Saturday morning"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#007aff] hover:bg-blue-600 text-white flex items-center gap-1.5 transition shadow-xs"
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
