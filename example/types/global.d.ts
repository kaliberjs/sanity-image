declare module '*.css' {
  const x: { [any: string]: string }
  export default x
}

declare module '@kaliber/config' {
  type defaultConfig = typeof import('/../config/default.js')
  type prdConfig = typeof import('/../config/dev.js')

  const config: defaultConfig & prdConfig

  export = config
}
