import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootStateType } from "app/store";
import { BaseResponseType } from "common/types"


export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  rejectValue: null | BaseResponseType,
  state: AppRootStateType,
  dispatch: AppDispatch
}>();