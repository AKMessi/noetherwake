import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['packages/engine/test/**/*.test.ts'],testTimeout:30000}});
