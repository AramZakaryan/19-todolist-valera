import {
  TaskType,
  todolistsApi,
  UpdateTaskModelType,
} from "features/TodolistsList/Todolist/api/todolistsApi"
import { appActions } from "app/app.reducer"
import { todolistsActions, todolistsAsyncActions } from "features/TodolistsList/todolists.reducer"
import { createSlice } from "@reduxjs/toolkit"
import { clearTasksAndTodolists } from "common/actions/common.actions"
import {
  createAppAsyncThunk,
  handleServerAppError,
  handleServerNetworkError,
  thunkTryCatch,
} from "common/utils"
import { ResultCode, TaskPriorities, TaskStatuses } from "common/enums"
import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk"
import { AppDispatch, AppRootStateType } from "app/store"
import { BaseResponseType } from "common/types"

const initialState: TasksStateType = {}

const slice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex((t) => t.id === action.payload.taskId)
        if (index !== -1) {
          tasks[index] = { ...tasks[index], ...action.payload.model }
        }
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex((t) => t.id === action.payload.taskId)
        if (index !== -1) tasks.splice(index, 1)
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.task.todoListId]
        tasks.unshift(action.payload.task)
      })
      .addCase(todolistsAsyncActions.addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsAsyncActions.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsAsyncActions.fetchTodolists.fulfilled, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = []
        })
      })
      .addCase(clearTasksAndTodolists, () => {
        return {}
      })
  },
})

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions

////////// THUNKS

/** ZA: fetchTasks Thunk Creator */
export const fetchTasks = createAppAsyncThunk<
  { tasks: Array<TaskType>; todolistId: string },
  string
>(`${slice.name}/fetchTasks`, async (todolistId, thunkAPI) => {
  const logic = async () => {
    let res = await todolistsApi.getTasks(todolistId)
    const tasks = res.data.items
    return { tasks, todolistId }
  }
  return thunkTryCatch(thunkAPI, logic)
})

/** ZA: removeTask Thunk Creator */
export const removeTask = createAppAsyncThunk<
  { taskId: string; todolistId: string },
  { taskId: string; todolistId: string }
>(`${slice.name}/removeTask`, async ({ taskId, todolistId }, thunkAPI) => {
  const logic = async () => {
    await todolistsApi.deleteTask(todolistId, taskId)
    return { taskId, todolistId }
  }
  return thunkTryCatch(thunkAPI, logic)
})

/** ZA: addTask Thunk Creator */
export const addTask = createAppAsyncThunk<
  { task: TaskType },
  { title: string; todolistId: string }
>(`${slice.name}/addTask`, async ({ title, todolistId }, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI
  const logic = async () => {
    let res = await todolistsApi.createTask(todolistId, title)
    if (res.data.resultCode === ResultCode.success) {
      const task = res.data.data.item
      return { task }
    } else {
      handleServerAppError(res.data, dispatch)
      return rejectWithValue(null)
    }
  }
  return thunkTryCatch(thunkAPI, logic)
})

/** ZA: updateTask Thunk Creator */
export const updateTask = createAppAsyncThunk<CreateTaskType, CreateTaskType>(
  `${slice.name}/updateTask`,
  async (arg, thunkAPI) => {
    const { dispatch, getState, rejectWithValue } = thunkAPI
    const state = getState()
    const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId)
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn("task not found in the state")
      return rejectWithValue(null)
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...arg.model,
    }

    const res = await todolistsApi.updateTask(arg.todolistId, arg.taskId, apiModel)

    const logic = async () => {
      if (res.data.resultCode === ResultCode.success) {
        return { taskId: arg.taskId, model: arg.model, todolistId: arg.todolistId }
        // dispatch(tasksActions.updateTask({ taskId, model: domainModel, todolistId }))
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    }

    return thunkTryCatch(thunkAPI, logic)
  },
)

export const tasksAsyncActions = {
  fetchTasks,
  addTask,
  removeTask,
  updateTask,
}

////////// types

export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}

export type TasksStateType = {
  [key: string]: Array<TaskType>
}

export type CreateTaskType = {
  taskId: string
  model: UpdateDomainTaskModelType
  todolistId: string
}
