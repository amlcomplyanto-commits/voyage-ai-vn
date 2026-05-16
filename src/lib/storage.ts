export interface UserPrefs {
  food: string[];
  interests: string[];
  name?: string;
}

export interface Activity {
  id: string;
  title: string;
  time?: string;
  type: 'flight' | 'hotel' | 'activity';
  location?: string;
  notes?: string;
  confirmationNumber?: string;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  completed?: boolean;
}

export interface ItineraryDay {
  date: string; // ISO date string
  activities: Activity[];
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  coverImage?: string;
  itinerary: ItineraryDay[];
  notes?: string;
}

export interface VaultFile {
  id: string;
  name: string;
  type: string;
  uri: string;
  createdAt: string;
}

export interface ExplorePlace {
  id: string;
  name: string;
  type: string;
  location: string;
  distance: string;
  rating: string;
  image: string;
}

export interface Partner {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  image: string;
  url?: string;
}

const PREFS_KEY = 'voyage_prefs';
const TRIPS_KEY = 'voyage_trips';
const VAULT_KEY = 'voyage_vault';
const EXPLORE_PLACES_KEY = 'voyage_explore_places';
const PARTNERS_KEY = 'voyage_partners';

export const storage = {
  getPrefs: (): UserPrefs => {
    try {
      const data = localStorage.getItem(PREFS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return { food: [], interests: [] };
  },
  
  savePrefs: (prefs: UserPrefs) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  },
  
  getTrips: (): Trip[] => {
    try {
      const data = localStorage.getItem(TRIPS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return [];
  },
  
  saveTrips: (trips: Trip[]) => {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  },

  getVaultFiles: (): VaultFile[] => {
    try {
      const data = localStorage.getItem(VAULT_KEY);
      if (data) return JSON.parse(data);
    } catch(e) {
      console.error(e);
    }
    return [];
  },

  saveVaultFiles: (files: VaultFile[]) => {
    localStorage.setItem(VAULT_KEY, JSON.stringify(files));
  },

  getExplorePlaces: (location: string, category: string): ExplorePlace[] | null => {
    try {
      const data = localStorage.getItem(EXPLORE_PLACES_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const key = `${location}_${category}`;
        if (parsed[key]) return parsed[key];
      }
    } catch(e) {
      console.error(e);
    }
    return null;
  },

  saveExplorePlaces: (location: string, category: string, places: ExplorePlace[]) => {
    try {
      const data = localStorage.getItem(EXPLORE_PLACES_KEY);
      const parsed = data ? JSON.parse(data) : {};
      const key = `${location}_${category}`;
      parsed[key] = places;
      localStorage.setItem(EXPLORE_PLACES_KEY, JSON.stringify(parsed));
    } catch(e) {
      console.error(e);
    }
  },

  getPartners: (location: string): Partner[] => {
    try {
      const data = localStorage.getItem(PARTNERS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed[location] || [];
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  savePartners: (location: string, partners: Partner[]) => {
    try {
      const data = localStorage.getItem(PARTNERS_KEY);
      const parsed = data ? JSON.parse(data) : {};
      parsed[location] = partners;
      localStorage.setItem(PARTNERS_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.error(e);
    }
  }
};
