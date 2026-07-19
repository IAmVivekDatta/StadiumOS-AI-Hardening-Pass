import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SettingsProvider } from '../context/SettingsContext';
import { OperationsProvider, useOperations } from '../context/OperationsContext';
import OperationsDashboard from '../features/operations/OperationsDashboard';
import VolunteerTasks from '../features/volunteer/VolunteerTasks';
import TransportPlanner from '../features/transport/TransportPlanner';
import AccessibilityPanel from '../features/accessibility/AccessibilityPanel';
import AIChat from '../features/command-center/AIChat';

import PredictionChart from '../features/crowd-prediction/PredictionChart';
import Home from '../app/page';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Mock next/dynamic to return a simple placeholder in tests
vi.mock('next/dynamic', () => {
  return {
    default: () => {
      const MockChart = () => <div data-testid="prediction-chart-placeholder">Prediction Chart Placeholder</div>;
      MockChart.displayName = 'MockChart';
      return MockChart;
    }
  };
});

// Mock Recharts since it doesn't render SVG correctly in JSDOM and can throw layout warnings
vi.mock('recharts', async () => {
  const original = await vi.importActual<Record<string, unknown>>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div style={{ width: 400, height: 400 }}>{children}</div>,
    AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => <div data-testid="area-chart" data-data={JSON.stringify(data)}>{children}</div>,
    Area: () => <div data-testid="area-chart-area" />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
    CartesianGrid: () => <div />,
  };
});

