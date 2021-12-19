import type { App } from '@vuepress/core'
import type { OutputAsset } from 'rollup'
const {getIpfsHashFromString} = require('geesome-libs/src/ipfsHelper');

/**
 * Render styles of current page
 */
export const renderPageStyles = async ({
  app,
  outputCssAsset,
}: {
  app: App
  outputCssAsset: OutputAsset
}): Promise<string> => {
  const {baseStorageUri} = app.options.bundlerConfig || {};
  if (baseStorageUri) {
    return `<link rel="stylesheet" href="${baseStorageUri}${await getIpfsHashFromString(outputCssAsset.source)}">`;
  } else {
    return `<link rel="stylesheet" href="${app.options.base}${outputCssAsset.fileName}">`;
  }
}
