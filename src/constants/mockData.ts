import { StadiumState } from '../types';

export const INITIAL_STADIUM_STATE: StadiumState = {
  zones: [
    { id: 'zone-north', name: 'North Stand (Fan Zone)', capacity: 22000, currentCrowd: 19800, density: 'high', incidentsCount: 0 },
    { id: 'zone-east', name: 'East Stand (Premium & Suites)', capacity: 18000, currentCrowd: 11200, density: 'medium', incidentsCount: 1 },
    { id: 'zone-south', name: 'South Stand (Active Supporters)', capacity: 25000, currentCrowd: 24500, density: 'critical', incidentsCount: 1 },
    { id: 'zone-west', name: 'West Stand (Family Section)', capacity: 15000, currentCrowd: 9000, density: 'low', incidentsCount: 0 },
    { id: 'zone-concourse', name: 'Main Concourse & Food Court', capacity: 30000, currentCrowd: 26100, density: 'high', incidentsCount: 1 }
  ],
  gates: [
    { id: 'gate-a', name: 'Gate A (North)', status: 'open', waitTime: 8, density: 'medium', wheelchairAccessible: true, notes: 'Direct access to Metro Red Line.' },
    { id: 'gate-b', name: 'Gate B (East)', status: 'open', waitTime: 42, density: 'critical', wheelchairAccessible: true, notes: 'Heavy flow from Park & Ride shuttles.' },
    { id: 'gate-c', name: 'Gate C (South - Supporters)', status: 'open', waitTime: 28, density: 'high', wheelchairAccessible: false, notes: 'Stairs only at main entrance. Use Gate D for ramp access.' },
    { id: 'gate-d', name: 'Gate D (West - Family)', status: 'open', waitTime: 5, density: 'low', wheelchairAccessible: true, notes: 'Express lane for strollers and senior citizens.' }
  ],
  incidents: [
    {
      id: 'inc-101',
      title: 'Ticket Scanner Failure',
      description: 'Turnstiles 12 and 13 at Gate B are offline. Crowds starting to build.',
      zoneId: 'zone-east',
      zoneName: 'East Stand (Premium & Suites)',
      severity: 'high',
      status: 'responding',
      reportedAt: '14:48'
    },
    {
      id: 'inc-102',
      title: 'Beverage Spill near Section 104',
      description: 'Large liquid spill creating a slip hazard. Needs immediate cleanup.',
      zoneId: 'zone-concourse',
      zoneName: 'Main Concourse & Food Court',
      severity: 'low',
      status: 'reported',
      reportedAt: '15:02'
    },
    {
      id: 'inc-103',
      title: 'Lost Child Assistance',
      description: '7-year-old boy in a green jersey separated from parents near Block S4.',
      zoneId: 'zone-south',
      zoneName: 'South Stand (Active Supporters)',
      severity: 'medium',
      status: 'responding',
      reportedAt: '15:05'
    }
  ],
  volunteers: [
    { id: 'vol-1', name: 'Mateo Silva', status: 'active', assignedZoneId: 'zone-north', phone: '+1 555-0192' },
    { id: 'vol-2', name: 'Sarah Chen', status: 'active', assignedZoneId: 'zone-east', phone: '+1 555-0283' },
    { id: 'vol-3', name: 'Marcus Johnson', status: 'break', assignedZoneId: 'zone-concourse', phone: '+1 555-0374' },
    { id: 'vol-4', name: 'Amelie Laurent', status: 'active', assignedZoneId: 'zone-south', phone: '+1 555-0465' },
    { id: 'vol-5', name: 'Yuki Sato', status: 'offline', assignedZoneId: 'zone-west', phone: '+1 555-0556' }
  ],
  tasks: [
    {
      id: 'task-201',
      title: 'Direct Gate B Overflows',
      description: 'Manually redirect fans arriving at Gate B to Gate A where wait times are under 10 minutes.',
      priority: 'high',
      status: 'in-progress',
      assignedToVolunteerId: 'vol-1',
      assignedToVolunteerName: 'Mateo Silva',
      eta: 15,
      category: 'crowd',
      zoneId: 'zone-north'
    },
    {
      id: 'task-202',
      title: 'Escort Wheelchair User',
      description: 'A fan at Gate C requires assistance finding the wheelchair ramp access and elevator to Section 202.',
      priority: 'high',
      status: 'open',
      assignedToVolunteerId: null,
      assignedToVolunteerName: null,
      eta: 10,
      category: 'accessibility',
      zoneId: 'zone-south'
    },
    {
      id: 'task-203',
      title: 'Locate Parents for Lost Child',
      description: 'Coordinate with security at South Stand information desk to announce lost child Mateo.',
      priority: 'medium',
      status: 'in-progress',
      assignedToVolunteerId: 'vol-4',
      assignedToVolunteerName: 'Amelie Laurent',
      eta: 8,
      category: 'info',
      zoneId: 'zone-south'
    },
    {
      id: 'task-204',
      title: 'Spill Cleanup Concourse Sec 104',
      description: 'Deploy warning cones and wet-mop the area between sections 104 and 105.',
      priority: 'low',
      status: 'open',
      assignedToVolunteerId: null,
      assignedToVolunteerName: null,
      eta: 5,
      category: 'facility',
      zoneId: 'zone-concourse'
    },
    {
      id: 'task-205',
      title: 'Distribute Audio Guides',
      description: 'Supply extra low-vision audio descriptive devices to the Accessibility kiosk in West Concourse.',
      priority: 'medium',
      status: 'open',
      assignedToVolunteerId: null,
      assignedToVolunteerName: null,
      eta: 12,
      category: 'accessibility',
      zoneId: 'zone-west'
    }
  ],
  parking: [
    { id: 'park-a', name: 'Parking Lot A (Premium)', capacity: 1500, occupied: 1480, walkingTime: 5 },
    { id: 'park-b', name: 'Parking Lot B (General)', capacity: 4000, occupied: 3820, walkingTime: 12 },
    { id: 'park-c', name: 'Parking Lot C (General)', capacity: 3500, occupied: 1950, walkingTime: 18 },
    { id: 'park-d', name: 'Park & Ride (Shuttle)', capacity: 8000, occupied: 6200, walkingTime: 2 } // Shuttle drops off at Gate B
  ],
  transit: [
    { id: 'transit-1', type: 'metro', lineName: 'Metro Red Line (Stadium North)', frequency: 4, status: 'on-time', waitTime: 12 },
    { id: 'transit-2', type: 'metro', lineName: 'Metro Blue Line (Stadium East)', frequency: 5, status: 'delayed', waitTime: 35 },
    { id: 'transit-3', type: 'bus', lineName: 'Shuttle Bus Route 202', frequency: 3, status: 'on-time', waitTime: 15 },
    { id: 'transit-4', type: 'bus', lineName: 'Express Bus Downtown', frequency: 10, status: 'on-time', waitTime: 8 }
  ],
  energyUsage: 2450, // kW
  wasteLevel: 68, // %
  activeAlerts: [
    'GATE B CONGESTION: Wait times exceed 40 mins. Recommended entry point: Gate D (West).'
  ]
};

