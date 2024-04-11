import React, { useCallback, useEffect } from "react"
import "./App.css"
import { TodolistsList } from "features/TodolistsList/TodolistsList"
import { useSelector } from "react-redux"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { authAsyncActions } from "features/auth/model/auth.reducer"
import {
  AppBar,
  Button,
  CircularProgress,
  Container,
  IconButton,
  LinearProgress,
  Toolbar,
  Typography,
} from "@mui/material"
import { Menu } from "@mui/icons-material"
import { useActions, useAppDispatch } from "common/hooks"
import { selectIsLoggedIn } from "features/auth/model/auth.selectors"
import { selectAppStatus, selectIsInitialized } from "app/app.selectors"
import { ErrorSnackbar } from "common/components"
import { Login } from "features/auth/ui/Login"
import { bindActionCreators } from "@reduxjs/toolkit"

type PropsType = {
  demo?: boolean
}

function App({ demo = false }: PropsType) {
  const status = useSelector(selectAppStatus)
  const isInitialized = useSelector(selectIsInitialized)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const dispatch = useAppDispatch()

  const {} = useActions(authAsyncActions)

  useEffect(() => {
    bindActionCreators(authAsyncActions.initializeApp, dispatch)()
    // dispatch(authAsyncActions.initializeApp())
  }, [])

  const logoutHandler = useCallback(() => {
    dispatch(authAsyncActions.logout())
  }, [])

  if (!isInitialized) {
    return (
      <div style={{ position: "fixed", top: "30%", textAlign: "center", width: "100%" }}>
        <CircularProgress />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="App">
        <ErrorSnackbar />
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <Menu />
            </IconButton>
            <Typography variant="h6">News</Typography>
            {isLoggedIn && (
              <Button color="inherit" onClick={logoutHandler}>
                Log out
              </Button>
            )}
          </Toolbar>
          {status === "loading" && <LinearProgress />}
        </AppBar>
        <Container fixed>
          <Routes>
            <Route path={"/"} element={<TodolistsList demo={demo} />} />
            <Route path={"/login"} element={<Login />} />
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  )
}

export default App
