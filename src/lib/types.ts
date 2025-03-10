export interface ConnectCallbackParamsError {
  errorCode: string
  errorMessage: string
}

export interface ConnectCallbackParams {
  phantom_encryption_public_key: string
  nonce: string
  data: string
}

export enum CustomEventName {
  PHANTOM_CONNECTED = "phantom-connected",
  PHANTOM_DISCONNECTED = "phantom-disconnected",
  // 其他自定义事件...
}

// 定义每个事件的详情类型
export interface CustomEventDetailMap {
  [CustomEventName.PHANTOM_CONNECTED]:
    | ConnectCallbackParams
    | ConnectCallbackParamsError
  [CustomEventName.PHANTOM_DISCONNECTED]: void
}

// 创建一个辅助类型来获取特定事件的详情类型
export type CustomEventDetail<T extends CustomEventName> =
  CustomEventDetailMap[T]

// 定义监听方法的字面量类型
export const listenMethodMap = {
  connect: "connect",
  disconnect: "disconnect",
} as const
