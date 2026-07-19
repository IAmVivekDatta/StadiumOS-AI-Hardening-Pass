'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StadiumState, Incident, VolunteerTask, VolunteerStatus, GateStatus, IncidentStatus, DensityLevel } from '../types';
import { INITIAL_STADIUM_STATE } from '../constants/mockData';

interface OperationsContextProps {
  state: StadiumState;
  addIncident: (incident: Omit<Incident, 'id' | 'reportedAt'>) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  resolveIncident: (id: string) => void;
  addTask: (task: Omit<VolunteerTask, 'id' | 'assignedToVolunteerId' | 'assignedToVolunteerName'>) => void;
  assignTask: (taskId: string, volunteerId: string | null) => void;
  updateTaskStatus: (taskId: string, status: VolunteerTask['status']) => void;
  updateVolunteerStatus: (volunteerId: string, status: VolunteerStatus) => void;
  updateGateStatus: (gateId: string, status: GateStatus, waitTime?: number) => void;
  // Test utilities for direct state manipulation in tests
  setGateDensity: (gateId: string, density: DensityLevel) => void;
  setTransitStatus: (transitId: string, status: 'on-time' | 'delayed' | 'suspended') => void;
  setZoneDensity: (zoneId: string, density: DensityLevel) => void;
  triggerEmergencyAlert: (message: string) => void;
  clearAlerts: () => void;
  simulateStateTick: () => void;
}

const OperationsContext = createContext<OperationsContextProps | undefined>(undefined);

