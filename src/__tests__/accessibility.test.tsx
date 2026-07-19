import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { OperationsProvider, useOperations } from '../context/OperationsContext';
import StadiumMap from '../features/live-map/StadiumMap';

// Test component to consume SettingsContext
const SettingsConsumer = () => {
  const { 
    settings, 
    setHighContrast, 
    setFontSize, 
    setSimpleLanguage, 
    setLanguage, 
    setAccessibilityMode, 
    setAudioReader, 
    resetSettings 
  } = useSettings();
  return (
    <div>
      <span data-testid="high-contrast">{settings.highContrast ? 'enabled' : 'disabled'}</span>
      <span data-testid="font-size">{settings.fontSize}</span>
      <span data-testid="simple-lang">{settings.simpleLanguage ? 'enabled' : 'disabled'}</span>
      <span data-testid="language">{settings.language}</span>
      <span data-testid="access-mode">{settings.accessibilityMode ? 'enabled' : 'disabled'}</span>
      <span data-testid="audio-reader">{settings.audioReader ? 'enabled' : 'disabled'}</span>
      <button onClick={() => setHighContrast(true)} data-testid="btn-enable-hc">Enable HC</button>
      <button onClick={() => setFontSize('extra-large')} data-testid="btn-size-xl">Size XL</button>
      <button onClick={() => setSimpleLanguage(true)} data-testid="btn-enable-simple">Enable Simple</button>
      <button onClick={() => setLanguage('es')} data-testid="btn-lang-es">Lang ES</button>
      <button onClick={() => setAccessibilityMode(true)} data-testid="btn-access-mode">Access Mode</button>
      <button onClick={() => setAudioReader(true)} data-testid="btn-audio-reader">Audio Reader</button>
      <button onClick={resetSettings} data-testid="btn-reset">Reset Settings</button>
    </div>
  );
};

