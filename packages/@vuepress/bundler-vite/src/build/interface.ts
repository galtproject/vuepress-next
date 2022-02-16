import {OutputAsset, OutputChunk} from "rollup";


export interface OutputIpfsChunk extends OutputChunk {
  ipfsHash: string;
}
export interface OutputIpfsAsset extends OutputAsset {
  ipfsHash: string;
}
