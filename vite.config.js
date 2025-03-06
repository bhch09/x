
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ["4df2980a-6528-4166-a97b-99d0dba1762e-00-1lqbb13pltuh2.sisko.replit.dev", "all"]
  },
  base: '/1/',
})
