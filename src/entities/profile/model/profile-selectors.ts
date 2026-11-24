import type { ProfileState } from "./profile-slice";
import type { UserProfile } from "./profile-types";

type ProfileRootState = { profile: ProfileState };

export const selectProfile = (state: ProfileRootState): UserProfile => state.profile.data;
export const selectProfileHydrated = (state: ProfileRootState): boolean => state.profile.hydrated;
