import { Deal, Template, User } from './types';

export const USERS: Record<string, User> = {
  SARAH: {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    email: 'sarah.ae@example.com',
    name: 'Sarah (AE)',
    role: 'owner',
    avatarUrl: 'https://picsum.photos/id/1/200/200',
  },
  DAVID: {
    id: 'fedcba09-8765-4321-0987-654321fedcba',
    email: 'david.legal@example.com',
    name: 'David (Legal)',
    role: 'stakeholder',
    avatarUrl: 'https://picsum.photos/id/2/200/200',
  },
};

export const TEMPLATES: Template[] = [
  {
    id: 'security',
    name: 'Security Review',
    description: 'Standard flow for InfoSec approval',
    defaultTasks: [
      { title: 'Schedule security call', description: 'Coordinate with InfoSec team' },
      { title: 'Provide security docs', description: 'Upload SOC2 reports' },
      { title: 'Complete vendor questionnaire', description: 'Fill out the Excel sheet provided by client' },
      { title: 'Get InfoSec sign-off', description: 'Final approval needed' },
    ],
  },
  {
    id: 'poc',
    name: 'POC Management',
    description: 'Track Proof of Concept success',
    defaultTasks: [
      { title: 'Define success criteria', description: 'Must be agreed with customer' },
      { title: 'Deploy POC environment', description: 'Provision sandbox' },
      { title: 'Weekly check-in', description: 'Schedule recurring meeting' },
      { title: 'Present POC findings', description: 'Final presentation to stakeholders' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Standard Enterprise Deal',
    description: 'Full cycle contract negotiation',
    defaultTasks: [
      { title: 'Draft MSA', description: 'Start with standard template' },
      { title: 'Internal Pricing Approval', description: 'Submit to Deal Desk' },
      { title: 'Send contract via DocuSign', description: 'Ensure signatories are correct' },
      { title: 'Provision account', description: 'Handover to CS' },
    ],
  },
];

const STAGES: any[] = ['Discovery', 'Proposal', 'Negotiation'];

export const INITIAL_DEALS: Deal[] = Array.from({ length: 15 }).map((_, i) => {
  const isWon = i === 3 || i === 7;
  const isLost = i === 5;
  const status = isWon ? 'Closed-Won' : isLost ? 'Closed-Lost' : 'Open';
  const stage = isWon ? 'Closed Won' : isLost ? 'Closed Lost' : STAGES[i % 3];

  return {
    id: `deal-${i + 1}`,
    crm_id: `CRM-00${i + 1}`,
    name: `Deal with Acme Corp ${i + 1}`,
    account_name: `Acme Corp ${i + 1}`,
    stage: stage,
    amount: (i + 1) * 15000,
    status: status,
    owner_id: USERS.SARAH.id,
  };
});
