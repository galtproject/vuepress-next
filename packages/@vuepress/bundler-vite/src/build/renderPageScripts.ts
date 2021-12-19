import type { App } from '@vuepress/core'
import type { OutputChunk } from 'rollup'
const {getIpfsHashFromString} = require('geesome-libs/src/ipfsHelper');

/**
 * Render scripts of current page
 */
export const renderPageScripts = async ({
  app,
  outputEntryChunk,
}: {
  app: App
  outputEntryChunk: OutputChunk
}): Promise<string> => {
  const {baseStorageUri} = app.options.bundlerConfig || {};
  if (baseStorageUri) {
    return `<link rel="stylesheet" href="${baseStorageUri}${await getIpfsHashFromString(outputEntryChunk.code)}">`;
  } else {
    return `<script type="module" src="${app.options.base}${outputEntryChunk.fileName}" defer></script>`;
  }
}
