import Vue from './instance/index' // 1
import { initGlobalAPI } from './global-api/index' // 2
// 判断是不是ssr的变量？
import { isServerRendering } from 'core/util/env'

// 初始化全局api？
initGlobalAPI(Vue)

// 在vue原型上定义属性$isServer
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

// 在vue原型上定义属性$ssrContext
Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

Vue.version = '__VERSION__'

export default Vue
