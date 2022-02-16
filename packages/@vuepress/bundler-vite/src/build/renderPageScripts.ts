import type { App } from '@vuepress/core'
import {OutputIpfsChunk} from "./interface";

/**
 * Render scripts of current page
 */
export const renderPageScripts = async ({
  app,
  outputEntryChunk,
}: {
  app: App
  outputEntryChunk: OutputIpfsChunk
}): Promise<string> => {
  const {baseStorageUri} = app.options.bundlerConfig || {};
  if (outputEntryChunk.ipfsHash) {
    return `<link rel="stylesheet" href="${baseStorageUri}${outputEntryChunk.ipfsHash}">`;
  } else {
    return `<script type="module" src="${app.options.base}${outputEntryChunk.fileName}" defer></script>`;
  }
}
