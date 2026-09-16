module.exports = {
  apps: [
    {
      name: "fols-security",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        // Clerk's strict-CSP middleware performs an internal localhost rewrite.
        // Public access is blocked at the firewall; Nginx is the only entrypoint.
        HOSTNAME: "0.0.0.0",
        PORT: "3001",
      },
    },
  ],
};
