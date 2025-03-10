import { configureStore, createSlice } from "@reduxjs/toolkit"

export type UserState = {
  name: string
  age: number
  gender: "male" | "female"
  address: {
    city: string
    province: string
  }
}
const initialState: UserState = {
  name: "nile",
  age: 15,
  gender: "male",
  address: {
    city: "beijing",
    province: "beijing",
  },
}
// Create a slice for user data
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.name = action.payload.name
      state.age = action.payload.age
    },
    setName(state, action) {
      state.name = action.payload
    },
    setAge(state, action) {
      state.age = action.payload
    },
    setGender(state, action) {
      state.gender = action.payload
    },
  },
})

// Export actions
export const { setUser, setName, setAge, setGender } = userSlice.actions

// Add modal state type
export type ModalState = {
  accountModal: {
    visible: boolean
  }
  banModal: {
    visible: boolean
  }
}

const modalInitialState: ModalState = {
  accountModal: {
    visible: false,
  },
  banModal: {
    visible: false,
  },
}
export type ModalStateKeys = keyof ModalState

// Create modal slice
export const modalSlice = createSlice({
  name: "modal",
  initialState: modalInitialState,
  reducers: {
    setModalVisible(
      state,
      action: { payload: { name: ModalStateKeys; visible: boolean } }
    ) {
      state[action.payload.name].visible = action.payload.visible
    },
  },
})

export const { setModalVisible } = modalSlice.actions

// Create store
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    modal: modalSlice.reducer,
  },
})
export type RootState = ReturnType<typeof store.getState>
export default store
