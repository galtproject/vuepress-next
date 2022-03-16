import { renderToString } from '@vue/server-renderer'
import type { SSRContext } from '@vue/server-renderer'
import type { App, Page } from '@vuepress/core'
import { fs, renderHead } from '@vuepress/utils'
import type { OutputAsset, OutputChunk, RollupOutput } from 'rollup'
import type { App as VueApp } from 'vue'
import type { Router as VueRouter } from 'vue-router'
import { renderPagePrefetchLinks } from './renderPagePrefetchLinks'
import { renderPagePreloadLinks } from './renderPagePreloadLinks'
import { renderPageScripts } from './renderPageScripts'
import { renderPageStyles } from './renderPageStyles'
import { resolvePageChunkFiles } from './resolvePageChunkFiles'
import {OutputIpfsAsset, OutputIpfsChunk} from "./interface";

export const renderPage = async ({
  app,
  page,
  vueApp,
  vueRouter,
  ssrTemplate,
  output,
  outputEntryChunk,
  outputCssAsset,
  pageChunkFiles,
}: {
  app: App
  page: Page
  vueApp: VueApp
  vueRouter: VueRouter
  ssrTemplate: string
  output: RollupOutput['output']
  outputEntryChunk: OutputIpfsChunk
  outputCssAsset: OutputIpfsAsset,
  pageChunkFiles: string[]
}): Promise<void> => {
  // switch to current page route
  await vueRouter.push(page.path)
  await vueRouter.isReady()

  // create vue ssr context with default values
  const ssrContext: SSRContext = {
    lang: 'en',
    head: [],
  }

  // render current page to string
  const pageRendered = await renderToString(vueApp, ssrContext);

  // generate html string
  const html = ssrTemplate
    // vuepress version
    .replace('{{ version }}', app.version)
    // page lang
    .replace('{{ lang }}', ssrContext.lang)
    // page head
    .replace(
      '<!--vuepress-ssr-head-->',
      ssrContext.head.map(renderHead).join('')
    )
    // page preload & prefetch links
    .replace(
      '<!--vuepress-ssr-resources-->',
      `${await renderPagePreloadLinks({
        app,
        outputEntryChunk,
        pageChunkFiles,
      })}${await renderPagePrefetchLinks({
        app,
        outputEntryChunk,
        pageChunkFiles,
      })}`
    )
    // page styles
    .replace(
      '<!--vuepress-ssr-styles-->',
      await renderPageStyles({ app, outputCssAsset })
    )
    .replace('<!--vuepress-ssr-app-->', pageRendered)
    // page scripts
    .replace(
      '<!--vuepress-ssr-scripts-->',
      await renderPageScripts({ app, outputEntryChunk })
    )

  // write html file
  await fs.outputFile(page.htmlFilePath, html)
}