describe('Feature Components Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  describe('OperationsDashboard', () => {
    it('should render metrics and allow broadcasting emergency alerts', async () => {
      render(
        <SettingsProvider>
          <OperationsProvider>
            <OperationsDashboard />
          </OperationsProvider>
        </SettingsProvider>
      );

      expect(await screen.findByText(/Crowd Capacity/i)).toBeInTheDocument();
      expect(screen.getByText(/Power Usage/i)).toBeInTheDocument();
      expect(screen.getByText(/Waste Index/i)).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/Type emergency alert message/i);
      fireEvent.change(input, { target: { value: 'Critical Alert: Sector North Gate delay' } });
      
      const submitBtn = screen.getByRole('button', { name: /Broadcast/i });
      fireEvent.click(submitBtn);

      expect(input).toHaveValue('');
    });

    it('should allow responding and resolving incidents', async () => {
      render(
        <SettingsProvider>
          <OperationsProvider>
            <OperationsDashboard />
          </OperationsProvider>
        </SettingsProvider>
      );

      expect(await screen.findByText(/Ticket Scanner Failure/i)).toBeInTheDocument();

      const respondBtn = screen.getByRole('button', { name: /Respond Dispatch/i });
      fireEvent.click(respondBtn);

      expect(screen.getAllByText(/Responding.../i).length).toBeGreaterThan(0);

      const resolveBtns = screen.queryAllByTitle(/Resolve incident/i);
      expect(resolveBtns.length).toBeGreaterThan(0);
      fireEvent.click(resolveBtns[0]);
    });
  });

  describe('VolunteerTasks', () => {
    it('should support priority filtering and manual task creation', async () => {
      render(
        <SettingsProvider>
          <OperationsProvider>
            <VolunteerTasks />
          </OperationsProvider>
        </SettingsProvider>
      );

      expect(await screen.findByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /critical/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /critical/i }));
      expect(screen.getByText(/No active tasks found/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));
      expect(screen.getByText(/Create Dispatch Task/i)).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Helper Request' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Escort family at Gate A' } });
      fireEvent.change(screen.getByLabelText(/Est. Completion/i), { target: { value: '15' } });

      fireEvent.click(screen.getByRole('button', { name: /Dispatch/i }));

      fireEvent.click(screen.getByRole('button', { name: /all/i }));
      expect(screen.getByText('New Helper Request')).toBeInTheDocument();
    });

    it('should trigger AI Task Suggestion based on current telemetry', async () => {
      const OperationsHelper = () => {
        const { updateGateStatus, resolveIncident } = useOperations();
        return (
          <div>
            <button onClick={() => updateGateStatus('gate-b', 'open', 10)} data-testid="btn-lower-gate-b">Lower Gate B</button>
            <button onClick={() => {
              resolveIncident('inc-101');
              resolveIncident('inc-102');
              resolveIncident('inc-103');
            }} data-testid="btn-resolve-all">Resolve All</button>
          </div>
        );
      };

      render(
        <SettingsProvider>
          <OperationsProvider>
            <OperationsHelper />
            <VolunteerTasks />
          </OperationsProvider>
        </SettingsProvider>
      );

      expect(await screen.findByText(/Volunteer Dispatch Board/i)).toBeInTheDocument();

      // Path A: Gate B bottleneck suggestion (since Gate B wait time starts at 42m)
      const aiSuggestBtn = screen.getByRole('button', { name: /AI Suggest Task/i });
      fireEvent.click(aiSuggestBtn);
      expect(screen.getByText(/Redirect Gate B Traffic/i)).toBeInTheDocument();

      // Path B: Incident help suggestion (lower Gate B wait time, incidents are still unresolved)
      fireEvent.click(screen.getByTestId('btn-lower-gate-b'));
      fireEvent.click(aiSuggestBtn);
      expect(screen.getByText(/Assist Incident:/i)).toBeInTheDocument();

      // Path C: Crowd control suggestion (resolve incidents, zones are still highly crowded)
      fireEvent.click(screen.getByTestId('btn-resolve-all'));
      fireEvent.click(aiSuggestBtn);
      expect(screen.getByText(/Crowd Control:/i)).toBeInTheDocument();
    });

    it('covers remaining VolunteerTasks UI state branches', () => {
      render(
        <SettingsProvider>
          <OperationsProvider>
            <VolunteerTasks />
          </OperationsProvider>
        </SettingsProvider>
      );

      // Open modal
      fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));
      
      // Change zone selection
      const zoneSelect = screen.getByLabelText(/Zone Location/i);
      fireEvent.change(zoneSelect, { target: { value: 'zone-east' } });

      // Click close modal button
      const closeBtn = screen.getByRole('button', { name: '×' });
      fireEvent.click(closeBtn);

      // Open again and click Cancel button
      fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);
    });
  });

  describe('TransportPlanner', () => {
    it('should render transit schedules and parking capacities', async () => {
      render(
        <SettingsProvider>
          <OperationsProvider>
            <TransportPlanner />
          </OperationsProvider>
        </SettingsProvider>
      );

      expect(await screen.findByText(/Optimal Route Guidance/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Metro Red Line/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Metro Blue Line/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Parking/i).length).toBeGreaterThan(0);
    });
  });

  describe('AccessibilityPanel', () => {
    it('should toggle UI settings on context clicks', () => {
      const { container } = render(
        <SettingsProvider>
          <AccessibilityPanel mapRouteType="none" setMapRouteType={vi.fn()} />
        </SettingsProvider>
      );

      const hcBtn = screen.getByRole('button', { name: /High Contrast/i });
      const simpleBtn = screen.getByRole('button', { name: /Simple English/i });
      const audioBtn = screen.getByRole('button', { name: /Audio Guide/i });

      fireEvent.click(hcBtn);
      fireEvent.click(simpleBtn);
      fireEvent.click(audioBtn);

      expect(hcBtn).toHaveAttribute('aria-pressed', 'true');
      expect(simpleBtn).toHaveAttribute('aria-pressed', 'true');
      expect(audioBtn).toHaveAttribute('aria-pressed', 'true');

      // Click Optimize UI button
      const accModeBtn = container.querySelector('#btn-accessible-mode');
      expect(accModeBtn).toBeInTheDocument();
      fireEvent.click(accModeBtn!);

      // Click font size buttons
      const fontLargeBtn = container.querySelector('#btn-font-large');
      expect(fontLargeBtn).toBeInTheDocument();
      fireEvent.click(fontLargeBtn!);

      const fontExLargeBtn = container.querySelector('#btn-font-extra-large');
      expect(fontExLargeBtn).toBeInTheDocument();
      fireEvent.click(fontExLargeBtn!);

      // Click route overlay buttons
      const routeWcBtn = container.querySelector('#btn-route-wheelchair');
      expect(routeWcBtn).toBeInTheDocument();
      fireEvent.click(routeWcBtn!);
    });
  });

  describe('AIChat', () => {
    it('should support preset prompt selector triggers', async () => {
      const openSettingsMock = vi.fn();
      render(
        <SettingsProvider>
          <OperationsProvider>
            <AIChat onOpenSettings={openSettingsMock} />
          </OperationsProvider>
        </SettingsProvider>
      );

      const input = await screen.findByRole('textbox', { name: '' });
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'input-chat-query');

      const preset = screen.getByRole('button', { name: /Wheelchair Access/i });
      fireEvent.click(preset);

      expect(screen.getByText(/Find wheelchair-friendly entry gates/i)).toBeInTheDocument();
    });

    it('should support text entry and sending chat messages', async () => {
      const { container } = render(
        <SettingsProvider>
          <OperationsProvider>
            <AIChat onOpenSettings={vi.fn()} />
          </OperationsProvider>
        </SettingsProvider>
      );

      const input = await screen.findByRole('textbox', { name: '' });
      expect(input).toHaveAttribute('id', 'input-chat-query');

      fireEvent.change(input, { target: { value: 'Where is the metro?' } });

      const sendBtn = container.querySelector('#btn-send-message');
      expect(sendBtn).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(sendBtn!);
      });

      expect(screen.getByText('Where is the metro?')).toBeInTheDocument();
    });

    it('covers AIChat audioReader speech output and live error handling', async () => {
      // Mock speech synthesis
      const speakMock = vi.fn();
      const cancelMock = vi.fn();
      window.speechSynthesis = {
        speak: speakMock,
        cancel: cancelMock
      } as unknown as SpeechSynthesis;

      // Render AIChat with API key and audioReader active
      localStorage.setItem('stadium_os_settings', JSON.stringify({
        geminiApiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q',
        language: 'en',
        audioReader: true,
        accessibilityMode: false,
        fontSize: 'normal',
        simpleLanguage: false,
        highContrast: false
      }));

      // Mock live query fetch to THROW an error to test the catch block
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('Network operational failure'));

      const { container } = render(
        <SettingsProvider>
          <OperationsProvider>
            <AIChat onOpenSettings={vi.fn()} />
          </OperationsProvider>
        </SettingsProvider>
      );

      // Ask a query to trigger the error catch block
      const input = container.querySelector('#input-chat-query');
      expect(input).toBeInTheDocument();
      fireEvent.change(input!, { target: { value: 'Tell me about wheelchair access' } });
      
      const sendBtn = container.querySelector('#btn-send-message');
      await act(async () => {
        fireEvent.click(sendBtn!);
      });

      // Verify offline fallback response is displayed (since askGemini catches network errors and falls back to offline help info)
      expect(await screen.findByText(/Wheelchair accessibility details/i)).toBeInTheDocument();

      // Verify speech synthesis was called
      expect(cancelMock).toHaveBeenCalled();
      expect(speakMock).toHaveBeenCalled();

      global.fetch = originalFetch;
    });
  });

  describe('PredictionChart', () => {
    it('should render area charts and explain forecast on click', async () => {
      // Set valid API key in local storage so askGemini runs the fetch path rather than offline fallback
      localStorage.setItem('stadium_os_settings', JSON.stringify({
        geminiApiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q',
        language: 'en',
        accessibilityMode: false,
        fontSize: 'normal',
        simpleLanguage: false,
        highContrast: false,
        audioReader: false
      }));

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'This is the AI crowd forecast analysis.' }] } }]
        })
      });

      render(
        <SettingsProvider>
          <OperationsProvider>
            <PredictionChart />
          </OperationsProvider>
        </SettingsProvider>
      );

      expect(await screen.findByText(/Crowd Congestion & Wait-Time Forecast/i)).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getByText(/Peak Alert/i)).toBeInTheDocument();

      const explainBtn = screen.getByRole('button', { name: /Explain Forecast/i });
      await act(async () => {
        fireEvent.click(explainBtn);
      });

      expect(await screen.findByText('This is the AI crowd forecast analysis.')).toBeInTheDocument();

      global.fetch = originalFetch;
    });
  });

  describe('Main Page Grid Component', () => {
    it('renders entire dashboard grid deck and controls settings modal', async () => {
      const { container } = render(
        <SettingsProvider>
          <OperationsProvider>
            <Home />
          </OperationsProvider>
        </SettingsProvider>
      );

      // Verify dashboard header is present (using findAllByText to handle header title and chat welcome instances)
      expect((await screen.findAllByText(/StadiumOS AI/i)).length).toBeGreaterThan(0);

      // Click "Simulate Telemetry Tick"
      const tickBtn = screen.getByRole('button', { name: /Simulate Telemetry Tick/i });
      fireEvent.click(tickBtn);

      // Click Settings button by its ID
      const configBtn = container.querySelector('#btn-header-settings');
      expect(configBtn).toBeInTheDocument();
      fireEvent.click(configBtn!);

      // Verify modal is displayed
      expect(screen.getByText(/Configure Operational Keys/i)).toBeInTheDocument();

      // Enter API key and save
      const input = screen.getByPlaceholderText(/Paste your AIzaSy... API key/i);
      fireEvent.change(input, { target: { value: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q' } });

      const saveBtn = container.querySelector('#btn-save-key-settings');
      expect(saveBtn).toBeInTheDocument();
      fireEvent.click(saveBtn!);

      // Modal should be gone
      expect(screen.queryByText(/Configure Operational Keys/i)).not.toBeInTheDocument();

      // Open settings again to test clearing key path
      fireEvent.click(configBtn!);
      const clearBtn = container.querySelector('#btn-clear-key');
      expect(clearBtn).toBeInTheDocument();
      fireEvent.click(clearBtn!);
      
      // Test Cancel button inside modal
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);
      expect(screen.queryByText(/Configure Operational Keys/i)).not.toBeInTheDocument();

      // Click voice emulation microphone button
      const voiceBtn = container.querySelector('#btn-voice-emulate');
      expect(voiceBtn).toBeInTheDocument();
      fireEvent.click(voiceBtn!);

      // Dismiss top operational alert
      const dismissBtn = container.querySelector('#btn-dismiss-top-alert');
      expect(dismissBtn).toBeInTheDocument();
      fireEvent.click(dismissBtn!);

      // Complete a volunteer task
      const completeTaskBtns = screen.queryAllByTitle(/Complete task/i);
      if (completeTaskBtns.length > 0) {
        fireEvent.click(completeTaskBtns[0]);
      }

      // Change languages in the chatbot language dropdown to cover translation triggers
      const selectLang = container.querySelector('#select-lang');
      if (selectLang) {
        fireEvent.change(selectLang, { target: { value: 'es' } });
        fireEvent.change(selectLang, { target: { value: 'fr' } });
        fireEvent.change(selectLang, { target: { value: 'pt' } });
        fireEvent.change(selectLang, { target: { value: 'ar' } });
        fireEvent.change(selectLang, { target: { value: 'en' } });
      }

      // Create a task of medical category and high priority to cover volunteer task select fields
      fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Medical Task' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Medical spill help' } });
      fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'high' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'medical' } });
      fireEvent.click(container.querySelector('#btn-submit-task')!);

      // Loop and click StadiumMap interactive elements to cover map selection card state transitions
      const stands = screen.queryAllByRole('button', { name: /Stand:/i });
      if (stands.length > 0) fireEvent.click(stands[0]);

      const facilities = screen.queryAllByRole('button', { name: /Facility:/i });
      if (facilities.length > 0) fireEvent.click(facilities[0]);

      const gates = screen.queryAllByRole('button', { name: /Gate/i });
      if (gates.length > 0) fireEvent.click(gates[0]);
    });
  });

  describe('ErrorBoundary', () => {
    const ProblematicComponent = () => {
      throw new Error('Test rendering crash');
    };

    it('should catch rendering errors and render a recovery screen', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary fallbackTitle="Custom Fallback Test">
          <ProblematicComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Fallback Test')).toBeInTheDocument();
      expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Render/i })).toBeInTheDocument();

      spy.mockRestore();
    });
  });
});
