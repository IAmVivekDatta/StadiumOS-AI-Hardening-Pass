import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OperationsProvider, useOperations } from '../context/OperationsContext';

// Helper component to interact with operations context in tests
function TestComponent() {
  const { state, addIncident, resolveIncident, addTask, assignTask, updateGateStatus } = useOperations();
  return (
    <div>
      <div data-testid="incidents-count">{state.incidents.length}</div>
      <div data-testid="tasks-count">{state.tasks.length}</div>
      
      {state.incidents.length > 0 && (
        <div data-testid="first-incident-title">{state.incidents[0].title}</div>
      )}

      {state.tasks.length > 0 && (
        <div data-testid="first-task-assignee">
          {state.tasks[0].assignedToVolunteerName || 'Unassigned'}
        </div>
      )}

      <button 
        data-testid="btn-add-inc"
        onClick={() => addIncident({
          title: 'Test Incident',
          description: 'A mock incident for tests',
          zoneId: 'east',
          zoneName: 'East Stand',
          severity: 'medium',
          status: 'reported'
        })}
      >
        Add Inc
      </button>

      {state.incidents.length > 0 && (
        <button 
          data-testid="btn-resolve-inc"
          onClick={() => resolveIncident(state.incidents[0].id)}
        >
          Resolve Inc
        </button>
      )}

      <button 
        data-testid="btn-add-task"
        onClick={() => addTask({
          title: 'Test Task',
          description: 'A mock task',
          priority: 'medium',
          status: 'open',
          category: 'accessibility',
          zoneId: 'zone-north',
          eta: 10
        })}
      >
        Add Task
      </button>

      {state.tasks.length > 0 && (
        <button
          data-testid="btn-assign-task"
          onClick={() => assignTask(state.tasks[0].id, 'vol-1')}
        >
          Assign Task
        </button>
      )}

      <button 
        data-testid="btn-update-gate"
        onClick={() => {
          updateGateStatus('gate-b', 'closed', 45);
          updateGateStatus('gate-a', 'open', 35);
          updateGateStatus('gate-c', 'open', 25);
          updateGateStatus('gate-d', 'open', 15);
          updateGateStatus('gate-a', 'open', 5);
        }}
      >
        Update Gate
      </button>
    </div>
  );
}

