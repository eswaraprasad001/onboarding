/** @type {import('next').NextConfig} */
const path = require('path');
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  // Explicitly set the workspace root so Next.js doesn't get confused by the
  // outer Codex Forge package-lock.json sitting above this app directory.
  outputFileTracingRoot: path.join(__dirname),
  trailingSlash: true,
};

module.exports = nextConfig;
