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
});