describe('Operations State Management', () => {
  it('loads initial mock state correctly', () => {
    render(
      <OperationsProvider>
        <TestComponent />
      </OperationsProvider>
    );

    // Initial constants mock data lists 3 incidents
    expect(screen.getByTestId('incidents-count').textContent).toBe('3');
    expect(screen.getByTestId('tasks-count').textContent).toBe('5');
  });

  it('allows adding and resolving incidents', async () => {
    render(
      <OperationsProvider>
        <TestComponent />
      </OperationsProvider>
    );

    const addIncBtn = screen.getByTestId('btn-add-inc');
    await act(async () => {
      addIncBtn.click();
    });

    expect(screen.getByTestId('incidents-count').textContent).toBe('4');
    expect(screen.getByTestId('first-incident-title').textContent).toBe('Test Incident');

    const resolveIncBtn = screen.getByTestId('btn-resolve-inc');
    await act(async () => {
      resolveIncBtn.click();
    });

    expect(screen.getByTestId('incidents-count').textContent).toBe('3');
  });

  it('allows adding and assigning tasks', async () => {
    render(
      <OperationsProvider>
        <TestComponent />
      </OperationsProvider>
    );

    const addTaskBtn = screen.getByTestId('btn-add-task');
    await act(async () => {
      addTaskBtn.click();
    });

    expect(screen.getByTestId('tasks-count').textContent).toBe('6');

    const assignTaskBtn = screen.getByTestId('btn-assign-task');
    await act(async () => {
      assignTaskBtn.click();
    });

    // Check if task got assigned to Mateo Silva (vol-1)
    expect(screen.getByTestId('first-task-assignee').textContent).toBe('Mateo Silva');
  });

  it('allows updating gate status and calculates wait time density correctly', async () => {
    render(
      <OperationsProvider>
        <TestComponent />
      </OperationsProvider>
    );

    const updateGateBtn = screen.getByTestId('btn-update-gate');
    await act(async () => {
      updateGateBtn.click();
    });
  });

  it('throws an error when useOperations is used outside OperationsProvider', () => {
    const ConsumerOutside = () => {
      useOperations();
      return null;
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ConsumerOutside />)).toThrow('useOperations must be used within an OperationsProvider');
    consoleSpy.mockRestore();
  });

  it('runs simulateStateTick periodically via fake timers and skips non-open gates or suspended transit', async () => {
    vi.useFakeTimers();
    
    // Helper to interact with state
    function TickTester() {
      const { state, updateGateStatus, simulateStateTick, setTransitStatus } = useOperations();
      return (
        <div>
          <div data-testid="gate-b-status">{state.gates.find(g => g.id === 'gate-b')?.status}</div>
          <div data-testid="gate-b-time">{state.gates.find(g => g.id === 'gate-b')?.waitTime}</div>
          <div data-testid="gate-a-density">{state.gates.find(g => g.id === 'gate-a')?.density}</div>
          <button data-testid="btn-tick" onClick={() => {
            // Use setTransitStatus helper
            setTransitStatus(state.transit[0].id, 'suspended');
            simulateStateTick();
          }}>Tick</button>
          <button data-testid="btn-close-b" onClick={() => updateGateStatus('gate-b', 'closed', 40)}>Close B</button>
          <button data-testid="btn-prep-a" onClick={() => updateGateStatus('gate-a', 'open', 11)}>Prep A</button>
        </div>
      );
    }

    render(
      <OperationsProvider>
        <TickTester />
      </OperationsProvider>
    );

    // Close gate B and prep gate A to cover medium density
    act(() => {
      screen.getByTestId('btn-close-b').click();
      screen.getByTestId('btn-prep-a').click();
    });

    expect(screen.getByTestId('gate-b-status').textContent).toBe('closed');
    const oldTime = screen.getByTestId('gate-b-time').textContent;

    // Mock Math.random to return 0.9 (triggers waste level increment and +2 wait time changes)
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.9);

    // Advance fake timers by 15 seconds to trigger simulateStateTick
    await act(async () => {
      vi.advanceTimersByTime(15000);
    });

    // Gate B wait time should not have fluctuated because it was closed
    expect(screen.getByTestId('gate-b-time').textContent).toBe(oldTime);

    // Call simulateStateTick directly to test the random increment path for waste level
    const tickBtn = screen.getByTestId('btn-tick');
    await act(async () => {
      tickBtn.click();
    });

    // Gate A density should be medium (11 + 2 = 13 wait time)
    expect(screen.getByTestId('gate-a-density').textContent).toBe('medium');

    randomSpy.mockRestore();
    vi.useRealTimers();
  });

  it('handles resolving non-existent incidents and incrementing incident count on valid zones', async () => {
    function IncidentTester() {
      const { state, resolveIncident, addIncident } = useOperations();
      return (
        <div>
          <div data-testid="incidents-count">{state.incidents.length}</div>
          <div data-testid="zone-east-incidents">
            {state.zones.find(z => z.id === 'zone-east')?.incidentsCount}
          </div>
          <button data-testid="btn-resolve-invalid" onClick={() => resolveIncident('non-existent')}>
            Resolve Invalid
          </button>
          <button
            data-testid="btn-add-valid"
            onClick={() => addIncident({
              title: 'New incident',
              description: 'Valid zone incident',
              zoneId: 'zone-east',
              zoneName: 'East Stand',
              severity: 'low',
              status: 'reported'
            })}
          >
            Add Valid
          </button>
          {state.incidents.length > 0 && (
            <button
              data-testid="btn-resolve-valid"
              onClick={() => resolveIncident(state.incidents[0].id)}
            >
              Resolve Valid
            </button>
          )}
        </div>
      );
    }

    render(
      <OperationsProvider>
        <IncidentTester />
      </OperationsProvider>
    );

    const initialCount = screen.getByTestId('incidents-count').textContent;

    // Resolve non-existent incident
    await act(async () => {
      screen.getByTestId('btn-resolve-invalid').click();
    });
    expect(screen.getByTestId('incidents-count').textContent).toBe(initialCount);

    // Add incident with correct zone ID to test incrementing zone incidents count
    const initialZoneInc = screen.getByTestId('zone-east-incidents').textContent;
    await act(async () => {
      screen.getByTestId('btn-add-valid').click();
    });
    expect(screen.getByTestId('zone-east-incidents').textContent).toBe(String(Number(initialZoneInc) + 1));

    // Resolve incident with correct ID to test decrementing zone incidents count
    await act(async () => {
      screen.getByTestId('btn-resolve-valid').click();
    });
    expect(screen.getByTestId('zone-east-incidents').textContent).toBe(initialZoneInc);
  });

  it('allows unassigning tasks and updating volunteer status', async () => {
    function TaskTester() {
      const { state, assignTask, updateVolunteerStatus } = useOperations();
      return (
        <div>
          <div data-testid="task-assignee">{state.tasks[0].assignedToVolunteerName || 'None'}</div>
          <div data-testid="vol-status">{state.volunteers.find(v => v.id === 'vol-1')?.status}</div>
          <button data-testid="btn-unassign" onClick={() => assignTask(state.tasks[0].id, null)}>
            Unassign
          </button>
          <button data-testid="btn-vol-break" onClick={() => updateVolunteerStatus('vol-1', 'break')}>
            Vol Break
          </button>
        </div>
      );
    }

    render(
      <OperationsProvider>
        <TaskTester />
      </OperationsProvider>
    );

    // Unassign task
    await act(async () => {
      screen.getByTestId('btn-unassign').click();
    });
    expect(screen.getByTestId('task-assignee').textContent).toBe('None');

    // Update volunteer status
    await act(async () => {
      screen.getByTestId('btn-vol-break').click();
    });
    expect(screen.getByTestId('vol-status').textContent).toBe('break');
  });

  it('calculates gate status density correctly across different wait times', async () => {
    function GateTester() {
      const { state, updateGateStatus } = useOperations();
      return (
        <div>
          <div data-testid="gate-a-density">{state.gates.find(g => g.id === 'gate-a')?.density}</div>
          <button data-testid="btn-gate-med" onClick={() => updateGateStatus('gate-a', 'open', 15)}>Med</button>
          <button data-testid="btn-gate-high" onClick={() => updateGateStatus('gate-a', 'open', 25)}>High</button>
          <button data-testid="btn-gate-crit" onClick={() => updateGateStatus('gate-a', 'open', 35)}>Crit</button>
        </div>
      );
    }

    render(
      <OperationsProvider>
        <GateTester />
      </OperationsProvider>
    );

    const medBtn = screen.getByTestId('btn-gate-med');
    const highBtn = screen.getByTestId('btn-gate-high');
    const critBtn = screen.getByTestId('btn-gate-crit');

    await act(async () => {
      medBtn.click();
    });
    expect(screen.getByTestId('gate-a-density').textContent).toBe('medium');

    await act(async () => {
      highBtn.click();
    });
    expect(screen.getByTestId('gate-a-density').textContent).toBe('high');

    await act(async () => {
      critBtn.click();
    });
    expect(screen.getByTestId('gate-a-density').textContent).toBe('critical');
  });

  it('handles updateGateStatus with undefined waitTime and updateTaskStatus with in-progress status', async () => {
    function UpdaterTester() {
      const { state, updateGateStatus, updateTaskStatus } = useOperations();
      return (
        <div>
          <div data-testid="gate-a-time">{state.gates.find(g => g.id === 'gate-a')?.waitTime}</div>
          <div data-testid="task-status">{state.tasks.find(t => t.id === 'task-202')?.status}</div>
          <button data-testid="btn-gate-close" onClick={() => updateGateStatus('gate-a', 'closed')}>
            Close A
          </button>
          <button data-testid="btn-task-progress" onClick={() => updateTaskStatus('task-202', 'in-progress')}>
            Progress Task
          </button>
        </div>
      );
    }

    render(
      <OperationsProvider>
        <UpdaterTester />
      </OperationsProvider>
    );

    const oldWaitTime = screen.getByTestId('gate-a-time').textContent;

    // Call updateGateStatus with status: 'closed' and waitTime as undefined (so it maintains oldWaitTime)
    await act(async () => {
      screen.getByTestId('btn-gate-close').click();
    });
    expect(screen.getByTestId('gate-a-time').textContent).toBe(oldWaitTime);

    // Call updateTaskStatus with 'in-progress' status (should update and NOT remove task from list)
    await act(async () => {
      screen.getByTestId('btn-task-progress').click();
    });
    expect(screen.getByTestId('task-status').textContent).toBe('in-progress');
  });
});