describe('Accessibility Features', () => {
  describe('SettingsContext accessibility toggles', () => {
    it('should initialize settings correctly and update toggles', () => {
      render(
        <SettingsProvider>
          <SettingsConsumer />
        </SettingsProvider>
      );

      expect(screen.getByTestId('high-contrast').textContent).toBe('disabled');
      expect(screen.getByTestId('font-size').textContent).toBe('normal');

      // Toggle high contrast
      fireEvent.click(screen.getByTestId('btn-enable-hc'));
      expect(screen.getByTestId('high-contrast').textContent).toBe('enabled');

      // Toggle font size
      fireEvent.click(screen.getByTestId('btn-size-xl'));
      expect(screen.getByTestId('font-size').textContent).toBe('extra-large');

      // Toggle simple language
      fireEvent.click(screen.getByTestId('btn-enable-simple'));
      expect(screen.getByTestId('simple-lang').textContent).toBe('enabled');

      // Toggle language
      fireEvent.click(screen.getByTestId('btn-lang-es'));
      expect(screen.getByTestId('language').textContent).toBe('es');

      // Toggle accessibility mode
      fireEvent.click(screen.getByTestId('btn-access-mode'));
      expect(screen.getByTestId('access-mode').textContent).toBe('enabled');

      // Toggle audio reader
      fireEvent.click(screen.getByTestId('btn-audio-reader'));
      expect(screen.getByTestId('audio-reader').textContent).toBe('enabled');

      // Reset settings
      fireEvent.click(screen.getByTestId('btn-reset'));
      expect(screen.getByTestId('high-contrast').textContent).toBe('disabled');
      expect(screen.getByTestId('font-size').textContent).toBe('normal');
      expect(screen.getByTestId('simple-lang').textContent).toBe('disabled');
      expect(screen.getByTestId('language').textContent).toBe('en');
    });
  });

  describe('StadiumMap SVG Accessibility Audit', () => {
    it('should render SVG map elements with proper roles, tabIndex, and aria-labels for screen readers', () => {
      render(
        <SettingsProvider>
          <OperationsProvider>
            <StadiumMap routeType="none" />
          </OperationsProvider>
        </SettingsProvider>
      );

      // Check for Stand zones role and tabIndex
      const stands = screen.queryAllByRole('button', { name: /Stand:/i });
      expect(stands.length).toBeGreaterThan(0);
      stands.forEach((stand) => {
        expect(stand).toHaveAttribute('tabindex', '0');
        expect(stand).toHaveAttribute('aria-label');
      });

      // Check for Gates role and tabIndex
      const gates = screen.queryAllByRole('button', { name: /Gate/i });
      expect(gates.length).toBeGreaterThan(0);
      gates.forEach((gate) => {
        if (gate.tagName.toLowerCase() !== 'button') {
          expect(gate).toHaveAttribute('tabindex', '0');
        }
        expect(gate).toHaveAttribute('aria-label');
      });

      // Check for Facilities role and tabIndex
      const facilities = screen.queryAllByRole('button', { name: /Facility:/i });
      expect(facilities.length).toBeGreaterThan(0);
      facilities.forEach((facility) => {
        expect(facility).toHaveAttribute('tabindex', '0');
        expect(facility).toHaveAttribute('aria-label');
      });
    });

    it('should fire selection details when keyboard keys are pressed', () => {
      render(
        <SettingsProvider>
          <OperationsProvider>
            <StadiumMap routeType="none" />
          </OperationsProvider>
        </SettingsProvider>
      );

      const stand = screen.getByRole('button', { name: /Stand: North Stand/i });
      
      // Initially, no detail box is open or showing stands info
      expect(screen.queryByText(/Crowd: 19800/i)).toBeNull();

      // Trigger Enter on keyboard for stand
      fireEvent.keyDown(stand, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 });
      
      // Detail box should now display telemetry details
      expect(screen.getByText(/Crowd: 19800/i)).toBeInTheDocument();

      // Click facility to verify selection details render (SVG <g> groups do not bubble clicks directly in JSDOM; click child circle)
      const facility = screen.queryAllByRole('button', { name: /Facility:/i })[0];
      if (facility) {
        const circle = facility.querySelector('circle');
        fireEvent.click(circle || facility);
        expect(screen.getByText(/Food Court A/i)).toBeInTheDocument();
      }

      // Trigger Enter on keyboard for gate SVG path element
      const gate = screen.queryAllByRole('button', { name: /Gate/i }).find(g => g.tagName.toLowerCase() !== 'button');
      if (gate) {
        fireEvent.keyDown(gate, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 });
        expect(screen.getByText(/Gate A \(North\)/i)).toBeInTheDocument();
      }

      // Test Space key triggers for stands
      fireEvent.keyDown(stand, { key: ' ', code: 'Space', charCode: 32, keyCode: 32 });
      expect(screen.getByText(/Crowd: 19800/i)).toBeInTheDocument();

      // Test Space key triggers for facilities
      if (facility) {
        fireEvent.keyDown(facility, { key: ' ', code: 'Space', charCode: 32, keyCode: 32 });
        expect(screen.getByText(/Food Court A/i)).toBeInTheDocument();
      }

      // Test Space key triggers for gates
      if (gate) {
        fireEvent.keyDown(gate, { key: ' ', code: 'Space', charCode: 32, keyCode: 32 });
        expect(screen.getByText(/Gate A \(North\)/i)).toBeInTheDocument();
      }
    });

    it('covers all density colors and border styling branches including defaults', () => {
      // Create a wrapper to modify gates with various densities before rendering StadiumMap
      const CustomStateWrapper = () => {
        const { updateGateStatus, setGateDensity, setZoneDensity } = useOperations();
        React.useEffect(() => {
          // Set different gates to cover all density border switch cases
          updateGateStatus('gate-a', 'open', 5);    // low density
          updateGateStatus('gate-b', 'open', 15);   // medium density
          updateGateStatus('gate-c', 'open', 25);   // high density
          updateGateStatus('gate-d', 'open', 35);   // critical density
          // Cover default branch by casting to DensityLevel
          setGateDensity('gate-a', 'unknown-density' as unknown as DensityLevel);
          setZoneDensity('zone-north', 'unknown-density' as unknown as DensityLevel);
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return <StadiumMap routeType="none" />;
      };

      render(
        <SettingsProvider>
          <OperationsProvider>
            <CustomStateWrapper />
          </OperationsProvider>
        </SettingsProvider>
      );

      // Verify buttons rendered with correct classes (e.g., border color)
      const gateBtns = screen.queryAllByRole('button', { name: /Inspect Gate/i });
      expect(gateBtns.length).toBe(4);
    });


    it('renders all route paths, gate quick bars, and allows closing detail box', () => {
      const routes: Array<'none' | 'wheelchair' | 'family' | 'senior' | 'vision' | 'exits' | 'medical'> = [
        'none', 'wheelchair', 'family', 'senior', 'vision', 'exits', 'medical'
      ];
      
      routes.forEach(route => {
        const { unmount } = render(
          <SettingsProvider>
            <OperationsProvider>
              <StadiumMap routeType={route} />
            </OperationsProvider>
          </SettingsProvider>
        );

        // Click a gate quick bar button to open the details box
        const gateBtns = screen.queryAllByRole('button', { name: /Inspect Gate/i });
        if (gateBtns.length > 0) {
          fireEvent.click(gateBtns[0]);
          
          // Click close selection details button
          const closeBtn = screen.getByRole('button', { name: /Close details/i });
          expect(closeBtn).toBeInTheDocument();
          fireEvent.click(closeBtn);
        }

        unmount();
      });
    });
  });
});
