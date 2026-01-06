import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, DealRoomMember } from '../types';
import { USERS } from '../constants';
import { Plus, UserPlus, Calendar, Trash2, Check, Clock, User as UserIcon } from 'lucide-react';

interface DealRoomProps {
    roomId: string;
}

export const DealRoomView: React.FC<DealRoomProps> = ({ roomId }) => {
    const { 
        rooms, deals, currentUser, 
        getRoomTasks, getRoomMembers, 
        addTask, inviteStakeholder, 
        canEditTask, updateTask, deleteTask
    } = useApp();
    
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);

    const room = rooms.find(r => r.id === roomId);
    if (!room) return <div>Room not found</div>;
    
    const deal = deals.find(d => d.id === room.deal_id);
    const tasks = getRoomTasks(roomId);
    const members = getRoomMembers(roomId);

    // Filter tasks for columns
    const columns: TaskStatus[] = ['Todo', 'In Progress', 'Done'];

    return (
        <div className="h-full flex flex-col">
            {/* Room Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 pb-6">
                <div>
                    <div className="flex items-center space-x-2">
                         <h1 className="text-2xl font-bold text-gray-900">{deal?.name}</h1>
                         <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs uppercase tracking-wider font-semibold">{deal?.stage}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                        <span>{deal?.account_name}</span>
                        <span>•</span>
                        {/* CRITICAL SECURITY FEATURE: Hide amount from stakeholders */}
                        <span>{currentUser?.role === 'owner' ? `$${deal?.amount.toLocaleString()}` : 'Value Hidden'}</span>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <div className="flex -space-x-2 mr-4">
                        {members.map(m => {
                            const u = Object.values(USERS).find(u => u.id === m.user_id);
                            return (
                                <div key={m.user_id} className="h-8 w-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center overflow-hidden" title={u?.name}>
                                    {u?.avatarUrl ? <img src={u.avatarUrl} alt="" className="h-full w-full object-cover"/> : <span className="text-xs">{u?.name[0]}</span>}
                                </div>
                            )
                        })}
                    </div>
                    {currentUser?.role === 'owner' && (
                        <button 
                            onClick={() => setInviteModalOpen(true)}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite
                        </button>
                    )}
                    <button 
                         onClick={() => setTaskModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-[#4A90E2] text-white rounded-lg text-sm font-medium hover:bg-blue-600 shadow-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex space-x-6 min-w-[800px] h-full">
                    {columns.map(status => (
                        <div key={status} className="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col h-full min-h-[400px]">
                            <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                                {status}
                                <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full">
                                    {tasks.filter(t => t.status === status).length}
                                </span>
                            </h3>
                            <div className="space-y-3">
                                {tasks.filter(t => t.status === status).map(task => {
                                    const isEditable = canEditTask(task);
                                    const assignee = Object.values(USERS).find(u => u.id === task.assignee_id);
                                    
                                    return (
                                        <div key={task.id} className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 group ${!isEditable ? 'opacity-90' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-sm font-medium text-gray-900 leading-tight">{task.title}</h4>
                                                {isEditable && (
                                                    <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                                            
                                            <div className="flex items-center justify-between mt-auto">
                                                 <div className="flex items-center text-xs text-gray-400" title={`Assignee: ${assignee?.name || 'Unassigned'}`}>
                                                    {assignee ? (
                                                        <img src={assignee.avatarUrl} className="h-5 w-5 rounded-full mr-1.5" />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full bg-gray-200 mr-1.5 flex items-center justify-center"><UserIcon className="h-3 w-3" /></div>
                                                    )}
                                                    <span className="truncate max-w-[80px]">{assignee?.name.split(' ')[0]}</span>
                                                 </div>
                                                 
                                                 {/* Status Dropdown (Accessible Mobile Friendly DnD alternative) */}
                                                 <select 
                                                    disabled={!isEditable}
                                                    value={task.status}
                                                    onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                                                    className="text-xs border-none bg-gray-50 rounded text-gray-600 focus:ring-0 cursor-pointer py-1 pl-2 pr-6 disabled:cursor-not-allowed"
                                                 >
                                                     {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                 </select>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {isInviteModalOpen && (
                <InviteModal 
                    onClose={() => setInviteModalOpen(false)} 
                    onInvite={async (email) => {
                        const success = await inviteStakeholder(roomId, email);
                        return success;
                    }} 
                />
            )}

            {isTaskModalOpen && (
                <TaskModal
                    members={members}
                    onClose={() => setTaskModalOpen(false)}
                    onCreate={(title, desc, assignee, due) => {
                        addTask(roomId, title, desc, assignee, due);
                        setTaskModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

// Helper Components
const InviteModal: React.FC<{ onClose: () => void, onInvite: (email: string) => Promise<boolean> }> = ({ onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        const success = await onInvite(email);
        if(success) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Invite Stakeholder</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-blue-600">Send Invite</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TaskModal: React.FC<{ members: DealRoomMember[], onClose: () => void, onCreate: (t: string, d: string, a: string, due: string) => void }> = ({ members, onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [assignee, setAssignee] = useState(members[0]?.user_id || '');
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
             <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Task</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea className="w-full border border-gray-300 rounded-lg p-2 h-24" value={desc} onChange={e => setDesc(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <select className="w-full border border-gray-300 rounded-lg p-2" value={assignee} onChange={e => setAssignee(e.target.value)}>
                            {members.map(m => {
                                const u = Object.values(USERS).find(user => user.id === m.user_id);
                                return <option key={m.user_id} value={m.user_id}>{u?.name} ({u?.role})</option>
                            })}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                        <button 
                            disabled={!title}
                            onClick={() => onCreate(title, desc, assignee, new Date().toISOString())} 
                            className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                            Create Task
                        </button>
                    </div>
             </div>
        </div>
    )
}