export function OperationsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StadiumState>(INITIAL_STADIUM_STATE);

  const simulateStateTick = useCallback(() => {
    setState((prev) => {
      // 1. Slightly fluctuate gate wait times
      const updatedGates = prev.gates.map((g) => {
        if (g.status !== 'open') return g;
        // Minor fluctuation
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2 mins
        const nextTime = Math.max(2, g.waitTime + change);
        
        let density: DensityLevel = 'low';
        if (nextTime > 30) density = 'critical';
        else if (nextTime > 20) density = 'high';
        else if (nextTime > 10) density = 'medium';

        return { ...g, waitTime: nextTime, density };
      });

      // 2. Adjust transport wait times slightly
      const updatedTransit = prev.transit.map((t) => {
        if (t.status === 'suspended') return t;
        const change = Math.floor(Math.random() * 3) - 1; // -1 to +1 min
        return { ...t, waitTime: Math.max(2, t.waitTime + change) };
      });

      // 3. Increment energy fluctuation and waste level
      const energyChange = Math.floor(Math.random() * 100) - 50; // -50 to +50 kW
      const newEnergy = Math.max(1800, Math.min(3200, prev.energyUsage + energyChange));
      
      const newWaste = Math.min(100, prev.wasteLevel + (Math.random() > 0.7 ? 1 : 0));

      return {
        ...prev,
        gates: updatedGates,
        transit: updatedTransit,
        energyUsage: newEnergy,
        wasteLevel: newWaste
      };
    });
  }, []);

  // Test utility functions
  const setGateDensity = useCallback((gateId: string, density: DensityLevel) => {
    setState((prev) => ({
      ...prev,
      gates: prev.gates.map((g) => (g.id === gateId ? { ...g, density } : g)),
    }));
  }, []);

  const setTransitStatus = useCallback((transitId: string, status: 'on-time' | 'delayed' | 'suspended') => {
    setState((prev) => ({
      ...prev,
      transit: prev.transit.map((t) => (t.id === transitId ? { ...t, status } : t)),
    }));
  }, []);

  const setZoneDensity = useCallback((zoneId: string, density: DensityLevel) => {
    setState((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => (z.id === zoneId ? { ...z, density } : z)),
    }));
  }, []);

  // Periodic simulation tick to make the command center feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      simulateStateTick();
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [simulateStateTick]);

  const addIncident = useCallback((incidentData: Omit<Incident, 'id' | 'reportedAt'>) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `inc-${Date.now()}`,
      reportedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };

    setState((prev) => {
      // Increment incident counts on the zone
      const updatedZones = prev.zones.map((z) => {
        if (z.id === incidentData.zoneId) {
          return { ...z, incidentsCount: z.incidentsCount + 1 };
        }
        return z;
      });

      return {
        ...prev,
        incidents: [newIncident, ...prev.incidents],
        zones: updatedZones
      };
    });
  }, []);

  const updateIncidentStatus = useCallback((id: string, status: IncidentStatus) => {
    setState((prev) => ({
      ...prev,
      incidents: prev.incidents.map((inc) => (inc.id === id ? { ...inc, status } : inc))
    }));
  }, []);

  const resolveIncident = useCallback((id: string) => {
    setState((prev) => {
      const target = prev.incidents.find((inc) => inc.id === id);
      if (!target) return prev;

      // Decrement incident count on matching zone
      const updatedZones = prev.zones.map((z) => {
        if (z.id === target.zoneId) {
          return { ...z, incidentsCount: Math.max(0, z.incidentsCount - 1) };
        }
        return z;
      });

      return {
        ...prev,
        incidents: prev.incidents.filter((inc) => inc.id !== id),
        zones: updatedZones
      };
    });
  }, []);

  const addTask = useCallback((taskData: Omit<VolunteerTask, 'id' | 'assignedToVolunteerId' | 'assignedToVolunteerName'>) => {
    const newTask: VolunteerTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      assignedToVolunteerId: null,
      assignedToVolunteerName: null
    };

    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  }, []);

  const assignTask = useCallback((taskId: string, volunteerId: string | null) => {
    setState((prev) => {
      const volunteer = volunteerId ? prev.volunteers.find((v) => v.id === volunteerId) : null;
      
      const updatedTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: (volunteerId ? 'in-progress' : 'open') as VolunteerTask['status'],
            assignedToVolunteerId: volunteerId,
            assignedToVolunteerName: volunteer ? volunteer.name : null
          };
        }
        return t;
      });

      return {
        ...prev,
        tasks: updatedTasks
      };
    });
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: VolunteerTask['status']) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            ...(status === 'completed' ? { assignedToVolunteerId: null, assignedToVolunteerName: null } : {})
          };
        }
        return t;
      }).filter((t) => t.status !== 'completed') // remove completed tasks from active dashboard list
    }));
  }, []);

  const updateVolunteerStatus = useCallback((volunteerId: string, status: VolunteerStatus) => {
    setState((prev) => ({
      ...prev,
      volunteers: prev.volunteers.map((v) => (v.id === volunteerId ? { ...v, status } : v))
    }));
  }, []);

  const updateGateStatus = useCallback((gateId: string, status: GateStatus, waitTime?: number) => {
    setState((prev) => ({
      ...prev,
      gates: prev.gates.map((g) => {
        if (g.id === gateId) {
          const nextWait = waitTime !== undefined ? waitTime : g.waitTime;
          let density: DensityLevel = 'low';
          if (status !== 'open') density = 'critical';
          else if (nextWait > 30) density = 'critical';
          else if (nextWait > 20) density = 'high';
          else if (nextWait > 10) density = 'medium';

          return { ...g, status, waitTime: nextWait, density };
        }
        return g;
      })
    }));
  }, []);

  const triggerEmergencyAlert = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      activeAlerts: [message, ...prev.activeAlerts]
    }));
  }, []);

  const clearAlerts = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeAlerts: []
    }));
  }, []);

  return (
    <OperationsContext.Provider
      value={{
        state,
        addIncident,
        updateIncidentStatus,
        resolveIncident,
        addTask,
        assignTask,
        updateTaskStatus,
        updateVolunteerStatus,
        updateGateStatus,
        triggerEmergencyAlert,
        clearAlerts,
        simulateStateTick,
        setGateDensity,
        setTransitStatus,
        setZoneDensity
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
}
