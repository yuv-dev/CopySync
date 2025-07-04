/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/oauth/(.*)",
        headers: [{ key: "Cross-Origin-Opener-Policy", value: "same-origin" }],
      },
    ];
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://clipsync-frontend.loca.lt",
    "https://clipsync-backend.loca.lt",
  ],
};

export default nextConfig;
