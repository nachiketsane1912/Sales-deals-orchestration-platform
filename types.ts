export type Role = 'owner' | 'stakeholder';
export type DealStage = 'Discovery' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
export type DealStatus = 'Open' | 'Closed-Won' | 'Closed-Lost';
export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role; // Primary role in the system
  avatarUrl?: string;
}

export interface Deal {
  id: string;
  crm_id: string;
  name: string;
  account_name: string;
  stage: DealStage;
  amount: number;
  status: DealStatus;
  owner_id: string;
}

export interface DealRoom {
  id: string;
  deal_id: string;
  template_used: string;
  created_at: string;
}

export interface DealRoomMember {
  deal_room_id: string;
  user_id: string;
  role: Role; // Role specifically within this room
}

export interface Task {
  id: string;
  deal_room_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee_id: string | null;
  due_date: string; // ISO date string
}

export interface AuditEvent {
  event_type: string;
  event_data: any;
  user_id: string;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  defaultTasks: { title: string; description: string }[];
}
