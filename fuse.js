const { fusebox, sparky } = require('fuse-box');
const { pluginTypeChecker } = require('fuse-box-typechecker');

class Context {
    isProduction;
    runServer;
    getBackendConfig() {
        return fusebox({
            output: 'dist/backend/$name-$hash',
            target: 'server',
            homeDir: 'src/backend',
            entry: 'main.ts',
            watch: true,
            dependencies: { ignoreAllExternal: true },
            logging: { level: 'succinct' },
            plugins: [pluginTypeChecker({ name: 'backend', basePath: './src/backend' })],
            cache: {
                enabled: false,
                root: '.cache/backend'
            }
        });
    }

    getFrontendConfig() {
        return fusebox({
            output: 'dist/frontend/$name-$hash',
            target: 'browser',
            homeDir: 'src/frontend',
            entry: 'index.ts',
            dependencies: { include: ['tslib'] },
            logging: { level: 'succinct' },
            webIndex: {
                publicPath: './',
                template: 'src/frontend/index.html'
            },
            plugins: [pluginTypeChecker({ name: 'frontend', basePath: './src/frontend' })],
            cache: {
                enabled: false,
                root: '.cache/frontend'
            },
            watch: true,
            devServer: {
                httpServer: false,
                hmrServer: false
            }
        });
    }
}
const { task, rm } = sparky(Context);
let watchStarted = false;
task('default', async ctx => {
    await rm('./dist');

    const frontendConfig = ctx.getFrontendConfig();
    await frontendConfig.runDev();

    const backendConfig = ctx.getBackendConfig();
    await backendConfig.runDev(handler => {
        handler.onComplete(output => {
            if(process.argv[3]==="debug"){
                output.server.handleEntry({ nodeArgs: ['--inspect-brk'], scriptArgs: [] });
            } else {
               output.server.handleEntry({ nodeArgs: [], scriptArgs: [] });
            }
            
        });
    });
});

task('dist', async ctx => {
    await rm('./dist');

    const frontendConfig = ctx.getFrontendConfig();
    await frontendConfig.runProd({ uglify: false });

    const backendConfig = ctx.getBackendConfig();
    await backendConfig.runProd({
        uglify: true,
        manifest: true
    });
});
