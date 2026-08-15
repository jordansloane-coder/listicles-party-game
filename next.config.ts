import type { NextConfig } from "next";

// Set only for the GitHub Pages build (see .github/workflows/pages.yml) — that host
// serves this as a project page under /listicles-party-game/, not from the domain
// root like Netlify/Vercel, so every asset needs the prefix.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Everything is client-side state + localStorage, no server needed —
  // static export deploys as plain files to any static host.
  output: "export",
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
