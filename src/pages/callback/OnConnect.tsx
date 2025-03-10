import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { parseSearchParams } from "@/utils/url"
import { ConnectCallbackParams, CustomEventName } from "@/lib/types"

export const OnConnect = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const params = parseSearchParams<ConnectCallbackParams>(searchParams)
    const queueEvent = new CustomEvent(CustomEventName.PHANTOM_CONNECTED, {
      detail: params
    })
    window.dispatchEvent(queueEvent)

    setTimeout(() => {
      navigate('/')
    }, 100)
  }, [navigate, searchParams])

  return null
} 