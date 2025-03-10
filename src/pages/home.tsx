import { useModal } from "../hooks/useModal";
// import { useUser } from "../hooks/useUser"
export default function Page() {
  return (
    <div className="flex">
      <Component1 />
      <Component2 />
    </div>
  )
}

export function Component1() {
  const accountModal = useModal('accountModal')
  console.log('Component1 render');

  return (
    <div className="flex-1">
      <button onClick={accountModal.openModal}>openAccountModal</button>
      <button onClick={accountModal.closeModal}>closeAccountModal</button>
      {
        accountModal.visible && <div>accountModal</div>
      }
    </div>
  )
}

export function Component2() {
  const banModal = useModal('banModal')
  console.log('Component2 render');

  return (
    <div className="flex-1">
      {
        banModal.visible && <div>banModal</div>
      }
      <button onClick={banModal.openModal}>openBanModal</button>
      <button onClick={banModal.closeModal}>closeBanModal</button>
    </div>
  )
}



