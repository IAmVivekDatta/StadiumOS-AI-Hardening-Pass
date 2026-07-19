'use client';

import React, { useState, useMemo } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { VolunteerTask, TaskPriority } from '../../types';
import { sanitizeInput } from '../../services/securityUtils';
import { 
  ClipboardList, 
  Plus, 
  Clock, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle,
  Accessibility,
  Flame,
  Wrench,
  Info
} from 'lucide-react';

const getPriorityColor = (prio: TaskPriority) => {
  switch (prio) {
    case 'low': return 'bg-neutral-800 text-neutral-400 border-neutral-750';
    case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'critical': return 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse';
  }
};

const getCategoryIcon = (cat: VolunteerTask['category']) => {
  switch (cat) {
    case 'accessibility': return <Accessibility className="w-3.5 h-3.5 text-blue-400" />;
    case 'crowd': return <Flame className="w-3.5 h-3.5 text-orange-400" />;
    case 'medical': return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
    case 'info': return <Info className="w-3.5 h-3.5 text-indigo-400" />;
    case 'facility': return <Wrench className="w-3.5 h-3.5 text-emerald-400" />;
  }
};

export default function VolunteerTasks() {
  const { state, addTask, assignTask, updateTaskStatus } = useOperations();
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Custom states for manual task creator
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<VolunteerTask['category']>('info');
  const [zoneId, setZoneId] = useState('zone-concourse');
  const [eta, setEta] = useState(10);

  const handleGenerateAiTask = () => {
    // Dynamically generate an AI task based on current telemetry
    const gateBWait = state.gates.find(g => g.id === 'gate-b')?.waitTime || 0;
    const criticalZones = state.zones.filter(z => z.density === 'critical' || z.density === 'high');
    const unresolvedIncidents = state.incidents.filter(inc => inc.status !== 'resolved');

    let aiTitle = 'Accessibility Telemetry Sweep';
    let aiDesc = 'Examine elevator call buttons in West concourse to ensure zero delay accessibility entries.';
    let aiPrio: TaskPriority = 'medium';
    let aiCat: VolunteerTask['category'] = 'accessibility';
    let aiZone = 'zone-west';
    let aiEta = 12;

    if (gateBWait > 35) {
      aiTitle = 'Redirect Gate B Traffic';
      aiDesc = `Queue length at Gate B exceeds 40 mins due to scanner failure. Station helpers to guide guests toward Gate D (West).`;
      aiPrio = 'critical';
      aiCat = 'crowd';
      aiZone = 'zone-east';
      aiEta = 20;
    } else if (unresolvedIncidents.length > 0) {
      const targetInc = unresolvedIncidents[0];
      aiTitle = `Assist Incident: ${targetInc.title}`;
      aiDesc = `Operational dispatch: Deploy near ${targetInc.zoneName} to assist staff responding to: "${targetInc.description}".`;
      aiPrio = targetInc.severity === 'high' ? 'high' : 'medium';
      aiCat = targetInc.title.toLowerCase().includes('spill') ? 'facility' : 'info';
      aiZone = targetInc.zoneId;
      aiEta = 15;
    } else if (criticalZones.length > 0) {
      const zone = criticalZones[0];
      aiTitle = `Crowd Control: ${zone.name}`;
      aiDesc = `Telemetry signals high crowd density. Direct guests to flow through concourses evenly.`;
      aiPrio = 'high';
      aiCat = 'crowd';
      aiZone = zone.id;
      aiEta = 10;
    }

    addTask({
      title: `[AI Dev] ${aiTitle}`,
      description: aiDesc,
      priority: aiPrio,
      status: 'open',
      category: aiCat,
      zoneId: aiZone,
      eta: aiEta
    });
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    addTask({
      title: sanitizeInput(title),
      description: sanitizeInput(description),
      priority,
      status: 'open',
      category,
      zoneId,
      eta: Number(eta)
    });

    setTitle('');
    setDescription('');
    setShowCreateModal(false);
  };

  const filteredTasks = useMemo(() => {
    return state.tasks.filter((t) => {
      if (filterPriority === 'all') return true;
      return t.priority === filterPriority;
    });
  }, [state.tasks, filterPriority]);

  const activeVolunteers = useMemo(() => {
    return state.volunteers.filter(v => v.status === 'active');
  }, [state.volunteers]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-indigo-400" />
            Volunteer Dispatch Board
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Create, assign, and track helper tasks across stadium quadrants.
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleGenerateAiTask}
            className="px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/25 text-indigo-300 text-[10px] font-semibold rounded-md transition-colors"
            title="Automatically generates a task from current bottlenecks"
            id="btn-ai-generate-task"
          >
            AI Suggest Task
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-neutral-200 text-black text-[10px] font-semibold rounded-md transition-colors"
            id="btn-open-create-task"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Task
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 border-b border-neutral-800 pb-2">
        {['all', 'critical', 'high', 'medium', 'low'].map((prio) => (
          <button
            key={prio}
            onClick={() => setFilterPriority(prio)}
            className={`px-2.5 py-1 text-[10px] rounded-full border transition-all capitalize font-medium ${
              filterPriority === prio
                ? 'bg-neutral-800 border-neutral-700 text-white'
                : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
            id={`btn-filter-task-${prio}`}
          >
            {prio}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-neutral-800 rounded-lg text-neutral-500 text-[11px]">
            No active tasks found in the selected priority queue.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-neutral-950 border border-neutral-850 rounded-lg p-3.5 space-y-2.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-neutral-900 border border-neutral-800">
                    {getCategoryIcon(task.category)}
                  </div>
                  <h3 className="text-xs font-semibold text-white leading-snug">{task.title}</h3>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 leading-normal">{task.description}</p>

              {/* Assignment Bar */}
              <div className="flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-800/40 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>ETA: <strong>{task.eta}m</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Dropdown to assign active volunteers */}
                  <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded-md">
                    <UserPlus className="w-3 h-3 text-neutral-500" />
                    <select
                      value={task.assignedToVolunteerId || ''}
                      onChange={(e) => assignTask(task.id, e.target.value || null)}
                      className="bg-transparent text-[10px] text-neutral-300 focus:outline-none cursor-pointer border-none font-medium"
                      id={`select-assign-task-${task.id}`}
                    >
                      <option value="" className="bg-neutral-950 text-neutral-400">Unassigned</option>
                      {activeVolunteers.map(vol => (
                        <option key={vol.id} value={vol.id} className="bg-neutral-950 text-neutral-300">
                          {vol.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Complete Button */}
                  <button
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="p-1 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30 rounded"
                    title="Complete task"
                    id={`btn-complete-task-${task.id}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Manual Task Creator Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl animate-scale-pulse">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Create Dispatch Task</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-500 hover:text-white font-bold"
                id="btn-close-modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-3.5">
              <div>
                <label htmlFor="input-task-title" className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  id="input-task-title"
                />
              </div>

              <div>
                <label htmlFor="input-task-desc" className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed instructions..."
                  className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
                  id="input-task-desc"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="select-task-prio" className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    id="select-task-prio"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="select-task-cat" className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VolunteerTask['category'])}
                    className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    id="select-task-cat"
                  >
                    <option value="accessibility">Accessibility</option>
                    <option value="crowd">Crowd Control</option>
                    <option value="medical">Medical Help</option>
                    <option value="info">Information Desk</option>
                    <option value="facility">Facilities</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="select-task-zone" className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Zone Location</label>
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    id="select-task-zone"
                  >
                    {state.zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name.split(' ')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="input-task-eta" className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Est. Completion (m)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={eta}
                    onChange={(e) => setEta(Number(e.target.value))}
                    className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    id="input-task-eta"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition-colors"
                  id="btn-submit-task"
                >
                  Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
