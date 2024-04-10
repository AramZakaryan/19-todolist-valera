import { todolistsApi, TodolistType } from "features/TodolistsList/Todolist/api/todolistsApi"
import { appActions, RequestStatusType } from "app/app.reducer"
import { createAppAsyncThunk, handleServerNetworkError } from "common/utils"
import { AppThunk } from "app/store"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { clearTasksAndTodolists } from "common/actions/common.actions"

const initialState: TodolistDomainType[] = []

const slice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    // removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
    //   const index = state.findIndex((todo) => todo.id === action.payload.id)
    //   if (index !== -1) state.splice(index, 1)
    //   // return state.filter(tl => tl.id !== action.payload.id)
    // },
    // addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
    //   const newTodolist: TodolistDomainType = {
    //     ...action.payload.todolist,
    //     filter: "all",
    //     entityStatus: "idle"
    //   }
    //   state.unshift(newTodolist)
    // },
    changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const todo = state.find((todo) => todo.id === action.payload.id)
      if (todo) {
        todo.title = action.payload.title
      }
    },
    changeTodolistFilter: (
      state,
      action: PayloadAction<{ id: string; filter: FilterValuesType }>
    ) => {
      const todo = state.find((todo) => todo.id === action.payload.id)
      if (todo) {
        todo.filter = action.payload.filter
      }
    },
    changeTodolistEntityStatus: (
      state,
      action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>
    ) => {
      const todo = state.find((todo) => todo.id === action.payload.id)
      if (todo) {
        todo.entityStatus = action.payload.entityStatus
      }
    }
    // setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
    //   return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
    //   // return action.payload.forEach(t => ({...t, filter: 'active', entityStatus: 'idle'}))
    // }
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearTasksAndTodolists, () => {
        return []
      })
      .addCase(fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))

      })
      .addCase(removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex((todo) => todo.id === action.payload.id)
        if (index !== -1) state.splice(index, 1)
      })
      .addCase(addTodolistTC.fulfilled, (state, action) => {
        const newTodolist: TodolistDomainType = {
          ...action.payload.todolist,
          filter: "all",
          entityStatus: "idle"
        }
        state.unshift(newTodolist)
      })
  }
})

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions

////////// THUNKS

/** ZA: fetchTodolists Thunk Creator */
const fetchTodolists = createAppAsyncThunk<{
  todolists: TodolistType[]
}, undefined>(`${slice.name}/fetchTodolists`,
  async (_, { dispatch, rejectWithValue }) => {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    try {
      let res = await todolistsApi.getTodolists()
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
      return { todolists: res.data }
    } catch (error) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null)
    }
  })

/** ZA: removeTodolist Thunk Creator */
const removeTodolist = createAppAsyncThunk<{ id: string }, string>(`${slice.name}/removeTodolist`,
  async (id, { dispatch }) => {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    dispatch(todolistsActions.changeTodolistEntityStatus({ id, entityStatus: "loading" }))
    await todolistsApi.deleteTodolist(id)
    dispatch(appActions.setAppStatus({ status: "succeeded" }))
    return { id }
  }
)

/** ZA: addTodolist Thunk Creator */
export const addTodolistTC = createAppAsyncThunk<{ todolist: TodolistType }, string>(`${slice.name}/addTodolist`,
  async (title, { dispatch }) => {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    const res = await todolistsApi.createTodolist(title)
    dispatch(appActions.setAppStatus({ status: "succeeded" }))
    return { todolist: res.data.data.item }
  })


export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsApi.updateTodolist(id, title).then((res) => {
      dispatch(todolistsActions.changeTodolistTitle({ id, title }))
    })
  }
}

export const todolistsAsyncActions = { fetchTodolists, removeTodolist, addTodolistTC }

// types
export type FilterValuesType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
