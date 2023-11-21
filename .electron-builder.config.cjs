if (process.env.VITE_APP_VERSION === undefined) {
  const now = new Date();
  process.env.VITE_APP_VERSION = `${now.getUTCFullYear() - 2000}.${
    now.getUTCMonth() + 1
  }.${now.getUTCDate()}-${now.getUTCHours() * 60 + now.getUTCMinutes()}`;
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: "com.github.iffy.electronupdatergenericexample",
  productName: "Teste",
  icon: "assets/favicon.png",

  asar: true,
  directories: {
    output: "dist",
    buildResources: "buildResources",
  },
  publish: [
    {
      provider: "generic",
      url: "http://127.0.0.1:8080/",
    },
  ],

  nsis: {
    deleteAppDataOnUninstall: false,
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    runAfterFinish: true,
    perMachine: false,
  },

  squirrelWindows: {
    iconUrl:
      "https://static-00.iconduck.com/assets.00/perspective-dice-random-icon-469x512-mm6xb9so.png",
    artifactName: "${productName}-${os}-${channel}-${version}.${ext}",
  },
  win: {
    target: ["squirrel"],
  },
};

module.exports = config;
