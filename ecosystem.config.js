module.exports = {
  apps : [{
    name: "compute.rhino3d.appserver",
    script: "./bin/www",
    instances  : "max",
    exec_mode  : "cluster",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
