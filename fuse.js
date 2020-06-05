const { fusebox, sparky } = require('fuse-box');
const { pluginTypeChecker } = require('fuse-box-typechecker');

console.log("=====================================================================================");


class Context {
    isProduction;
    runServer;
    getBackendConfig(prod) {
        return fusebox({
            target: 'server',
            entry: './src/backend/main.ts',
            watcher: {
                enabled: !prod,
                include: ['./src/backend'],
                ignored: ['dist', 'dev']
            },
            dependencies: { ignoreAllExternal: true },
            logging: { level: 'succinct' },
            plugins: [pluginTypeChecker({
                name: 'backend',
                basePath: './src/backend',
                tsConfig: '../../tsconfig',
                shortenFilenames: false
            })],
            cache: {
                enabled: true,
                root: '.cache/backend'
            }
        });
    }

    getFrontendConfig(prod) {
        return fusebox({
            target: 'browser',
            entry: './src/frontend/index.ts',
            dependencies: { include: ['tslib'] },
            hmr: { plugin: './src/frontend/fuseHmrPlugin.ts' },
            logging: { level: 'succinct' },
            webIndex: {
                publicPath: './',
                template: 'src/frontend/index.html'
            },
            plugins: [pluginTypeChecker({
                name: 'frontend',
                basePath: './src/frontend',
                tsConfig: '../../tsconfig',
                shortenFilenames: false
            })],
            cache: {
                enabled: !prod,
                root: '.cache/frontend'
            },
            watcher: {
                enabled: !prod,
                include: ['./src/frontend'],
                ignored: ['dist', 'dev'],
            },
            devServer: {
                httpServer: prod ? false : { port: 4444 },
                hmrServer: prod ? false : { port: 4444, connectionURL: 'ws://127.0.0.1:4444' }
            }
        });
    }
}

const { task, rm, src } = sparky(Context);
let watchStarted = false;
task('default', async (ctx) => {
    // this is run by the [start] npm task.
    await rm('./dist');
    await rm('/.cache'); // been tricked by cache...

    const frontendConfig = ctx.getFrontendConfig();
    await frontendConfig.runDev({ bundles: { distRoot: 'dist/frontend', app: 'app.js' } });

    const backendConfig = ctx.getBackendConfig();
    const { onComplete } = await backendConfig.runDev({ bundles: { distRoot: 'dist/backend', app: 'app.js' } });

    await src(`./resources/**/*.*`).dest(`./dist/frontend`, `resources`).exec();

    onComplete((output) => {
        output.server.start({ argsBefore: ['--inspect-brk'] });
    });
});

task('dist', async (ctx) => {
    await rm('./dist');
    await rm('/.cache');

    const backendConfig = ctx.getBackendConfig(true);
    await backendConfig.runDev({ bundles: { distRoot: 'dist/backend', app: 'app.js' } });

    const frontendConfig = ctx.getFrontendConfig(true);
    await frontendConfig.runProd({ uglify: true, bundles: { distRoot: 'dist/frontend', app: 'app.js' } });

    await src(`./resources/**/*.*`).dest(`./dist/frontend`, `resources`).exec();

    console.log("Dist finished. the generated code is available in the /dist folder.")
});
