import type { NextConfig } from 'next';
import {resolve} from 'node:path';
const engineEsm='./node_modules/@cortex-js/compute-engine/dist/compute-engine.min.esm.js';
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  // v0.30.2 advertises a UMD browser condition. Use the portable ESM build in both bundlers.
  turbopack:{resolveAlias:{'@cortex-js/compute-engine':engineEsm}},
  webpack(config){config.resolve.alias['@cortex-js/compute-engine$']=resolve(process.cwd(),engineEsm);return config;},
};
export default config;
