export type DensityLevel = 'low' | 'medium' | 'high' | 'critical';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'responding' | 'resolved';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'open' | 'in-progress' | 'completed';
export type VolunteerStatus = 'active' | 'break' | 'offline';
export type GateStatus = 'open' | 'closed' | 'emergency-only';

export interface StadiumZone {
  id: string;
  name: string;
  capacity: number;
  currentCrowd: number;
  density: DensityLevel;
  incidentsCount: number;
}

export interface Gate {
  id: string;
  name: string;
  status: GateStatus;
  waitTime: number; // in minutes
  density: DensityLevel;
  wheelchairAccessible: boolean;
  notes?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  zoneId: string;
  zoneName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedAt: string; // e.g. "14:23"
}

export interface Volunteer {
  id: string;
  name: string;
  status: VolunteerStatus;
  assignedZoneId: string;
  phone?: string;
}

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToVolunteerId: string | null;
  assignedToVolunteerName: string | null;
  eta: number; // minutes to complete
  category: 'accessibility' | 'crowd' | 'medical' | 'info' | 'facility';
  zoneId: string;
}

export interface ParkingZone {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  walkingTime: number; // to gates
}

export interface PublicTransit {
  id: string;
  type: 'metro' | 'bus';
  lineName: string;
  frequency: number; // minutes
  status: 'delayed' | 'on-time' | 'suspended';
  waitTime: number; // current queue wait in minutes
}

export interface StadiumState {
  zones: StadiumZone[];
  gates: Gate[];
  incidents: Incident[];
  volunteers: Volunteer[];
  tasks: VolunteerTask[];
  parking: ParkingZone[];
  transit: PublicTransit[];
  energyUsage: number; // kW
  wasteLevel: number; // overall stadium waste fill percentage
  activeAlerts: string[];
}

export interface UserSettings {
  geminiApiKey: string;
  language: string; // 'en' | 'es' | 'fr' | 'pt' | 'ar'
  accessibilityMode: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  simpleLanguage: boolean;
  highContrast: boolean;
  audioReader: boolean;
}
