import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { IUser } from '../../utils/types';

type UserState = {
  user: IUser | null;
};

const initialState: UserState = { user: null };

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPrincipalId: (state: UserState, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.principalId = action.payload;
      } else {
        state.user = {
          principalId: action.payload,
        };
      }
    },
    setUsername: (state: UserState, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.username = action.payload;
      } else {
        state.user = {
          username: action.payload,
        };
      }
    },
    setUser: (state: UserState, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
    },
  },
});

export const selectUser = (state: RootState) => state.user;

export const { setPrincipalId, setUser, setUsername } = userSlice.actions;

export default userSlice.reducer;
