import { StadiumState, UserSettings } from '../types';
import { redactSecrets, isValidGeminiApiKey } from './securityUtils';

// Simple fallback responses if API key is not configured
const mockAIResponse = (query: string, state: StadiumState, settings: UserSettings): string => {
  const q = query.toLowerCase();
  const lang = settings.language;
  const simple = settings.simpleLanguage;

  const responses: Record<string, Record<string, string>> = {
    en: {
      gate: `Currently, the gate wait times are:
- **Gate D (West - Family)**: 5 minutes (Fastest - recommended)
- **Gate A (North)**: 8 minutes
- **Gate C (South - Supporters)**: 28 minutes
- **Gate B (East)**: 42 minutes (Critical delay due to turnstile scanner issues).

If you are looking for the shortest entry time, please use **Gate D** or **Gate A**.`,
      wheelchair: `Wheelchair accessibility details:
- **Gate D (West)** and **Gate A (North)** have full step-free ramp access and dedicated elevators.
- **Gate C (South)** has stairs only; please avoid it if you require wheelchair access.
- Accessible restrooms and food stalls are located in the **West Concourse** near Section 104-106.
- Assistance is available; a volunteer can escort you. Tap "Accessibility Mode" on your dashboard to request assistance.`,
      transit: `Public transit recommendation:
- **Metro Red Line** at Gate A (North) is running on-time with departures every 4 minutes (Wait time: 12 minutes).
- **Metro Blue Line** at Gate B (East) is experiencing delays of up to 35 minutes due to high congestion.
- **Shuttle Buses** are running frequently to the Park & Ride lot from Gate B, but queuing is long (15 min wait).
- **Walking tip**: Consider walking towards the North exit to catch Metro Red Line.`,
      incident: `Current stadium incidents active:
1. **Ticket Scanner Failure** at Gate B (Severity: High, responding. Engineers are resolving).
2. **Lost Child** Mateo (7 y/o) in South Stand (Severity: Medium, volunteers active).
3. **Beverage Spill** near Section 104 in Food Court (Severity: Low, cleanup scheduled).`,
      volunteer: `Current volunteer deployment:
- **Mateo Silva** (Gate B Overflows)
- **Amelie Laurent** (South Stand Lost Child)
- *Assigned tasks*: 2 in-progress, 3 open tasks waiting in queue. Help is needed for wheelchair escort at Gate C.`,
      default: `Hello! I am StadiumOS AI, your FIFA 2026 assistant. Based on current telemetry:
- **Fastest Gate**: Gate D (5 min wait time).
- **Congestion Alert**: Avoid Gate B (42 min wait time, ticket scanner failure).
- **Transport**: Metro Red Line is highly efficient right now.

How else can I help you today?`
    },
    es: {
      gate: `Actualmente, los tiempos de espera en las puertas son:
- **Puerta D (Oeste - Familiar)**: 5 minutos (Más rápida - recomendada)
- **Puerta A (Norte)**: 8 minutos
- **Puerta C (Sur - Aficionados)**: 28 minutos
- **Puerta B (Este)**: 42 minutos (Espera crítica por falla en lectores de boletos).

Se recomienda ingresar por la **Puerta D** o **Puerta A**.`,
      wheelchair: `Detalles de accesibilidad:
- La **Puerta D (Oeste)** y la **Puerta A (Norte)** cuentan con rampas accesibles y ascensores.
- La **Puerta C (Sur)** solo tiene escaleras; evítela si usa silla de ruedas.
- Los baños y puestos de comida accesibles se ubican en el **Pasillo Oeste** cerca de las secciones 104-106.`,
      transit: `Recomendación de transporte público:
- **Línea Roja del Metro** (Puerta A) opera a tiempo cada 4 min (Espera: 12 min).
- **Línea Azul del Metro** (Puerta B) tiene retrasos de 35 min por congestión.`,
      default: `¡Hola! Soy StadiumOS AI. Resumen de telemetría:
- **Puerta recomendada**: Puerta D (5 min de espera).
- **Alerta**: Evite la Puerta B (42 min de espera).
Línea Roja de Metro opera sin problemas.`
    },
    fr: {
      default: `Bonjour! Je suis StadiumOS AI, votre assistant FIFA 2026.
- **Porte la plus rapide**: Porte D (5 min d'attente).
- **Alerte**: Évitez la Porte B (42 min d'attente, panne de scanner).
Le Métro Ligne Rouge est recommandé.`
    },
    pt: {
      default: `Olá! Sou o StadiumOS AI, seu assistente da FIFA 2026.
- **Portão mais rápido**: Portão D (5 min de espera).
- **Alerta**: Evite o Portão B (42 min de espera devido a falhas no scanner).
Linha Vermelha do Metrô opera normalmente.`
    },
    ar: {
      default: `مرحباً! أنا مساعدك الذكي لاستاد كأس العالم 2026.
- **أسرع بوابة**: البوابة D (انتظار 5 دقائق).
- **تنبيه**: تجنب البوابة B (انتظار 42 دقيقة بسبب عطل في القارئات).
خط المترو الأحمر يعمل بشكل ممتاز الآن.`
    }
  };

  const getLangKey = (): string => {
    if (responses[lang]) return lang;
    return 'en';
  };

  const lk = getLangKey();
  let text = '';

  if (q.includes('wheelchair') || q.includes('accessible') || q.includes('disabled') || q.includes('ramp') || q.includes('accessibility') || q.includes('stroller') || q.includes('كرسي')) {
    text = responses[lk].wheelchair || responses[lk].default;
  } else if (q.includes('gate') || q.includes('entrance') || q.includes('waiting') || q.includes('lowest') || q.includes('entry') || q.includes('puerta') || q.includes('بوابة')) {
    text = responses[lk].gate || responses[lk].default;
  } else if (q.includes('transit') || q.includes('metro') || q.includes('bus') || q.includes('transport') || q.includes('park') || q.includes('car') || q.includes('مترو') || q.includes('باص')) {
    text = responses[lk].transit || responses[lk].default;
  } else if (q.includes('incident') || q.includes('spill') || q.includes('scanner') || q.includes('emergency') || q.includes('problem') || q.includes('issue') || q.includes('حادث')) {
    text = responses[lk].incident || responses[lk].default;
  } else if (q.includes('volunteer') || q.includes('task') || q.includes('staff') || q.includes('job') || q.includes('متطوع')) {
    text = responses[lk].volunteer || responses[lk].default;
  } else {
    text = responses[lk].default;
  }

  if (simple && lk === 'en') {
    text = text
      .replace(/telemetry/g, 'info')
      .replace(/congestion/g, 'crowd')
      .replace(/experiencing delays/g, 'running slow')
      .replace(/turnstile scanner issues/g, 'ticket machine problems')
      .replace(/critical delay/g, 'long wait');
  }

  return text;
};

