// Unified Data Service: Firebase Firestore with automatic LocalStorage + BroadcastChannel fallback
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { INITIAL_VISITORS, DEFAULT_SOCIETY_CONFIG } from './mockData';

const LOCAL_STORAGE_KEY = 'gatekeeper_visitors_v2';
const SOCIETY_CONFIG_KEY = 'gatekeeper_society_config_v2';
const FIREBASE_CONFIG_KEY = 'gatekeeper_custom_firebase_config';
const BROADCAST_CHANNEL_NAME = 'gatekeeper_sync_channel';

// Channel for instant multi-tab communication in offline/local mode
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn("BroadcastChannel not available:", e);
}

// Default Production Firebase Config for dsrv-dashboard
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCPNgg-J15h8bQT7xbb9Q-WoX5MSSSY22s",
  authDomain: "dsrv-dashboard.firebaseapp.com",
  projectId: "dsrv-dashboard",
  storageBucket: "dsrv-dashboard.firebasestorage.app",
  messagingSenderId: "350287725828",
  appId: "1:350287725828:web:d6f334db9b07bb0848fc51",
  measurementId: "G-6R6NCJKFWH"
};

// Check for Firebase credentials
export function getActiveFirebaseConfig() {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return { config: envConfig, source: 'firebase' };
  }

  try {
    const custom = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey && parsed.projectId) {
        return { config: parsed, source: 'custom' };
      }
    }
  } catch (e) {
    // ignore
  }

  return { config: DEFAULT_FIREBASE_CONFIG, source: 'firebase' };
}

let firebaseApp = null;
let firestoreDb = null;

function initFirebaseIfAvailable() {
  const active = getActiveFirebaseConfig();
  if (active && active.config) {
    try {
      if (!getApps().length) {
        firebaseApp = initializeApp(active.config);
      } else {
        firebaseApp = getApp();
      }
      firestoreDb = getFirestore(firebaseApp);
      return { isFirebase: true, source: active.source };
    } catch (err) {
      console.warn("Failed to initialize Firebase, falling back to local sync:", err);
      return { isFirebase: false, error: err.message };
    }
  }
  return { isFirebase: false, source: 'none' };
}

// LocalStorage helpers
function getLocalVisitors() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_VISITORS));
      return INITIAL_VISITORS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading localStorage:", err);
    return INITIAL_VISITORS;
  }
}

function saveLocalVisitors(visitors) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visitors));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC_VISITORS', visitors });
    }
    window.dispatchEvent(new CustomEvent('gatekeeper_local_update', { detail: visitors }));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
}

/**
 * Society Configuration (Towers, Blocks, Floors, Flats, Guards)
 */
export function getSocietyConfig() {
  try {
    const raw = localStorage.getItem(SOCIETY_CONFIG_KEY);
    if (!raw) {
      localStorage.setItem(SOCIETY_CONFIG_KEY, JSON.stringify(DEFAULT_SOCIETY_CONFIG));
      return DEFAULT_SOCIETY_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SOCIETY_CONFIG,
      ...parsed,
      societyName: parsed.societyName || DEFAULT_SOCIETY_CONFIG.societyName,
      blocks: parsed.blocks && parsed.blocks.length > 0 ? parsed.blocks : DEFAULT_SOCIETY_CONFIG.blocks,
      flats: parsed.flats && parsed.flats.length > 0 ? parsed.flats : DEFAULT_SOCIETY_CONFIG.flats,
    };
  } catch (e) {
    return DEFAULT_SOCIETY_CONFIG;
  }
}

export async function saveSocietyConfig(config) {
  try {
    localStorage.setItem(SOCIETY_CONFIG_KEY, JSON.stringify(config));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC_SOCIETY_CONFIG', config });
    }
    window.dispatchEvent(new CustomEvent('gatekeeper_society_update', { detail: config }));

    // Sync to Firestore if active
    const fb = initFirebaseIfAvailable();
    if (fb.isFirebase && firestoreDb) {
      await setDoc(doc(firestoreDb, 'settings', 'societyConfig'), config);
    }
  } catch (e) {
    console.error("Failed to save society config:", e);
  }
}

export function subscribeToSocietyConfig(callback) {
  // initial emit
  callback(getSocietyConfig());

  const handleBroadcast = (event) => {
    if (event.data && event.data.type === 'SYNC_SOCIETY_CONFIG') {
      callback(event.data.config);
    }
  };

  const handleLocal = (event) => {
    callback(event.detail);
  };

  if (broadcastChannel) broadcastChannel.addEventListener('message', handleBroadcast);
  window.addEventListener('gatekeeper_society_update', handleLocal);

  // Firestore remote listener if active
  let unsubscribeFb = null;
  const fb = initFirebaseIfAvailable();
  if (fb.isFirebase && firestoreDb) {
    try {
      unsubscribeFb = onSnapshot(doc(firestoreDb, 'settings', 'societyConfig'), (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data());
        }
      });
    } catch (e) {
      // ignore
    }
  }

  return () => {
    if (broadcastChannel) broadcastChannel.removeEventListener('message', handleBroadcast);
    window.removeEventListener('gatekeeper_society_update', handleLocal);
    if (unsubscribeFb) unsubscribeFb();
  };
}

