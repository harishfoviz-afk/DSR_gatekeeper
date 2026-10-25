import React, { useState, useEffect } from 'react';
import {
  Building2,
  Layers,
  DoorClosed,
  Shield,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  X,
  RotateCcw,
  Sparkles,
  MapPin,
  Phone,
  User,
  Info,
  Download,
  AlertCircle,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { saveSocietyConfig, resetSeedData } from '../../services/db';

export default function AdminPanel({ societyConfig, onUpdateConfig, visitors = [] }) {
  const [activeTab, setActiveTab] = useState('flats'); // 'flats' | 'blocks' | 'guards' | 'society' | 'logs'
  const [config, setConfig] = useState(societyConfig || {});
  const [profileDirty, setProfileDirty] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states for adding a new flat
  const [newFlatNum, setNewFlatNum] = useState('');
  const [newFlatBlock, setNewFlatBlock] = useState(config.blocks?.[0] || 'Block DSR');
  const [newFlatFloor, setNewFlatFloor] = useState(1);
  const [newResidentName, setNewResidentName] = useState('');
  const [newResidentPhone, setNewResidentPhone] = useState('');

  // Inline Flat Editing states
  const [editingFlatId, setEditingFlatId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editFloor, setEditFloor] = useState(1);
  const [editBlock, setEditBlock] = useState('');

  // Form states for adding a new block
  const [newBlockName, setNewBlockName] = useState('');

  // Form states for adding a new guard
  const [newGuardName, setNewGuardName] = useState('');
  const [newGuardShift, setNewGuardShift] = useState('Day Shift (07:00 - 19:00)');
  const [newGuardGate, setNewGuardGate] = useState('Main Gate 1');
  const [newGuardPhone, setNewGuardPhone] = useState('');

  // Keep local config in sync with parent prop, preserving active edits
  useEffect(() => {
    if (societyConfig && Object.keys(societyConfig).length > 0) {
      setConfig(prev => ({
        ...societyConfig,
        ...(profileDirty ? {
          societyName: prev.societyName,
          gateName: prev.gateName,
          city: prev.city
        } : {})
      }));
      if (!newFlatBlock && societyConfig.blocks?.length) {
        setNewFlatBlock(societyConfig.blocks[0]);
      }
    }
  }, [societyConfig, profileDirty]);

  // Persist config changes to LocalStorage and Firestore
  const triggerSave = async (updated) => {
    setConfig(updated);
    setProfileDirty(false);
    await saveSocietyConfig(updated);
    if (onUpdateConfig) onUpdateConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // ----------------------------------------------------
  // FLAT OPERATIONS
  // ----------------------------------------------------
  const handleAddFlat = (e) => {
    e.preventDefault();
    if (!newFlatNum.trim()) return;

    const rawNum = newFlatNum.trim();
    const formattedNum = rawNum.includes('-')
      ? rawNum.toUpperCase()
      : `${newFlatBlock}-${rawNum}`;

    const newFlatObj = {
      id: `f_${Date.now()}`,
      number: formattedNum,
      block: newFlatBlock,
      floor: Number(newFlatFloor) || 1,
      residentName: newResidentName.trim() || 'Resident',
      phone: newResidentPhone.trim() || '',
    };

    const updated = {
      ...config,
      flats: [...(config.flats || []), newFlatObj]
    };

    triggerSave(updated);
    setNewFlatNum('');
    setNewResidentName('');
    setNewResidentPhone('');
  };

  const handleDeleteFlat = (flatId) => {
    if (confirm("Remove this flat from directory?")) {
      const updated = {
        ...config,
        flats: (config.flats || []).filter(f => f.id !== flatId && f.number !== flatId)
      };
      triggerSave(updated);
    }
  };

  const startEditingFlat = (flat) => {
    setEditingFlatId(flat.id || flat.number);
    setEditName(flat.residentName || '');
    setEditPhone(flat.phone || '');
    setEditFloor(flat.floor || 1);
    setEditBlock(flat.block || (flat.number?.includes('-') ? flat.number.split('-')[0] : config.blocks?.[0] || 'Block DSR'));
  };

  const cancelEditingFlat = () => {
    setEditingFlatId(null);
  };

  const saveEditingFlat = (flatId) => {
    const updatedFlats = (config.flats || []).map(f => {
      if ((f.id || f.number) === flatId) {
        return {
          ...f,
          residentName: editName.trim() || 'Resident',
          phone: editPhone.trim(),
          floor: Number(editFloor) || 1,
          block: editBlock || f.block,
        };
      }
      return f;
    });

    const updated = {
      ...config,
      flats: updatedFlats
    };
    triggerSave(updated);
    setEditingFlatId(null);
  };

  // ----------------------------------------------------
  // BLOCK OPERATIONS
  // ----------------------------------------------------
  const handleAddBlock = (e) => {
    e.preventDefault();
    const b = newBlockName.trim();
    if (!b || config.blocks?.includes(b)) return;

    const updated = {
      ...config,
      blocks: [...(config.blocks || []), b]
    };
    triggerSave(updated);
    setNewBlockName('');
  };

  const handleDeleteBlock = (blockName) => {
    if (confirm(`Remove Block "${blockName}"? Flats in this block will remain in directory.`)) {
      const updated = {
        ...config,
        blocks: (config.blocks || []).filter(b => b !== blockName)
      };
      triggerSave(updated);
    }
  };

  // ----------------------------------------------------
  // GUARD OPERATIONS
  // ----------------------------------------------------
  const handleAddGuard = (e) => {
    e.preventDefault();
    if (!newGuardName.trim()) return;

    const newG = {
      id: `g_${Date.now()}`,
      name: newGuardName.trim(),
      shift: newGuardShift,
      gate: newGuardGate,
      phone: newGuardPhone.trim(),
    };

    const updated = {
      ...config,
      guards: [...(config.guards || []), newG]
    };
    triggerSave(updated);
    setNewGuardName('');
    setNewGuardPhone('');
  };

  const handleDeleteGuard = (guardId) => {
    const updated = {
      ...config,
      guards: (config.guards || []).filter(g => g.id !== guardId)
    };
    triggerSave(updated);
  };

  // ----------------------------------------------------
  // SOCIETY PROFILE OPERATIONS (AUTO-SAVE & SUBMIT)
  // ----------------------------------------------------
  const handleProfileChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setProfileDirty(true);
  };

  const handleProfileBlur = () => {
    if (profileDirty) {
      triggerSave(config);
    }
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    triggerSave(config);
  };

  // Export Visitor Log
  const handleExportVisitors = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(visitors, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `gatekeeper_visitor_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Admin Panel Header */}
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg">
            <Building2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Facility & Society Administration
              </span>
              {savedSuccess ? (
                <span className="text-xs text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold animate-fadeIn">
                  <Check className="w-3.5 h-3.5" /> Saved & Persisted!
                </span>
              ) : profileDirty ? (
                <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Unsaved changes...
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  Data Persistently Saved in LocalStorage & Cloud
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {config.societyName || 'Divi Sri Residency'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('society')}
                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                title="Edit Apartment Name & Profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {config.gateName || 'Main Entrance Gate 1'} • {config.city || 'Hyderabad'}
            </p>
          </div>
        </div>

        {/* Quick Action Export & Save */}
        <div className="flex items-center gap-2">
          {profileDirty && (
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Save Changes</span>
            </button>
          )}
          <button
            onClick={handleExportVisitors}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Logs (JSON)</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
        {[
          { id: 'flats', label: 'Flats & Residents', sub: 'Apartments & Mobile Directory', icon: DoorClosed, count: config.flats?.length || 0 },
          { id: 'blocks', label: 'Blocks & Floors', sub: 'Towers & Floor Levels', icon: Layers, count: config.blocks?.length || 0 },
          { id: 'guards', label: 'Security Guards', sub: 'Staff & Shift Rosters', icon: Shield, count: config.guards?.length || 0 },
          { id: 'society', label: 'Apartment Profile', sub: 'Society Name & Gate Details', icon: Building2 },
          { id: 'logs', label: 'Audit Records', sub: 'Visitor Access Trail', icon: Info, count: visitors.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <div className="text-left">
                <div>{tab.label} {tab.count !== undefined && <span className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>{tab.count}</span>}</div>
                <div className="text-[10px] opacity-75 font-normal">{tab.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FLATS & RESIDENTS DIRECTORY */}
      {activeTab === 'flats' && (
        <div className="space-y-6">
          {/* Add Flat Form with Mobile / WhatsApp Field */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Add New Flat to Community</span>
              </h3>
              <span className="text-xs text-slate-400">
                All details persist automatically in society configuration
              </span>
            </div>

            <form onSubmit={handleAddFlat} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Block Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Block / Tower *
                  </label>
                  <select
                    value={newFlatBlock}
                    onChange={(e) => setNewFlatBlock(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    {(config.blocks || ['Block DSR', 'A', 'B', 'C', 'D']).map(b => (
                      <option key={b} value={b}>Block {b}</option>
                    ))}
                  </select>
                </div>

                {/* Flat Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Flat No. (e.g. 101, 502) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 502 or A-101"
                    value={newFlatNum}
                    onChange={(e) => setNewFlatNum(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                {/* Floor Level */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Floor Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={newFlatFloor}
                    onChange={(e) => setNewFlatFloor(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Resident / Owner Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Resident Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Harish Kumar"
                      value={newResidentName}
                      onChange={(e) => setNewResidentName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Mobile / WhatsApp Number Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                    <span>Mobile / WhatsApp *</span>
                    <span className="text-[10px] text-emerald-400/80 font-normal">For WhatsApp</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={newResidentPhone}
                      onChange={(e) => setNewResidentPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-emerald-500/50 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-mono font-medium placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Visitor arrival WhatsApp approval messages will be sent directly to this number.</span>
                </p>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Save Flat & Owner Details</span>
                </button>
              </div>
            </form>
          </div>

          {/* Directory Table with Inline Edit Support */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Active Flats Directory ({config.flats?.length || 0} Registered)
                </span>
                <p className="text-[11px] text-slate-500">
                  Tap ✏️ to update any resident name or mobile number inline
                </p>
              </div>
              <span className="text-xs text-emerald-400/90 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                {config.flats?.filter(f => f.phone).length || 0} / {config.flats?.length || 0} WhatsApp Enabled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Flat Number</th>
                    <th className="py-3 px-4">Block / Tower</th>
                    <th className="py-3 px-4">Floor</th>
                    <th className="py-3 px-4">Resident Name</th>
                    <th className="py-3 px-4">Mobile / WhatsApp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {(config.flats || []).map((f) => {
                    const flatKey = f.id || f.number;
                    const isEditing = editingFlatId === flatKey;

                    if (isEditing) {
                      return (
                        <tr key={flatKey} className="bg-emerald-950/20 border-l-4 border-l-emerald-500">
                          <td className="py-2.5 px-4 font-mono font-black text-emerald-400">
                            {f.number}
                          </td>
                          <td className="py-2.5 px-4">
                            <select
                              value={editBlock}
                              onChange={(e) => setEditBlock(e.target.value)}
                              className="px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                            >
                              {(config.blocks || ['Block DSR', 'A', 'B', 'C', 'D']).map(b => (
                                <option key={b} value={b}>Block {b}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={editFloor}
                              onChange={(e) => setEditFloor(e.target.value)}
                              className="w-16 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                            />
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Resident Name"
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                            />
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="tel"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              placeholder="e.g. 9876543210"
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-emerald-500/70 rounded-lg text-xs text-emerald-400 font-mono"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => saveEditingFlat(flatKey)}
                                className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold transition"
                                title="Save changes"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingFlat}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={flatKey} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-black text-emerald-400 text-sm">
                          {f.number}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-200">
                          {f.block ? (f.block.startsWith('Block') ? f.block : `Block ${f.block}`) : (f.number.includes('-') ? `Block ${f.number.split('-')[0]}` : '—')}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          Floor {f.floor || '1'}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">
                          {f.residentName || 'Resident'}
                        </td>
                        <td className="py-3 px-4">
                          {f.phone ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg font-mono font-medium text-[11px]">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{f.phone}</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditingFlat(f)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-[11px] hover:bg-amber-500/20 transition"
                              title="Click to add mobile number"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>Missing Mobile (Add ✏️)</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => startEditingFlat(f)}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                              title="Edit flat & contact"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFlat(flatKey)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete flat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLOCKS & FLOORS */}
      {activeTab === 'blocks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blocks Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Tower & Block Configuration</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Add custom block names (e.g., Block DSR, Block A, Tower 1)
            </p>

            <form onSubmit={handleAddBlock} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New Block Name (e.g. Block DSR, Tower 2)"
                value={newBlockName}
                onChange={(e) => setNewBlockName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition"
              >
                Add Block
              </button>
            </form>

            <div className="space-y-2">
              {(config.blocks || []).map(block => {
                const flatCount = (config.flats || []).filter(f => {
                  const b = f.block || (f.number.includes('-') ? f.number.split('-')[0] : '');
                  return b === block || b === `Block ${block}`;
                }).length;
                return (
                  <div key={block} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-black text-white text-sm">
                        {block.startsWith('Block') ? block : `Block ${block}`}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">({flatCount} flats mapped)</span>
                    </div>
                    <button
                      onClick={() => handleDeleteBlock(block)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                      title="Delete block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floors Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Floor Levels</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Active floor levels in the community:
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(fl => (
                <div key={fl} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <div className="text-lg font-black text-emerald-400 font-mono">{fl}</div>
                  <div className="text-[10px] text-slate-400">Floor Level</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY GUARDS & GATES */}
      {activeTab === 'guards' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-base font-black text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Register Gate Security Personnel</span>
            </h3>

            <form onSubmit={handleAddGuard} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Guard Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M. Ramanaiah"
                  value={newGuardName}
                  onChange={(e) => setNewGuardName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Duty Shift</label>
                <select
                  value={newGuardShift}
                  onChange={(e) => setNewGuardShift(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>Day Shift (07:00 - 19:00)</option>
                  <option>Night Shift (19:00 - 07:00)</option>
                  <option>Rotational 24x7</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gate Assigned</label>
                <input
                  type="text"
                  value={newGuardGate}
                  onChange={(e) => setNewGuardGate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition"
                >
                  Register Guard
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(config.guards || []).map(guard => (
              <div key={guard.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
                    {guard.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{guard.name}</h4>
                    <div className="text-xs text-slate-400">{guard.shift} • <strong className="text-emerald-400">{guard.gate}</strong></div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteGuard(guard.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition"
                  title="Remove guard"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: APARTMENT SOCIETY PROFILE (RETAINS KEYED-IN DETAILS WITH AUTO-SAVE) */}
      {activeTab === 'society' && (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Community Identity & Details</span>
              </h3>
              <p className="text-xs text-slate-400">
                Keyed-in details are automatically retained and synced to LocalStorage & Cloud
              </p>
            </div>
            {savedSuccess && (
              <span className="text-xs text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1 font-bold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Apartment / Society Name *</span>
              <span className="text-[10px] text-emerald-400">Displayed on Kiosk & Header</span>
            </label>
            <input
              type="text"
              required
              value={config.societyName || ''}
              onChange={(e) => handleProfileChange('societyName', e.target.value)}
              onBlur={handleProfileBlur}
              placeholder="e.g. Divi Sri Residency"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gate / Entrance Name</label>
              <input
                type="text"
                value={config.gateName || ''}
                onChange={(e) => handleProfileChange('gateName', e.target.value)}
                onBlur={handleProfileBlur}
                placeholder="e.g. Main Entrance Gate 1"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">City / Location</label>
              <input
                type="text"
                value={config.city || ''}
                onChange={(e) => handleProfileChange('city', e.target.value)}
                onBlur={handleProfileBlur}
                placeholder="e.g. Hyderabad"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Public Web URL for WhatsApp Links (Optional)</span>
              <span className="text-[10px] text-emerald-400">Makes links 1-tap clickable</span>
            </label>
            <input
              type="text"
              value={config.publicAppUrl || ''}
              onChange={(e) => handleProfileChange('publicAppUrl', e.target.value)}
              onBlur={handleProfileBlur}
              placeholder="e.g. https://your-name.github.io/DSRV or ngrok URL"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              WhatsApp disables clickable links for <code>http://localhost</code>. Enter your deployed GitHub Pages or public domain here so WhatsApp formats them as 1-tap blue links on phones!
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Changes auto-save upon clicking away or tapping Save below</span>
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Save Society Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-400" />
              <span>Visitor Access Audit Trail ({visitors.length} total entries)</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm("Reset demo visitor activity logs? (Your custom apartment name and flats directory will NOT be modified)")) {
                    resetSeedData(false);
                  }
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Reset Visitor Activity Logs
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Visitor</th>
                  <th className="py-2.5 px-3">Flat</th>
                  <th className="py-2.5 px-3">Purpose</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Passcode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {visitors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-400">{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{v.visitorName}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">{v.flatNumber}</td>
                    <td className="py-2.5 px-3 text-slate-300">{v.purposeLabel}</td>
                    <td className="py-2.5 px-3 font-bold">{v.status}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">{v.otp || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
