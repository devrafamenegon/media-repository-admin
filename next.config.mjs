/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: process.env.ACCESS_CONTROL_ALLOW_CREDENTIALS || "false",
          },
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.ACCESS_CONTROL_ALLOW_ORIGIN ||
              "http://localhost:3001",
          },
          {
            key: "Access-Control-Allow-Methods",
            value:
              process.env.ACCESS_CONTROL_ALLOW_METHODS ||
              "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              process.env.ACCESS_CONTROL_ALLOW_HEADERS ||
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
