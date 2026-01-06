import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Deal, DealRoom, Task, DealRoomMember, AuditEvent, Role } from '../types';
import { USERS, INITIAL_DEALS, TEMPLATES } from '../constants';

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean; // Has connected CRM
  deals: Deal[];
  rooms: DealRoom[];
  tasks: Task[];
  members: DealRoomMember[];
  notifications: number; // Simple count for prototype
}

interface AppContextType extends AppState {
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  connectCRM: () => Promise<void>;
  createDealRoom: (dealId: string, templateId: string) => void;
  inviteStakeholder: (dealRoomId: string, email: string) => Promise<boolean>;
  addTask: (dealRoomId: string, title: string, description: string, assigneeId: string, dueDate: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  logEvent: (eventType: string, data: any) => void;
  getRoomTasks: (roomId: string) => Task[];
  getRoomMembers: (roomId: string) => DealRoomMember[];
  canEditTask: (task: Task) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    isAuthenticated: false,
    isOnboarded: false,
    deals: [],
    rooms: [],
    tasks: [],
    members: [],
    notifications: 0,
  });

  // Analytics Logger (Simulated)
  const logEvent = useCallback((eventType: string, eventData: any) => {
    const event: AuditEvent = {
      event_type: eventType,
      event_data: eventData,
      user_id: state.currentUser?.id || 'anonymous',
      created_at: new Date().toISOString(),
    };
    console.log('ANALYTICS EVENT:', event);
  }, [state.currentUser]);

  // Auth
  const login = async (email: string) => {
    const userKey = Object.keys(USERS).find(key => USERS[key].email === email);
    if (userKey) {
      const user = USERS[userKey];
      setState(prev => ({ ...prev, currentUser: user, isAuthenticated: true }));
      logEvent('User Signed Up', { user_id: user.id, role: user.role }); // Mapping "Login" to the requested "Sign Up" log for prototype simplicity
      
      // If logging in as David, create dummy invites if none exist
      if (user.role === 'stakeholder') {
        // Ensure David has access to at least one room if rooms exist
        setState(prev => {
             const existingRooms = prev.rooms;
             if(existingRooms.length > 0) {
                 const isMember = prev.members.find(m => m.user_id === user.id && m.deal_room_id === existingRooms[0].id);
                 if(!isMember) {
                     return {
                         ...prev,
                         members: [...prev.members, { deal_room_id: existingRooms[0].id, user_id: user.id, role: 'stakeholder' }]
                     }
                 }
             }
             return prev;
        })
      }
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null, isAuthenticated: false }));
  };

  const connectCRM = async () => {
    // Simulate API Delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setState(prev => ({ ...prev, deals: INITIAL_DEALS, isOnboarded: true }));
    logEvent('CRM Connected', { user_id: state.currentUser?.id });
  };

  const createDealRoom = (dealId: string, templateId: string) => {
    const newRoom: DealRoom = {
      id: `room-${Date.now()}`,
      deal_id: dealId,
      template_used: templateId,
      created_at: new Date().toISOString(),
    };

    const template = TEMPLATES.find(t => t.id === templateId);
    
    const newTasks: Task[] = template ? template.defaultTasks.map((t, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      deal_room_id: newRoom.id,
      title: t.title,
      description: t.description,
      status: 'Todo',
      assignee_id: state.currentUser?.id || null, // Default to creator
      due_date: new Date(Date.now() + 86400000 * 7).toISOString(), // +7 days
    })) : [];

    const newMember: DealRoomMember = {
      deal_room_id: newRoom.id,
      user_id: state.currentUser!.id,
      role: 'owner',
    };

    setState(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
      tasks: [...prev.tasks, ...newTasks],
      members: [...prev.members, newMember],
    }));

    logEvent('Deal Room Created', { deal_id: dealId, template_used: templateId });
  };

  const inviteStakeholder = async (dealRoomId: string, email: string) => {
      // Basic validation
      if (!email.includes('@')) return false;

      // In a real app we'd look up the user. Here, we assume if it's David's email, we add David.
      let inviteeId = 'temp-id';
      if (email === USERS.DAVID.email) inviteeId = USERS.DAVID.id;

      const newMember: DealRoomMember = {
          deal_room_id: dealRoomId,
          user_id: inviteeId,
          role: 'stakeholder'
      };

      setState(prev => ({
          ...prev,
          members: [...prev.members, newMember]
      }));

      // Simulate sending notification to David
      if(inviteeId === USERS.DAVID.id) {
          // Just a hack for the prototype to show a badge on logout/login
      }

      logEvent('Stakeholder Invited', { deal_id: state.rooms.find(r => r.id === dealRoomId)?.deal_id, invitee_id: inviteeId });
      return true;
  };

  const addTask = (dealRoomId: string, title: string, description: string, assigneeId: string, dueDate: string) => {
    const newTask: Task = {
        id: `task-${Date.now()}`,
        deal_room_id: dealRoomId,
        title,
        description,
        status: 'Todo',
        assignee_id: assigneeId,
        due_date: dueDate
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    
    // Notify if assigned to someone else
    if (assigneeId !== state.currentUser?.id && assigneeId === USERS.DAVID.id) {
        // Increment notification for demo purposes (if we were tracking global state persisted)
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => {
            if (t.id === taskId) {
                const updated = { ...t, ...updates };
                if (updates.status === 'Done' && t.status !== 'Done') {
                    const room = prev.rooms.find(r => r.id === t.deal_room_id);
                    logEvent('Task Completed', { deal_id: room?.deal_id, task_id: t.id });
                }
                return updated;
            }
            return t;
        })
    }));
  };

  const deleteTask = (taskId: string) => {
      setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
  };

  const getRoomTasks = (roomId: string) => state.tasks.filter(t => t.deal_room_id === roomId);
  const getRoomMembers = (roomId: string) => state.members.filter(m => m.deal_room_id === roomId);

  // Permission Logic
  const canEditTask = (task: Task): boolean => {
      if (!state.currentUser) return false;
      if (state.currentUser.role === 'owner') return true; // Owners can edit all
      return task.assignee_id === state.currentUser.id; // Stakeholders only their own
  };

  return (
    <AppContext.Provider value={{ 
        ...state, 
        login, 
        logout, 
        connectCRM, 
        createDealRoom, 
        inviteStakeholder,
        addTask, 
        updateTask, 
        deleteTask,
        logEvent, 
        getRoomTasks,
        getRoomMembers,
        canEditTask
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
