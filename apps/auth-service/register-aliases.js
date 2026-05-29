const Module = require('module');
const path = require('path');

const projectRoot = __dirname;
const distRoot = path.join(projectRoot, 'dist');

const aliasMap = {
  '@auth/': path.join(distRoot, 'apps', 'auth-service', 'src') + path.sep,
  '@packages/': path.join(distRoot, 'packages') + path.sep,
};

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  for (const [alias, targetPrefix] of Object.entries(aliasMap)) {
    if (request.startsWith(alias)) {
      const subPath = request.slice(alias.length);
      const mappedRequest = path.join(targetPrefix, subPath);
      return originalResolveFilename.call(this, mappedRequest, parent, isMain, options);
    }
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
