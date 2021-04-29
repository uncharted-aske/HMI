// Vue 3.x's recommended Events pattern: https://v3.vuejs.org/guide/migration/events-api.html#overview
import emitter from 'tiny-emitter/instance';
import { TinyEmitter } from 'tiny-emitter';

export default {
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types
  $on: (event: string, callback: Function, ctx?: any): TinyEmitter => emitter.on(event, callback, ctx),
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/explicit-module-boundary-types
  $once: (event: string, callback: Function, ctx?: any): TinyEmitter => emitter.once(event, callback, ctx),
  $emit: (event: string, ...args: any[]): TinyEmitter => emitter.emit(event, ...args),
  // eslint-disable-next-line @typescript-eslint/ban-types
  $off: (event: string, callback?: Function): TinyEmitter => emitter.off(event, callback),
};