export async function askGemini(query: string, state: StadiumState, settings: UserSettings): Promise<string> {
  const { geminiApiKey, language, simpleLanguage } = settings;

  if (!geminiApiKey) {
    // Delay slightly to simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockAIResponse(query, state, settings);
  }

  if (!isValidGeminiApiKey(geminiApiKey)) {
    // Return a security alert warning and fallback to local model
    return `**Security Alert:** The configured Gemini API key is malformed or invalid (must start with 'AIzaSy' and contain 39 characters).
    
*Falling back to local operational AI model:*

${mockAIResponse(query, state, settings)}`;
  }

  const prompt = `You are StadiumOS AI, the intelligent operations and fan assistant for Stadium 26 (Boston Venue) during the FIFA World Cup 2026.
You are helping fans, volunteers, organizers, and stadium staff.

Here is the current live stadium telemetry:
---
GATES STATUS:
${state.gates.map((g) => `- ${g.name}: Status=${g.status}, WaitTime=${g.waitTime} mins, Density=${g.density}, Accessibility=${g.wheelchairAccessible ? 'Wheelchair Accessible Ramps & Elevators' : 'Stairs Only'}. Note: ${g.notes || 'None'}`).join('\n')}

STADIUM CROWD ZONES:
${state.zones.map((z) => `- ${z.name}: Crowd=${z.currentCrowd}/${z.capacity} (${Math.round((z.currentCrowd / z.capacity) * 100)}% cap), Density=${z.density}, Active Incidents=${z.incidentsCount}`).join('\n')}

ACTIVE INCIDENTS:
${state.incidents.length === 0 ? 'No active incidents.' : state.incidents.map((inc) => `- [${inc.severity.toUpperCase()} Priority] ${inc.title}: ${inc.description} (Status: ${inc.status}, Reported at ${inc.reportedAt} in ${inc.zoneName})`).join('\n')}

PARKING STATUS:
${state.parking.map((p) => `- ${p.name}: Occupied=${p.occupied}/${p.capacity} (${Math.round((p.occupied / p.capacity) * 100)}% full), Walking time to gates=${p.walkingTime} mins`).join('\n')}

PUBLIC TRANSIT:
${state.transit.map((t) => `- ${t.lineName}: Type=${t.type}, Status=${t.status}, Frequency=every ${t.frequency} mins, Queue Wait Time=${t.waitTime} mins`).join('\n')}

ACTIVE NOTIFICATIONS & EMERGENCY ALERTS:
${state.activeAlerts.length === 0 ? 'None' : state.activeAlerts.map((a) => `- ${a}`).join('\n')}
---

INSTRUCTIONS:
- Answer in the language specified: "${language}" (use code 'en' for English, 'es' for Spanish, 'fr' for French, 'pt' for Portuguese, 'ar' for Arabic).
- Simple Language Mode: ${simpleLanguage ? 'ACTIVE. Use simple words, short sentences, and avoid technical terminology. Clear and direct.' : 'INACTIVE. Standard clear professional tone.'}
- Respond to the query: "${query}"
- Provide a useful, actionable answer based ONLY on the stadium data provided above.
- Be concise (max 3-4 paragraphs) and format your response with clean Markdown bullet points where appropriate.
- If asking about safety or evacuation, highlight the safest zones (e.g., Gate D/West Stand) and advise staying away from critical density zones (e.g., South Stand/Gate B).
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.15,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error('Invalid response structure from Gemini API');
    }
    return reply;
  } catch (error: unknown) {
    const errorString = error instanceof Error ? error.message : String(error);
    const redactedError = redactSecrets(errorString);
    console.error('Gemini API Error:', redactedError);
    return `**Error contacting Gemini AI:** ${redactedError || 'Unknown network error'}. 

*Falling back to local operational AI model:*

${mockAIResponse(query, state, settings)}`;
  }
}
