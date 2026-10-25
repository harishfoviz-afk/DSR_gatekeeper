// Initial seed data and society configurations for GateKeeper AI

export const DEFAULT_SOCIETY_CONFIG = {
  societyName: 'Divi Sri Residency',
  gateName: 'Main Entrance Gate 1',
  city: 'Hyderabad',
  showResidentApp: true,
  publicAppUrl: 'https://harishfoviz-afk.github.io/DSR_gatekeeper',
  blocks: ['Block DSR'],
  floors: [1, 2, 3, 4, 5],
  flats: [
    { id: 'f_dsr_1', number: 'Block DSR-502', block: 'Block DSR', floor: 5, residentName: 'Harish', phone: '+91 98765 43210', residentName2: 'Co-Owner', phone2: '+91 91234 56789' },
  ],
  guards: [
    { id: 'g_1', name: 'M. Ramanaiah', shift: 'Day Shift (07:00 - 19:00)', gate: 'Gate 1', phone: '+91 94411 22334' },
    { id: 'g_2', name: 'B. Appa Rao', shift: 'Night Shift (19:00 - 07:00)', gate: 'Gate 1', phone: '+91 94411 22335' },
  ]
};

export const INITIAL_VISITORS = [
  {
    id: 'vis_seed_001',
    visitorName: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    flatNumber: 'Block DSR-502',
    purpose: 'delivery',
    purposeLabel: 'Amazon Delivery',
    vehicleNumber: 'TS 09 AB 4589',
    photoUrl: '',
    status: 'APPROVED',
    approvedBy: 'Resident (Block DSR-502)',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    otp: '4829',
    deniedReason: null,
    notes: 'Direct entry approved',
  }
];

export const PURPOSE_CONFIG = {
  delivery: {
    label: 'Delivery',
    subtitle: 'Amazon, Swiggy, Parcels',
    iconName: 'Package',
    color: 'amber',
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  guest: {
    label: 'Guest / Friend',
    subtitle: 'Family & Visitors',
    iconName: 'Users',
    color: 'emerald',
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  service: {
    label: 'Cab / Ride',
    subtitle: 'Uber, Ola, Taxi',
    iconName: 'Car',
    color: 'blue',
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  maintenance: {
    label: 'Repair & Service',
    subtitle: 'Electrician, Plumber, AC',
    iconName: 'Wrench',
    color: 'purple',
    bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
};

export const LANGUAGE_OPTIONS = [
  { id: 'bilingual-te', label: 'Eng + Telugu Voice', sub: 'Spoken Bilingual Guidance', flag: '🔊' },
  { id: 'te', label: 'Telugu Voice', sub: 'Spoken Telugu Guidance', flag: '🗣️' },
  { id: 'bilingual-hi', label: 'Eng + Hindi Voice', sub: 'Spoken Hinglish Guidance', flag: '🔊' },
  { id: 'hi', label: 'Hindi Voice', sub: 'Spoken Hindi Guidance', flag: '🗣️' },
  { id: 'en', label: 'English Voice', sub: 'High Clarity Spoken English', flag: '🌐' },
];
