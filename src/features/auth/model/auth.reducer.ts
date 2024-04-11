import {
  createAppAsyncThunk,
  handleServerAppError,
  handleServerNetworkError,
  thunkTryCatch,
} from "common/utils"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { appActions } from "app/app.reducer"
import { clearTasksAndTodolists } from "common/actions/common.actions"
import { authAPI } from "features/auth/api/authApi"
import { LoginParamsType } from "features/auth/api/authApi.types"

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
      state.isLoggedIn = action.payload.isLoggedIn
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
      })
  },
})

export const authReducer = slice.reducer

////////// THUNKS

/** ZA: login Thunk Creator */
export const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>(
  `${slice.name}/login`,
  async (arg, { dispatch, rejectWithValue }) => {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    try {
      let res = await authAPI.login(arg)
      if (res.data.resultCode === 0) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }))
        return { isLoggedIn: true }
      } else {
        // if there are no errors in filed, show global error
        const doesShowGlobalError = res.data.fieldsErrors.length === 0
        handleServerAppError(res.data, dispatch, doesShowGlobalError)
        return rejectWithValue(res.data)
      }
    } catch (error) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null)
    }
  },
)

/** ZA: logout Thunk Creator */
const logout = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(
  `${slice.name}/logout`,
  async (_, { dispatch, rejectWithValue }) => {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    try {
      let res = await authAPI.logout()
      if (res.data.resultCode === 0) {
        dispatch(clearTasksAndTodolists())
        dispatch(appActions.setAppStatus({ status: "succeeded" }))
        return { isLoggedIn: false }
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    } catch (error) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null)
    }
  },
)

/** ZA: initializeApp Thunk Creator */
export const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(
  `${slice.name}/initializeApp`,
  async (_, thunkAPI) => {
    const logic = async () => {
      const res = await authAPI.me()
      if (res.data.resultCode === 0) {
        return { isLoggedIn: true }
      } else {
        handleServerAppError(res.data, thunkAPI.dispatch, false)
        return thunkAPI.rejectWithValue(null)
      }
    }
    return thunkTryCatch(thunkAPI, logic).finally(() =>
      thunkAPI.dispatch(appActions.setAppInitialized({ isInitialized: true })),
    )
  },
)

export const authAsyncActions = { login, logout, initializeApp }
