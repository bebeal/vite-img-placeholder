import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, UserConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ rollupTypes: true, tsconfigPath: './tsconfig.lib.json' })
  ],
  build: {
    cssCodeSplit: false,  // to create a single css file
    // If this were true, this would delete the types generated from tsc. We manually clean the dist folder with rimraf in the package.json instead
    emptyOutDir: true,
    copyPublicDir: false,
    lib: {
      name: 'vite-img-placeholder',
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: 'assets/[name][extname]',
      },
    }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css']
  }
}) satisfies UserConfig;
