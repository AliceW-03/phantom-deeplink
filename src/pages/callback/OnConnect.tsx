import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { parseSearchParams } from "@/utils/url"
import { ConnectCallbackParams, CustomEventName } from "@/lib/types"

export const OnConnect = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const params = parseSearchParams<ConnectCallbackParams>(searchParams)
    const event = new CustomEvent(CustomEventName.PHANTOM_CONNECTED, {
      detail: params
    })
    window.dispatchEvent(event)
    // navigate("/")
  }, [navigate, searchParams])

  return null
} 