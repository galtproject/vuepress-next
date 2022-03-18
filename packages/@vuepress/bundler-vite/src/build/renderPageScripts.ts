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
  return `<script type="module" src="${outputEntryChunk.fileName.startsWith('http') ? '' : app.options.base}${outputEntryChunk.fileName}" defer></script>`;
}