// Preset prompts for AI Command Center
export const PRESET_PROMPTS = [
  { id: 'p1', label: 'Safety & Entrances', text: 'Which gate has the lowest waiting time and is the safest route right now?' },
  { id: 'p2', label: 'Wheelchair Access', text: 'Find wheelchair-friendly entry gates and food stalls in the concourse.' },
  { id: 'p3', label: 'Transit Planner', text: 'How should I head home using public transit to avoid crowds?' },
  { id: 'p4', label: 'Urgent Tasks', text: 'Show me high-priority volunteer tasks related to accessibility.' },
  { id: 'p5', label: 'Operations Alert', text: 'Summarize the current incidents and the status of emergency responses.' }
];

export const CROWD_HISTORICAL_DATA = [
  { time: '12:00', 'Gate A': 10, 'Gate B': 15, 'Gate C': 5, 'Gate D': 5 },
  { time: '12:30', 'Gate A': 15, 'Gate B': 20, 'Gate C': 12, 'Gate D': 8 },
  { time: '13:00', 'Gate A': 20, 'Gate B': 25, 'Gate C': 18, 'Gate D': 10 },
  { time: '13:30', 'Gate A': 35, 'Gate B': 40, 'Gate C': 25, 'Gate D': 15 },
  { time: '14:00', 'Gate A': 45, 'Gate B': 55, 'Gate C': 38, 'Gate D': 12 },
  { time: '14:30', 'Gate A': 25, 'Gate B': 65, 'Gate C': 42, 'Gate D': 10 },
  { time: '15:00', 'Gate A': 8, 'Gate B': 42, 'Gate C': 28, 'Gate D': 5 } // Current time
];

export const CROWD_PREDICTION_DATA = [
  { time: '15:00 (Current)', 'Gate A': 8, 'Gate B': 42, 'Gate C': 28, 'Gate D': 5 },
  { time: '15:30 (Kickoff)', 'Gate A': 5, 'Gate B': 15, 'Gate C': 10, 'Gate D': 2 },
  { time: '16:00 (Mid-1st)', 'Gate A': 2, 'Gate B': 5, 'Gate C': 4, 'Gate D': 1 },
  { time: '16:45 (Half-Time)', 'Gate A': 18, 'Gate B': 22, 'Gate C': 20, 'Gate D': 12 },
  { time: '17:30 (Mid-2nd)', 'Gate A': 4, 'Gate B': 8, 'Gate C': 5, 'Gate D': 2 },
  { time: '18:00 (Match End)', 'Gate A': 55, 'Gate B': 70, 'Gate C': 60, 'Gate D': 40 }
];
