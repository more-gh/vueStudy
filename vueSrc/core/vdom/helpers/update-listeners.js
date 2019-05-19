/* @flow */

import { warn } from 'core/util/index'
import { cached, isUndef } from 'shared/util'

//去除事件中的&、~、!
const normalizeEvent = cached((name: string): {
  name: string,
  once: boolean,
  capture: boolean,
  passive: boolean
} => {
  const passive = name.charAt(0) === '&'
  name = passive ? name.slice(1) : name
  const once = name.charAt(0) === '~' // Prefixed last, checked first
  name = once ? name.slice(1) : name
  const capture = name.charAt(0) === '!'
  name = capture ? name.slice(1) : name
  return {
    name,
    once,
    capture,
    passive
  }
})

//返回一个将监听事件全部执行的方法
export function createFnInvoker (fns: Function | Array<Function>): Function {
  function invoker () {
    const fns = invoker.fns
    if (Array.isArray(fns)) {
      const cloned = fns.slice() //得到一个和fns相同的数组,对其进行操作不会影响原本的fns
      for (let i = 0; i < cloned.length; i++) {
        cloned[i].apply(null, arguments)
      }
    } else {
      // return handler return value for single handlers
      return fns.apply(null, arguments)
    }
  }
  invoker.fns = fns
  return invoker
}

export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  vm: Component
) {
  let name, cur, old, event
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    if (isUndef(cur)) { //判断新方法是否存在
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        // 将原本的监听事件(组)赋值为一个可以执行原事件(组)的方法
        cur = on[name] = createFnInvoker(cur)
      }
      //add方法只能接收三个参数,后面两个传入是做什么的?
      add(event.name, cur, event.once, event.capture, event.passive)
    } else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  for (name in oldOn) {
    //将原监听事件中存在,但现有监听事件中不存在的事件移除
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      //remove只接受两个参数,第三个参数传入是干什么的?
      remove(event.name, oldOn[name], event.capture)
    }
  }
}
