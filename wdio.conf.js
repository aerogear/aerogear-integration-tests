const path = require("path");

exports.config = {
    port: 4723,
    specs: [
        './test/**/*.ts'
    ],
    capabilities: [{
        platformName: 'Android',
        platformVersion: '9',
        deviceName: 'Android Emulator',
        app: path.join(__dirname, "platforms/android/app/build/outputs/apk/debug/app-debug.apk"),
        automationName: 'UiAutomator2',
        autoWebview: true
    }],
    logLevel: 'info',
    framework: 'mocha',
    reporters: ['dot'],
    mochaOpts: {
        ui: 'bdd',
        require: [
            // 'tsconfig-paths/register'
        ]
    },
    before: function() {
        require('ts-node').register({ files: true });
    },
}
