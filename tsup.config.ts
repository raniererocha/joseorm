import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm', 'iife'],
    dts: true,
    clean: true,
    splitting: false,
    minify: true,
    outDir: 'dist',
  }
])