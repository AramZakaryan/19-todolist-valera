import {
  TodolistDomainType,
  todolistsActions, todolistsAsyncActions,
  todolistsReducer
} from "features/TodolistsList/todolists.reducer"
import { tasksReducer, TasksStateType } from "features/TodolistsList/tasks.reducer"
import { TodolistType } from "features/TodolistsList/Todolist/api/todolistsApi"

test("ids should be equals", () => {
  const startTasksState: TasksStateType = {}
  const startTodolistsState: Array<TodolistDomainType> = []

  let todolist: TodolistType = {
    title: "new todolist",
    id: "any id",
    addedDate: "",
    order: 0
  }

  const action = todolistsAsyncActions.addTodolistTC.fulfilled(
    { todolist: todolist },
    "requestId",
    "any id"
  )

  const endTasksState = tasksReducer(startTasksState, action)
  const endTodolistsState = todolistsReducer(startTodolistsState, action)

  const keys = Object.keys(endTasksState)
  const idFromTasks = keys[0]
  const idFromTodolists = endTodolistsState[0].id

  expect(idFromTasks).toBe(action.payload.todolist.id)
  expect(idFromTodolists).toBe(action.payload.todolist.id)
})
