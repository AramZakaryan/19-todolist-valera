import { todolistsApi, TodolistType } from "features/TodolistsList/Todolist/api/todolistsApi"
import { appActions, RequestStatusType } from "app/app.reducer"
import { createAppAsyncThunk, handleServerNetworkError, thunkTryCatch } from "common/utils"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { clearTasksAndTodolists } from "common/actions/common.actions"

const initialState: TodolistDomainType[] = []

const slice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    changeTodolistFilter: (
      state,
      action: PayloadAction<{ id: string; filter: FilterValuesType }>,
    ) => {
      const todo = state.find((todo) => todo.id === action.payload.id)
      if (todo) {
        todo.filter = action.payload.filter
      }
    },
    changeTodolistEntityStatus: (
      state,
      action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>,
    ) => {
      const todo = state.find((todo) => todo.id === action.payload.id)
      if (todo) {
        todo.entityStatus = action.payload.entityStatus
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearTasksAndTodolists, () => {
        return []
      })
      .addCase(fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.map((tl) => ({
          ...tl,
          filter: "all",
          entityStatus: "idle",
        }))
      })
      .addCase(removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex((todo) => todo.id === action.payload.id)
        if (index !== -1) state.splice(index, 1)
      })
      .addCase(addTodolist.fulfilled, (state, action) => {
        const newTodolist: TodolistDomainType = {
          ...action.payload.todolist,
          filter: "all",
          entityStatus: "idle",
        }
        state.unshift(newTodolist)
      })
      .addCase(changeTodolistTitle.fulfilled, (state, action) => {
        const todo = state.find((todo) => todo.id === action.payload.id)
        if (todo) {
          todo.title = action.payload.title
        }
      })
  },
})

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions

////////// THUNKS

/** ZA: fetchTodolists Thunk Creator */
const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }, undefined>(
  `${slice.name}/fetchTodolists`,
  async (_, thunkAPI) => {
    const logic = async () => {
      let res = await todolistsApi.getTodolists()
      return { todolists: res.data }
    }
    return thunkTryCatch(thunkAPI, logic)
  },
)

/** ZA: removeTodolist Thunk Creator */
const removeTodolist = createAppAsyncThunk<{ id: string }, string>(
  `${slice.name}/removeTodolist`,
  async (id, thunkAPI) => {
    const logic = async () => {
      thunkAPI.dispatch(
        todolistsActions.changeTodolistEntityStatus({ id, entityStatus: "loading" }),
      )
      await todolistsApi.deleteTodolist(id)
      return { id }
    }
    return thunkTryCatch(thunkAPI, logic)
  },
)

/** ZA: addTodolist Thunk Creator */
const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>(
  `${slice.name}/addTodolist`,
  async (title, thunkAPI) => {
    const logic = async () => {
      const res = await todolistsApi.createTodolist(title)
      return { todolist: res.data.data.item }
    }
    return thunkTryCatch(thunkAPI, logic)
  },
)

/** ZA: changeTodolistTitle Thunk Creator */
const changeTodolistTitle = createAppAsyncThunk<
  { id: string; title: string },
  { id: string; title: string }
>(`${slice.name}/changeTodolistTitle`, async ({ id, title }, thunkAPI) => {
  const logic = async () => {
    await todolistsApi.updateTodolist(id, title)
    return { id, title }
  }
  return thunkTryCatch(thunkAPI, logic)
})

export const todolistsAsyncActions = {
  fetchTodolists,
  removeTodolist,
  addTodolist,
  changeTodolistTitle,
}

// types
export type FilterValuesType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
