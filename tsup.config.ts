import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  noExternal: ['devtools-detector', 'screenfull', 'visibilityjs'],
  minify: false,
});
