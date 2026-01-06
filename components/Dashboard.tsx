import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { DealStatus, Deal } from '../types';
import { Filter, Search, Plus, ArrowRight, Lock } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const { deals, rooms, currentUser, createDealRoom } = useApp();
  const [filter, setFilter] = useState<DealStatus | 'All'>('Open');
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [dealToCreateRoomFor, setDealToCreateRoomFor] = useState<Deal | null>(null);

  // If Stakeholder, show only assigned rooms
  const assignedRoomIds = useApp().members
    .filter(m => m.user_id === currentUser?.id)
    .map(m => m.deal_room_id);

  const stakeholderRooms = rooms.filter(r => assignedRoomIds.includes(r.id));

  // If AE, show CRM Deals
  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchesFilter = filter === 'All' || d.status === filter;
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.account_name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [deals, filter, search]);

  // Chart Data (Simple Velocity Mock)
  const chartData = [
      { name: 'Mon', value: 2 },
      { name: 'Tue', value: 4 },
      { name: 'Wed', value: 3 },
      { name: 'Thu', value: 7 },
      { name: 'Fri', value: 9 },
  ];

  if (currentUser?.role === 'stakeholder') {
      return (
          <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">My Assigned Deal Rooms</h1>
              {stakeholderRooms.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-500">You haven't been invited to any Deal Rooms yet.</p>
                  </div>
              ) : (
                  <div className="grid gap-4">
                      {stakeholderRooms.map(room => {
                          const deal = deals.find(d => d.id === room.deal_id);
                          return (
                              <div key={room.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                                  <div>
                                      <h3 className="text-lg font-semibold text-gray-900">{deal?.name || 'Unknown Deal'}</h3>
                                      <p className="text-sm text-gray-500">{deal?.account_name}</p>
                                  </div>
                                  <button 
                                    onClick={() => window.location.hash = `#/room/${room.id}`}
                                    className="text-[#4A90E2] font-medium hover:text-blue-700 flex items-center"
                                  >
                                      Enter Room <ArrowRight className="ml-2 h-4 w-4" />
                                  </button>
                              </div>
                          )
                      })}
                  </div>
              )}
          </div>
      )
  }

  // AE View
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Deals</h1>
            <p className="text-gray-500 text-sm mt-1">Synced from Salesforce • Updated 5m ago</p>
        </div>
        {/* Tiny Visualization for "Simplicity" but adhering to tech req */}
        <div className="hidden lg:block w-48 h-12">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <Tooltip cursor={false} content={<></>} />
                    <Area type="monotone" dataKey="value" stroke="#4A90E2" fill="#4A90E2" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search deals or accounts..." 
            className="pl-10 w-full rounded-md border-gray-300 border p-2 focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex space-x-2 overflow-x-auto">
            {(['Open', 'Closed-Won', 'Closed-Lost', 'All'] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        filter === status 
                        ? 'bg-blue-50 text-[#4A90E2] ring-1 ring-[#4A90E2]' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Stage</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeals.map(deal => {
                      const existingRoom = rooms.find(r => r.deal_id === deal.id);
                      return (
                          <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{deal.name}</div>
                                  <div className="text-sm text-gray-500 sm:hidden">{deal.account_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                  <div className="text-sm text-gray-500">{deal.account_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">${deal.amount.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${deal.status === 'Closed-Won' ? 'bg-green-100 text-green-800' : 
                                      deal.status === 'Closed-Lost' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                      {deal.stage}
                                  </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {existingRoom ? (
                                      <button 
                                        onClick={() => window.location.hash = `#/room/${existingRoom.id}`}
                                        className="text-[#4A90E2] hover:text-blue-900"
                                      >
                                          Enter Room
                                      </button>
                                  ) : (
                                      <button 
                                        onClick={() => setDealToCreateRoomFor(deal)}
                                        className="text-gray-400 hover:text-[#4A90E2]"
                                      >
                                          <Plus className="h-5 w-5 ml-auto" />
                                      </button>
                                  )}
                              </td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
          {filteredDeals.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                  No deals found matching your criteria.
              </div>
          )}
      </div>

      {/* Create Room Modal */}
      {dealToCreateRoomFor && (
          <CreateRoomModal 
            deal={dealToCreateRoomFor} 
            onClose={() => setDealToCreateRoomFor(null)} 
            onCreate={(templateId) => {
                createDealRoom(dealToCreateRoomFor.id, templateId);
                setDealToCreateRoomFor(null);
            }} 
          />
      )}
    </div>
  );
};

// Sub-components for Dashboard to keep file clean
import { TEMPLATES } from '../constants';

const CreateRoomModal: React.FC<{ deal: Deal, onClose: () => void, onCreate: (tId: string) => void }> = ({ deal, onClose, onCreate }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Create Deal Room for {deal.account_name}</h2>
                <p className="text-gray-500 mb-6">Select a template to pre-populate tasks for this deal.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {TEMPLATES.map(t => (
                        <div 
                            key={t.id} 
                            onClick={() => onCreate(t.id)}
                            className="border border-gray-200 rounded-lg p-4 hover:border-[#4A90E2] hover:bg-blue-50 cursor-pointer transition-all group"
                        >
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#4A90E2] mb-2">{t.name}</h3>
                            <p className="text-xs text-gray-500">{t.description}</p>
                            <div className="mt-4 text-xs text-gray-400">
                                {t.defaultTasks.length} tasks included
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                </div>
            </div>
        </div>
    )
}
