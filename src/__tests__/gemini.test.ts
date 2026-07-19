import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askGemini } from '../services/geminiService';
import { INITIAL_STADIUM_STATE } from '../constants/mockData';
import { UserSettings } from '../types';

const defaultSettings: UserSettings = {
  geminiApiKey: '', // empty to test mock responses
  language: 'en',
  accessibilityMode: false,
  fontSize: 'normal',
  simpleLanguage: false,
  highContrast: false,
  audioReader: false
};

describe('Gemini AI Service / Fallbacks', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('correctly matches queries and returns local mock replies when API key is missing', async () => {
    const responseGates = await askGemini('Which gate is fastest?', INITIAL_STADIUM_STATE, defaultSettings);
    expect(responseGates).toContain('Gate D');
    expect(responseGates).toContain('5 minutes');

    const responseAccess = await askGemini('wheelchair accessible entrances', INITIAL_STADIUM_STATE, defaultSettings);
    expect(responseAccess).toContain('Wheelchair accessibility');
    expect(responseAccess).toContain('Gate D');

    const responseTransit = await askGemini('how to get home metro blue line', INITIAL_STADIUM_STATE, defaultSettings);
    expect(responseTransit).toContain('Metro Red Line');
    expect(responseTransit).toContain('Metro Blue Line');
  });

  it('translates fallback replies to Spanish if settings language is "es"', async () => {
    const spanishSettings = { ...defaultSettings, language: 'es' };
    const response = await askGemini('puertas de entrada', INITIAL_STADIUM_STATE, spanishSettings);
    expect(response).toContain('Puerta D');
    expect(response).toContain('Puerta A');
  });

  it('simplifies language phrasing when simpleLanguage is active', async () => {
    const simpleSettings = { ...defaultSettings, simpleLanguage: true };
    const response = await askGemini('tell me about gate wait times', INITIAL_STADIUM_STATE, simpleSettings);
    expect(response).toContain('ticket machine problems');
    expect(response).not.toContain('turnstile scanner issues');
  });

  it('handles invalid or malformed API keys with security warnings', async () => {
    const malformedSettings = { ...defaultSettings, geminiApiKey: 'shortKey' };
    const response = await askGemini('fastest gates', INITIAL_STADIUM_STATE, malformedSettings);
    expect(response).toContain('Security Alert');
    expect(response).toContain('Gate D');
  });

  it('performs live API calls when valid key is provided and fetch succeeds', async () => {
    const validSettings = { ...defaultSettings, geminiApiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q' };
    
    const mockJson = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'Live operational summary from Gemini API.'
              }
            ]
          }
        }
      ]
    };
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockJson,
      status: 200
    } as Response);

    const response = await askGemini('what is the status of Gate B?', INITIAL_STADIUM_STATE, validSettings);
    expect(response).toBe('Live operational summary from Gemini API.');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('gracefully handles API error responses and redacts keys', async () => {
    const validSettings = { ...defaultSettings, geminiApiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q' };
    
    const mockErrorJson = {
      error: {
        message: 'API Key AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q is not active'
      }
    };
    
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => mockErrorJson,
      status: 400
    } as Response);

    const response = await askGemini('what is the status of Gate B?', INITIAL_STADIUM_STATE, validSettings);
    expect(response).toContain('Error contacting Gemini AI');
    expect(response).toContain('[REDACTED_API_KEY]');
    expect(response).not.toContain('AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q');
  });

  it('gracefully handles missing text structure parse errors', async () => {
    const validSettings = { ...defaultSettings, geminiApiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q' };
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
      status: 200
    } as Response);

    const response = await askGemini('what is the status of Gate B?', INITIAL_STADIUM_STATE, validSettings);
    expect(response).toContain('Invalid response structure');
  });

  it('passes language instruction configuration to live API query', async () => {
    const spanishSettings = { ...defaultSettings, geminiApiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q', language: 'es' };
    
    const mockJson = {
      candidates: [{ content: { parts: [{ text: 'Respuesta en español.' }] } }]
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockJson,
      status: 200
    } as Response);

    const response = await askGemini('Hola', INITIAL_STADIUM_STATE, spanishSettings);
    expect(response).toBe('Respuesta en español.');
    
    // Check that fetch was called with the body containing Spanish settings instruction
    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.contents[0].parts[0].text).toContain('specified: "es"');
  });

  it('passes simple language instructions to live API query', async () => {
    const simpleSettings = { ...defaultSettings, geminiApiKey: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q', simpleLanguage: true };
    
    const mockJson = {
      candidates: [{ content: { parts: [{ text: 'Simple reply.' }] } }]
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockJson,
      status: 200
    } as Response);

    const response = await askGemini('Help', INITIAL_STADIUM_STATE, simpleSettings);
    expect(response).toBe('Simple reply.');
    
    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.contents[0].parts[0].text).toContain('Simple Language Mode: ACTIVE');
  });
});
