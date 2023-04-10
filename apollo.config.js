module.exports = {
  client: {
    includes: ["src/**/*.ts"],
    name: "sdk",
    service: {
      url: "https://farzistore2hapi.farziengineer.co/graphql/?source=website",
      name: "saleor",
    },
  },
};
