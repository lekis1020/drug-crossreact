import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function resolveBasePath(): string {
  const env =
    (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ??
    {};

  if (env.VITE_BASE_PATH) return env.VITE_BASE_PATH;

  const runningInGitHubActions = env.GITHUB_ACTIONS === 'true';
  if (!runningInGitHubActions) return '/';

  const repository = env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
  const owner = env.GITHUB_REPOSITORY_OWNER ?? '';
  const isUserOrOrgPage = repository.toLowerCase() === `${owner.toLowerCase()}.github.io`;

  if (!repository || isUserOrOrgPage) return '/';
  return `/${repository}/`;
}

export default defineConfig({
  base: resolveBasePath(),
  plugins: [
    tailwindcss(),
    react(),
  ],
});
