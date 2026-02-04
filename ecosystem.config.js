const packageJson = require('./package.json');

module.exports = {
    apps: [
        {
            name: packageJson.name,
            namespace: packageJson.name,
            script: packageJson.main,
            instances: 1,
            exec_mode: "fork",
            watch: true,
        }
    ]
};