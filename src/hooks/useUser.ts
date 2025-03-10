import { useDispatch, useSelector } from "react-redux"
import { UserState, userSlice } from "../store"
import { useCallback, useEffect, useRef } from "react"
import _ from "lodash"
import { shallowEqual } from "react-redux"
import { RootState } from "../store"
import { ActionCreator, PayloadAction } from "@reduxjs/toolkit"

type UserStateKeys = keyof UserState
type Actions = typeof userSlice.actions
type ActionKeys = keyof Actions

// 创建更新函数的工具类型
type UpdaterFunctions<K extends ActionKeys = ActionKeys> = {
  [Key in K as `update${Capitalize<string & Key>}`]: (
    payload: Parameters<Actions[Key]>[0]
  ) => void
}

// 可以指定只创建某些更新函数
type PickedActions = Pick<Actions, "setName" | "setAge">

export function useUser<
  T extends UserStateKeys[],
  A extends ActionKeys = ActionKeys
>(deps?: T, actionKeys?: A[]) {
  const dispatch = useDispatch()
  const depsRef = useRef(deps)
  const actionsRef = useRef(actionKeys)

  // 记忆化 updateFunctions
  const updateFunctions = useRef<UpdaterFunctions<A>>({} as UpdaterFunctions<A>)

  // 只在首次渲染或 actionKeys 变化时创建函数
  useEffect(() => {
    const keys = actionsRef.current
      ? actionsRef.current
      : (Object.keys(userSlice.actions) as ActionKeys[])

    keys.forEach((key) => {
      const action = userSlice.actions[key]
      const updateKey = `update${
        key.charAt(0).toUpperCase() + key.slice(1)
      }` as keyof UpdaterFunctions<A>

      updateFunctions.current[updateKey] = (payload) =>
        dispatch(action(payload))
    })
  }, [dispatch, actionKeys]) // 只在 dispatch 或 actionKeys 变化时重新创建

  // 获取状态
  const walletState = useSelector((state: RootState) => {
    return depsRef.current ? _.pick(state.user, depsRef.current) : state.user
  }, shallowEqual)

  return {
    ...walletState,
    actions: updateFunctions.current,
  }
}