/**
 * Subscribe to visitors collection (real-time stream)
 */
export function subscribeToVisitors(callback) {
  const firebaseStatus = initFirebaseIfAvailable();

  if (firebaseStatus.isFirebase && firestoreDb) {
    try {
      const q = query(collection(firestoreDb, 'visitors'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const visitors = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback(visitors, { source: 'firebase' });
        },
        (error) => {
          console.error("Firestore onSnapshot error, falling back to LocalStorage:", error);
          listenLocally(callback);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn("Firestore subscription failed, using local storage:", err);
      return listenLocally(callback);
    }
  }

  return listenLocally(callback);
}

function listenLocally(callback) {
  callback(getLocalVisitors(), { source: 'local' });

  const handleBroadcast = (event) => {
    if (event.data && event.data.type === 'SYNC_VISITORS') {
      callback(event.data.visitors, { source: 'local' });
    }
  };

  const handleLocalUpdate = (event) => {
    callback(event.detail, { source: 'local' });
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
      try {
        callback(JSON.parse(event.newValue), { source: 'local' });
      } catch (e) {
        // ignore
      }
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('gatekeeper_local_update', handleLocalUpdate);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('gatekeeper_local_update', handleLocalUpdate);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Add a new visitor
 */
export async function addVisitor(visitorData) {
  const id = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record = {
    id,
    visitorName: visitorData.visitorName.trim(),
    phone: visitorData.phone ? visitorData.phone.trim() : '',
    flatNumber: visitorData.flatNumber.trim().toUpperCase(),
    purpose: visitorData.purpose || 'guest',
    purposeLabel: visitorData.purposeLabel || 'Guest',
    vehicleNumber: visitorData.vehicleNumber ? visitorData.vehicleNumber.trim().toUpperCase() : '',
    photoUrl: visitorData.photoUrl || '',
    status: visitorData.status || 'PENDING',
    timestamp: new Date().toISOString(),
    otp: visitorData.otp || Math.floor(1000 + Math.random() * 9000).toString(),
    deniedReason: null,
    notes: visitorData.notes || '',
  };

  const firebaseStatus = initFirebaseIfAvailable();
  if (firebaseStatus.isFirebase && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'visitors', id), {
        ...record,
        serverTimestamp: serverTimestamp()
      });
      return record;
    } catch (err) {
      console.warn("Firestore addDoc failed, writing to LocalStorage:", err);
    }
  }

  const current = getLocalVisitors();
  const updated = [record, ...current];
  saveLocalVisitors(updated);
  return record;
}

/**
 * Update visitor status
 */
export async function updateVisitorStatus(id, newStatus, extraData = {}) {
  const firebaseStatus = initFirebaseIfAvailable();
  if (firebaseStatus.isFirebase && firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'visitors', id);
      await updateDoc(docRef, {
        status: newStatus,
        ...extraData,
        lastUpdated: new Date().toISOString()
      });
      return;
    } catch (err) {
      console.warn("Firestore updateDoc failed, updating local copy:", err);
    }
  }

  const current = getLocalVisitors();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status: newStatus,
        ...extraData,
        lastUpdated: new Date().toISOString()
      };
    }
    return item;
  });
  saveLocalVisitors(updated);
}

/**
 * Delete a visitor record
 */
export async function deleteVisitor(id) {
  const firebaseStatus = initFirebaseIfAvailable();
  if (firebaseStatus.isFirebase && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'visitors', id));
      return;
    } catch (err) {
      console.warn("Firestore delete failed:", err);
    }
  }

  const current = getLocalVisitors();
  const updated = current.filter(item => item.id !== id);
  saveLocalVisitors(updated);
}

export function resetSeedData(resetSociety = false) {
  saveLocalVisitors(INITIAL_VISITORS);
  if (resetSociety) {
    localStorage.setItem(SOCIETY_CONFIG_KEY, JSON.stringify(DEFAULT_SOCIETY_CONFIG));
    window.dispatchEvent(new CustomEvent('gatekeeper_society_update', { detail: DEFAULT_SOCIETY_CONFIG }));
  }
}

export function saveCustomFirebaseConfig(config) {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
  window.location.reload();
}

export function clearCustomFirebaseConfig() {
  localStorage.removeItem(FIREBASE_CONFIG_KEY);
  window.location.reload();
}
