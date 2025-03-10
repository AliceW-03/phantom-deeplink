import { useSelector, useDispatch, shallowEqual } from "react-redux"
import { RootState, ModalStateKeys } from "../store"
import { setModalVisible } from "../store"

export const useModal = (modal: ModalStateKeys) => {
  const dispatch = useDispatch()
  const modalState = useSelector(
    (state: RootState) => state.modal[modal],
    shallowEqual
  )

  return {
    ...modalState,
    openModal: () => dispatch(setModalVisible({ name: modal, visible: true })),
    closeModal: () =>
      dispatch(setModalVisible({ name: modal, visible: false })),
  }
}
