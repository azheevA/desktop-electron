import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { defaultProfile, type UserProfile } from "./profile-types";

export type ProfileState = {
  data: UserProfile;
  hydrated: boolean;
};

const initialState: ProfileState = {
  data: defaultProfile,
  hydrated: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    hydrateProfile(state, action: PayloadAction<UserProfile>) {
      state.data = action.payload;
      state.hydrated = true;
    },
    updateProfile(state, action: PayloadAction<UserProfile>) {
      state.data = {
        firstName: action.payload.firstName.trim(),
        lastName: action.payload.lastName.trim(),
      };
    },
  },
});

export const { hydrateProfile, updateProfile } = profileSlice.actions;
export { initialState as profileInitialState };
export default profileSlice.reducer;
