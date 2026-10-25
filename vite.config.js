import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures static relative assets work seamlessly on GitHub Pages
  server: {
    port: 5173, // Changed from 3000 to avoid conflicts
    strictPort: false,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore'],
          icons: ['lucide-react', 'canvas-confetti'],
        },
      },
    },
  },
});

