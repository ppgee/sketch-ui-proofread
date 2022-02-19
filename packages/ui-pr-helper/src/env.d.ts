/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare const __IDENTIFIER__: string
declare const __IPHONE6_WIDTH__: number
declare const __IPHONE6_HEIGHT__: number
declare const __INITIAL_POINT_X__: number
declare const __INITIAL_POINT_Y__: number
