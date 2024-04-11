import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk"
import { AppDispatch, AppRootStateType } from "app/store"
import { BaseResponseType } from "common/types"
import { handleServerAppError } from "common/utils/handleServerAppError"
import { appActions } from "app/app.reducer"

export const thunkTryCatch = async <T>(
  thunkApi: BaseThunkAPI<AppRootStateType, unknown, AppDispatch, null | BaseResponseType>,
  logic: () => Promise<T>,
): Promise<T | ReturnType<typeof thunkApi.rejectWithValue>> => {
  const { dispatch, rejectWithValue } = thunkApi
  dispatch(appActions.setAppStatus({ status: "loading" }))
  try {
    return await logic()
  } catch (err: any) {
    handleServerAppError(err, dispatch)
    return rejectWithValue(null)
  } finally {
    dispatch(appActions.setAppStatus({ status: "idle" }))
  }
}
