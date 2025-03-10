import { useRegisterSW } from 'virtual:pwa-register/react'

export const ReloadPrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    }
  })

  const close = () => {
    setNeedRefresh(false)
  }

  return (
    <div className="ReloadPrompt-container">
      {needRefresh && (
        <div className="ReloadPrompt-toast">
          <div className="ReloadPrompt-message">
            <span>新版本可用</span>
          </div>
          <div className="ReloadPrompt-buttons">
            <button onClick={() => updateServiceWorker(true)}>
              更新
            </button>
            <button onClick={() => close()}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 