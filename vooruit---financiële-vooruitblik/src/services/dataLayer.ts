import { Activity, AdviceCard, UserCorrection, UserData } from '../types';

export class DataLayerService {
  private static instance: DataLayerService;

  private constructor() {}

  public static getInstance(): DataLayerService {
    if (!DataLayerService.instance) {
      DataLayerService.instance = new DataLayerService();
    }
    return DataLayerService.instance;
  }

  public async getUsers(): Promise<Array<{ id: string; name: string; standardTransport: string }>> {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      return data.users || [];
    } catch (e) {
      console.error('Kon gebruikers niet ophalen:', e);
      return [
        { id: 'user-noor', name: 'Noor', standardTransport: 'Auto' },
        { id: 'user-daan', name: 'Daan', standardTransport: 'Fiets' },
        { id: 'user-samira', name: 'Samira', standardTransport: 'OV' },
      ];
    }
  }

  public async getUserData(userId: string): Promise<UserData> {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) {
      throw new Error(`Fout bij ophalen van gegevens voor gebruiker ${userId}`);
    }
    const data = await res.json();
    return data.userData;
  }

  public async refreshUserData(userId: string): Promise<UserData> {
    const res = await fetch(`/api/users/${userId}/refresh`, { method: 'POST' });
    if (!res.ok) {
      throw new Error(`Fout bij verversen van gegevens voor gebruiker ${userId}`);
    }
    const data = await res.json();
    return data.userData;
  }

  public async addActivity(userId: string, activity: Activity): Promise<UserData> {
    const res = await fetch(`/api/users/${userId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
    if (!res.ok) {
      throw new Error('Fout bij toevoegen van activiteit');
    }
    const data = await res.json();
    return data.userData;
  }

  public async updateActivity(userId: string, activityId: string, updates: Partial<Activity>): Promise<UserData> {
    const res = await fetch(`/api/users/${userId}/activities/${activityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      throw new Error('Fout bij bijwerken van activiteit');
    }
    const data = await res.json();
    return data.userData;
  }

  public async deleteActivity(userId: string, activityId: string): Promise<UserData> {
    const res = await fetch(`/api/users/${userId}/activities/${activityId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Fout bij verwijderen van activiteit');
    }
    const data = await res.json();
    return data.userData;
  }

  public async applyCorrection(
    userId: string,
    activityId: string,
    action: string,
    summary: string,
    previousState: Partial<Activity>,
    isPermanentRoutine?: boolean
  ): Promise<UserData> {
    const res = await fetch(`/api/users/${userId}/corrections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId, action, summary, previousState, isPermanentRoutine }),
    });
    if (!res.ok) {
      throw new Error('Fout bij opslaan van correctie');
    }
    const data = await res.json();
    return data.userData;
  }

  public async undoCorrection(userId: string, activityId: string): Promise<UserData> {
    const res = await fetch(`/api/users/${userId}/corrections/${activityId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Fout bij ongedaan maken van correctie');
    }
    const data = await res.json();
    return data.userData;
  }

  public async getProactiveAdvice(userId: string, currentDate?: string): Promise<{ cards: AdviceCard[]; dataVersion: number; lastSyncTime: string }> {
    const url = currentDate 
      ? `/api/users/${userId}/proactive-advice?currentDate=${encodeURIComponent(currentDate)}`
      : `/api/users/${userId}/proactive-advice`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Kon proactieve advieskaarten niet ophalen');
    }
    const data = await res.json();
    return {
      cards: data.cards || [],
      dataVersion: data.dataVersion || 1,
      lastSyncTime: data.lastSyncTime || new Date().toISOString(),
    };
  }

  public async dismissAdviceCard(userId: string, cardId: string): Promise<void> {
    await fetch(`/api/users/${userId}/advice/${cardId}/action`, { method: 'POST' });
  }

  public async resetUserDemo(userId: string): Promise<UserData> {
    const res = await fetch(`/api/users/${userId}/reset`, { method: 'POST' });
    if (!res.ok) {
      throw new Error('Fout bij herstellen van demo');
    }
    const data = await res.json();
    return data.userData;
  }
}

export const dataLayer = DataLayerService.getInstance();
