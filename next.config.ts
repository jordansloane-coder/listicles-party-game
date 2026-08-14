import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Everything is client-side state + localStorage, no server needed —
  // static export deploys as plain files to any static host.
  output: "export",
};

export default nextConfig;
