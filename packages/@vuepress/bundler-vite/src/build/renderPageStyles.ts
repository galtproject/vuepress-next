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
  const {baseStorageUri} = app.options.bundlerConfig || {};
  if (outputCssAsset.ipfsHash) {
    return `<link rel="stylesheet" href="${baseStorageUri}${outputCssAsset.ipfsHash}">`;
  } else {
    return `<link rel="stylesheet" href="${app.options.base}${outputCssAsset.fileName}">`;
  }
}
