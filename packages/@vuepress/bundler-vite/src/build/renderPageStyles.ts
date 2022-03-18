import type { App } from '@vuepress/core'
import {OutputIpfsAsset} from "./interface";

/**
 * Render styles of current page
 */
export const renderPageStyles = async ({
  app,
  outputCssAsset,
}: {
  app: App
  outputCssAsset: OutputIpfsAsset
}): Promise<string> => {
  return `<link rel="stylesheet" href="${outputCssAsset.fileName.startsWith('http') ? '' : app.options.base}${outputCssAsset.fileName}">`;
}
