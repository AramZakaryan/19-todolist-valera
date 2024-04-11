import React, { useCallback, useEffect } from "react"
import { useSelector } from "react-redux"
import {
  FilterValuesType,
  todolistsActions,
  todolistsAsyncActions,
} from "features/TodolistsList/todolists.reducer"
import { removeTask, tasksThunks, updateTask } from "features/TodolistsList/tasks.reducer"
import { Grid, Paper } from "@mui/material"
import { AddItemForm } from "common/components/AddItemForm/AddItemForm"
import { Todolist } from "./Todolist/Todolist"
import { Navigate } from "react-router-dom"
import { useAppDispatch } from "common/hooks"
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

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return
    }
    dispatch(todolistsAsyncActions.fetchTodolists())
  }, [])

  const removeTaskHandler = useCallback(function (taskId: string, todolistId: string) {
    const thunk = removeTask({ taskId, todolistId })
    dispatch(thunk)
  }, [])

  const addTask = useCallback(function (title: string, todolistId: string) {
    const thunk = tasksThunks.addTask({ title, todolistId })
    dispatch(thunk)
  }, [])

  const changeStatus = useCallback(function (
    taskId: string,
    status: TaskStatuses,
    todolistId: string,
  ) {
    const thunk = updateTask({ taskId, model: { status }, todolistId })
    dispatch(thunk)
  }, [])

  const changeTaskTitle = useCallback(function (
    taskId: string,
    newTitle: string,
    todolistId: string,
  ) {
    const thunk = updateTask({ taskId, model: { title: newTitle }, todolistId })
    dispatch(thunk)
  }, [])

  const changeFilter = useCallback(function (filter: FilterValuesType, id: string) {
    dispatch(todolistsActions.changeTodolistFilter({ id, filter }))
  }, [])

  const removeTodolist = useCallback(function (id: string) {
    dispatch(todolistsAsyncActions.removeTodolist(id))
  }, [])

  const changeTodolistTitle = useCallback(function (id: string, title: string) {
    dispatch(todolistsAsyncActions.changeTodolistTitle({ id, title }))
  }, [])

  const addTodolist = useCallback(
    (title: string) => {
      dispatch(todolistsAsyncActions.addTodolist(title))
    },
    [dispatch],
  )

  if (!isLoggedIn) {
    return <Navigate to={"/login"} />
  }

  return (
    <>
      <Grid container style={{ padding: "20px" }}>
        <AddItemForm addItem={addTodolist} />
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
                  addTask={addTask}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolist}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={changeTodolistTitle}
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
