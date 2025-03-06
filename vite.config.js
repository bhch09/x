
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ["4ab4c9b2-42f3-41c5-9276-66fded4b771b-00-2ei63vaz8dl9z.pike.replit.dev", "all"]
  },
  base: '/x/',
})
