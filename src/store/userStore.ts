import { create } from 'zustand';

export interface UserProfile {
    name: string;
    email: string;
    role: string;
    company: string;
    timezone: string;
    notificationsEnabled: boolean;
}

interface UserState {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    isLoading: boolean;
}

// Initial mock data
const defaultProfile: UserProfile = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'Campaign Manager',
    company: 'Acme Corp',
    timezone: 'America/New_York',
    notificationsEnabled: true
};

export const useUserStore = create<UserState>((set) => ({
    profile: defaultProfile,
    isLoading: false,
    updateProfile: async (updates) => {
        set({ isLoading: true });

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        set(state => ({
            profile: { ...state.profile, ...updates },
            isLoading: false
        }));
    }
}));
