import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      clearMocks: true,
      restoreMocks: true,
      unstubEnvs: true,
      unstubGlobals: true,
      pool: 'threads',
      maxWorkers: 2,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/test/**',
          'src/types/**',
          'src/main.tsx',
          'src/vite-env.d.ts',
          'src/components/ui/Icon.tsx',
        ],
        thresholds: {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85,
        },
      },
    },
  }),
);
