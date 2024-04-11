import { ActionCreatorsMapObject, bindActionCreators } from "@reduxjs/toolkit"
import { useDispatch } from "react-redux"
import { useMemo } from "react"

export const useActions = <T extends ActionCreatorsMapObject>(actions: T) => {
  const dispatch = useDispatch()
  return useMemo(() => {
    bindActionCreators<T, RemapActionCreators<T>>(actions, dispatch)
  }, [actions, dispatch])
}
