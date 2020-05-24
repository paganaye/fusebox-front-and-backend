const { fusebox, sparky } = require('fuse-box');
const { pluginTypeChecker } = require('fuse-box-typechecker');

// get dbug for server side
process.env.password = process.argv[3];
const use = process.argv[3];
console.log(process.argv);

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
            plugins: [pluginTypeChecker({ name: 'backend', basePath: './src/backend', tsConfig: '../../tsconfig' })],
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
            plugins: [pluginTypeChecker({ name: 'frontend', basePath: './src/frontend', tsConfig: '../../tsconfig' })],
            cache: {
                enabled: !prod,
                root: '.cache/frontend'
            },
            watch: true,
            devServer: {
                httpServer: !prod,
                hmrServer: !prod
            }
        });
    }
}

const { task, rm, src } = sparky(Context);
let watchStarted = false;
task('default', async (ctx) => {
    await rm('./dist');
    await rm('/.cache'); // been trick by cache..

    const frontendConfig = ctx.getFrontendConfig();
    await frontendConfig.runDev({ bundles: { distRoot: 'dist/frontend', app: 'app.js' } });

    const backendConfig = ctx.getBackendConfig();
    const { onComplete } = await backendConfig.runDev({ bundles: { distRoot: 'dist/backend', app: 'app.js' } });

    await src(`./resources/**/*.*`).dest(`./dist/frontend`, `resources`).exec();

    onComplete((output) => {
        if (use === 'debug') {
            output.server.start({ argsBefore: ['--inspect-brk'] });
        } else {
            //output.server.start( {argsBefore:['--inspect-brk']});
            output.server.start();
        }
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
});
