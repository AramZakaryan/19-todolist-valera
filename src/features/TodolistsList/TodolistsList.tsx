import React, { useCallback, useEffect } from "react"
import { useSelector } from "react-redux"
import {
  FilterValuesType,
  todolistsActions,
  todolistsAsyncActions,
} from "features/TodolistsList/todolists.reducer"
import { removeTask, tasksAsyncActions, updateTask } from "features/TodolistsList/tasks.reducer"
import { Grid, Paper } from "@mui/material"
import { AddItemForm } from "common/components/AddItemForm/AddItemForm"
import { Todolist } from "./Todolist/Todolist"
import { Navigate } from "react-router-dom"
import { useActions, useAppDispatch } from "common/hooks"
import { selectIsLoggedIn } from "features/auth/model/auth.selectors"
import { selectTasks } from "features/TodolistsList/tasks.selectors"
import { selectTodolists } from "features/TodolistsList/todolists.selectors"
import { TaskStatuses } from "common/enums"

type PropsType = {
  demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
  const todolists = useSelector(selectTodolists)
  const tasks = useSelector(selectTasks)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  // const dispatch = useAppDispatch()

  const {
    fetchTodolists,
    removeTodolist,
    changeTodolistTitle,
    addTodolist,
    changeTodolistFilter,
    removeTask,
    addTask,
    updateTask,
  } = useActions({ ...todolistsAsyncActions, ...todolistsActions, ...tasksAsyncActions })

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return
    }
    fetchTodolists()
    // dispatch(todolistsAsyncActions.fetchTodolists())
  }, [])

  const removeTaskHandler = useCallback(function (taskId: string, todolistId: string) {
    removeTask({ taskId, todolistId })
    // const thunk = removeTask({ taskId, todolistId })
    // dispatch(thunk)
  }, [])

  const addTaskCB = useCallback(function (title: string, todolistId: string) {
    addTask({ title, todolistId })
    // const thunk = tasksAsyncActions.addTask({ title, todolistId })
    // dispatch(thunk)
  }, [])

  const changeStatus = useCallback(function (
    taskId: string,
    status: TaskStatuses,
    todolistId: string,
  ) {
    updateTask({ taskId, model: { status }, todolistId })
    // const thunk = updateTask({ taskId, model: { status }, todolistId })
    // dispatch(thunk)
  }, [])

  const changeTaskTitle = useCallback(function (
    taskId: string,
    newTitle: string,
    todolistId: string,
  ) {
    updateTask({ taskId, model: { title: newTitle }, todolistId })
    // const thunk = updateTask({ taskId, model: { title: newTitle }, todolistId })
    // dispatch(thunk)
  }, [])

  const changeFilter = useCallback(function (filter: FilterValuesType, id: string) {
    changeTodolistFilter({ id, filter })
    // dispatch(todolistsActions.changeTodolistFilter({ id, filter }))
  }, [])

  const removeTodolistCB = useCallback(function (id: string) {
    removeTodolist(id)
    // dispatch(todolistsAsyncActions.removeTodolist(id))
  }, [])

  const changeTodolistTitleCB = useCallback(function (id: string, title: string) {
    changeTodolistTitle({ id, title })
    // dispatch(todolistsAsyncActions.changeTodolistTitle({ id, title }))
  }, [])

  const addTodolistCB = useCallback((title: string) => {
    addTodolist(title)
    // dispatch(todolistsAsyncActions.addTodolist(title))
  }, [])

  if (!isLoggedIn) {
    return <Navigate to={"/login"} />
  }

  return (
    <>
      <Grid container style={{ padding: "20px" }}>
        <AddItemForm addItem={addTodolistCB} />
      </Grid>
      <Grid container spacing={3}>
        {todolists.map((tl) => {
          let allTodolistTasks = tasks[tl.id]

          return (
            <Grid item key={tl.id}>
              <Paper style={{ padding: "10px" }}>
                <Todolist
                  todolist={tl}
                  tasks={allTodolistTasks}
                  removeTask={removeTaskHandler}
                  changeFilter={changeFilter}
                  addTask={addTaskCB}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolistCB}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={changeTodolistTitleCB}
                  demo={demo}
                />
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
