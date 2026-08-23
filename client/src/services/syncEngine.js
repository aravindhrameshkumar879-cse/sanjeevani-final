/**
 * SanjeevaniConnect Sync Engine & Network State Machine
 * 
 * Manages transitions: 🔴 Offline-only -> 🟡 Syncing -> 🟢 Synced
 * Listens for network reconnects and auto-pushes offline queue to backend.
 */

import { LocalStorageService } from './storage.js';

class SyncEngine {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isSimulatedOffline = false;
    this.syncState = 'idle'; // 'idle' | 'syncing' | 'synced' | 'error'
    this.listeners = new Set();
    this.syncInterval = null;

    // Listen to real browser network changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  // Subscribe to sync engine status updates
  subscribe(callback) {
    this.listeners.add(callback);
    // Initial emit
    callback(this.getStatus());
    return () => this.listeners.delete(callback);
  }

  notify() {
    const status = this.getStatus();
    this.listeners.forEach(cb => {
      try {
        cb(status);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  getStatus() {
    const effectiveOnline = this.isEffectiveOnline();
    const unsyncedItems = LocalStorageService.getUnsyncedConsultations();
    
    let overallBadge = 'synced'; // 'offline' | 'syncing' | 'synced'
    if (!effectiveOnline || unsyncedItems.length > 0) {
      if (this.syncState === 'syncing') {
        overallBadge = 'syncing';
      } else if (!effectiveOnline || unsyncedItems.length > 0) {
        overallBadge = 'offline';
      }
    }

    return {
      isEffectiveOnline: effectiveOnline,
      isRealOnline: this.isOnline,
      isSimulatedOffline: this.isSimulatedOffline,
      syncState: this.syncState,
      overallBadge,
      unsyncedCount: unsyncedItems.length,
      lastSyncTime: this.lastSyncTime || null
    };
  }

  isEffectiveOnline() {
    return this.isOnline && !this.isSimulatedOffline;
  }

  // Toggle simulated zero connectivity (for testing offline flow)
  toggleSimulatedOffline(forceValue) {
    if (typeof forceValue === 'boolean') {
      this.isSimulatedOffline = forceValue;
    } else {
      this.isSimulatedOffline = !this.isSimulatedOffline;
    }
    
    console.log(`[SyncEngine] Simulated Offline changed to: ${this.isSimulatedOffline}`);
    this.notify();

    // If connectivity restored, auto-sync instantly
    if (this.isEffectiveOnline()) {
      this.syncPendingConsultations();
    }
  }

  handleNetworkChange(online) {
    this.isOnline = online;
    console.log(`[SyncEngine] Real network state changed: ${online ? 'ONLINE' : 'OFFLINE'}`);
    this.notify();

    if (this.isEffectiveOnline()) {
      this.syncPendingConsultations();
    }
  }

  // Auto-sync or manual sync trigger
  async syncPendingConsultations() {
    if (!this.isEffectiveOnline()) {
      console.log('[SyncEngine] Cannot sync: Device is offline');
      return { success: false, reason: 'offline' };
    }

    const pending = LocalStorageService.getUnsyncedConsultations();
    if (pending.length === 0) {
      this.syncState = 'idle';
      this.notify();
      return { success: true, count: 0, message: 'Queue is clean' };
    }

    console.log(`[SyncEngine] 🟡 Starting sync of ${pending.length} offline case(s)...`);
    this.syncState = 'syncing';
    
    // Mark items as 'queued' / 'syncing' locally
    pending.forEach(item => {
      LocalStorageService.updateSyncStatus(item._id, 'queued');
    });
    this.notify();

    try {
      const response = await fetch('/api/consultations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pending)
      });

      if (!response.ok) {
        throw new Error(`Sync HTTP error ${response.status}`);
      }

      const result = await response.json();
      console.log(`[SyncEngine] 🟢 Sync successful:`, result);

      // Update all local records to 'synced' with cloud timestamp
      if (result.syncedItems && Array.isArray(result.syncedItems)) {
        result.syncedItems.forEach(cloudItem => {
          LocalStorageService.updateSyncStatus(cloudItem.localQueueId || cloudItem._id, 'synced', cloudItem);
        });
      } else {
        pending.forEach(item => {
          LocalStorageService.updateSyncStatus(item._id, 'synced');
        });
      }

      this.syncState = 'synced';
      this.lastSyncTime = new Date().toISOString();
      this.notify();

      setTimeout(() => {
        this.syncState = 'idle';
        this.notify();
      }, 3000);

      return { success: true, count: pending.length, data: result };
    } catch (err) {
      console.warn('[SyncEngine] Sync failed or server unreachable:', err.message);
      this.syncState = 'error';
      // Revert items back to offline
      pending.forEach(item => {
        LocalStorageService.updateSyncStatus(item._id, 'offline');
      });
      this.notify();
      return { success: false, error: err.message };
    }
  }

  // Fetch updated consultation list from server (reconciliation)
  async fetchCloudConsultations() {
    if (!this.isEffectiveOnline()) return null;
    try {
      const res = await fetch('/api/consultations');
      if (res.ok) {
        const data = await res.json();
        return data.consultations;
      }
    } catch (e) {
      // Ignore network errors in offline mode
    }
    return null;
  }
}

export const syncEngine = new SyncEngine();
