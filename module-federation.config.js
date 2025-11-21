import packageJSON from './package.json'

function remoteConfig(name, url) {
  return {
    type: 'module',
    name,
    entry: url,
    entryGlobalName: 'remote',
    shareScope: 'default',
  }
}

export default {
  filename: 'remoteEntry.js',
  name: 'app',
  exposes: {
    './DemoMfComponent': './src/demo-mf-component.tsx',
    './DemoMfSelfContained': './src/demo-mf-self-contained.tsx',
  },
  remotes: {},
  shared: {
    react: {
      singleton: true,
      requiredVersion: packageJSON.dependencies.react,
      eager: false,
    },
    'react-dom': {
      singleton: true,
      requiredVersion: packageJSON.dependencies['react-dom'],
      eager: false,
    },
  },
  runtimePlugins: [],
}
