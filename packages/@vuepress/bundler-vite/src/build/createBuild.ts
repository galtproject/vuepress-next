import type { CreateVueAppFunction } from '@vuepress/client'
import type { App, Bundler } from '@vuepress/core'
import { chalk, fs, ora, withSpinner } from '@vuepress/utils'
import type { OutputChunk, RollupOutput } from 'rollup'
import { build } from 'vite'
import type { ViteBundlerOptions } from '../types'
import { renderPage } from './renderPage'
import { resolveViteConfig } from './resolveViteConfig'
import {OutputIpfsAsset, OutputIpfsChunk} from "./interface";
import {resolvePageChunkFiles} from "./resolvePageChunkFiles";

export const createBuild =
  (options: ViteBundlerOptions): Bundler['build'] =>
  async (app: App) => {
    // vite compile
    let clientOutput!: RollupOutput
    let serverOutput!: RollupOutput
    await withSpinner('Compiling with vite')(async () => {
      // create webpack config
      const clientConfig = resolveViteConfig({
        app,
        options,
        isServer: false,
      })
      const serverConfig = resolveViteConfig({
        app,
        options,
        isServer: true,
      })

      ;[clientOutput, serverOutput] = await Promise.all([
        build(clientConfig) as Promise<RollupOutput>,
        build(serverConfig) as Promise<RollupOutput>,
      ])
    });

    // get client bundle entry chunk and css asset
    const clientEntryChunk = clientOutput.output.find(
      (item) => item.type === 'chunk' && item.isEntry
    ) as OutputIpfsChunk;
    const clientCssAsset = clientOutput.output.find(
      (item) => item.type === 'asset' && item.fileName.endsWith('.css')
    ) as OutputIpfsAsset;

    const { bundlerConfig } = app.options;
    if (bundlerConfig && bundlerConfig.storeAsset) {
      clientCssAsset.ipfsHash = await bundlerConfig.storeAsset(clientCssAsset.source);
      clientEntryChunk.ipfsHash = await bundlerConfig.storeAsset(clientEntryChunk.code);
    }

    // render pages
    await withSpinner('Rendering pages')(async () => {
      // load ssr template file
      console.log('app.options', app.options);
      const ssrTemplate = (
        await fs.readFile(app.options.templateBuild)
      ).toString()
      // get server bundle entry chunk
      const serverEntryChunk = serverOutput.output.find(
        (item) => item.type === 'chunk' && item.isEntry
      ) as OutputChunk

      // load the compiled server bundle
      const { createVueApp } = require(app.dir.dest(
        '.server',
        serverEntryChunk.fileName
      )) as {
        createVueApp: CreateVueAppFunction
      }

      // create vue ssr app
      const { app: vueApp, router: vueRouter } = await createVueApp()
      console.log('app.dir.dest(\'.server\')', app.dir.dest('assets'));
      console.log('fs.existsSync', fs.existsSync(app.dir.dest('assets')));

      const storedAssets = {};
      // pre-render pages to html files
      const spinner = ora()
      for (const page of app.pages) {
        // resolve page chunks
        const pageChunkFiles = resolvePageChunkFiles({ page, output: clientOutput.output });
        if (bundlerConfig && bundlerConfig.storeAsset) {
          const {baseStorageUri: base} = bundlerConfig;
          for (let i = 0; i < pageChunkFiles.length; i++) {
            const fileName = pageChunkFiles[i];
            if (!storedAssets[fileName]) {
              storedAssets[fileName] = await bundlerConfig.storeAsset(fs.readFileSync(app.dir.dest(fileName)));
            }
            pageChunkFiles[i] = base + storedAssets[fileName] + (fileName.endsWith('.js') ? '#.js' : '#.css');
          }
        }

        spinner.start(`Rendering pages ${chalk.magenta(page.path)}`)
        await renderPage({
          app,
          page,
          vueApp,
          vueRouter,
          ssrTemplate,
          output: clientOutput.output,
          outputEntryChunk: clientEntryChunk,
          outputCssAsset: clientCssAsset,
          pageChunkFiles,
        })
      }
      spinner.stop()
    })

    // keep the server bundle files in debug mode
    if (!app.env.isDebug) {
      // remove server dest directory after pages rendered
      await fs.remove(app.dir.dest('.server'))
    }
  }
