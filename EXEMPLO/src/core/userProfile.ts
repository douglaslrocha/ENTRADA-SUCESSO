export interface UserProfile {
  frequentProjects: string[];
  frequentActions: string[];
  preferredTypes: string[];
  lastContexts: string[];
  usageStats: Record<string, number>;
}

export const initialUserProfile: UserProfile = {
  frequentProjects: [],
  frequentActions: [],
  preferredTypes: [],
  lastContexts: [],
  usageStats: {}
};
