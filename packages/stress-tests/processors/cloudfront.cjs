// Counts where each response comes from, from the `x-cache` header CloudFront adds in front of the deployed servers:
// `cloudfront.miss` (forwarded to the Node server), `cloudfront.hit` (served from the CloudFront cache, the server was
// not measured), `cloudfront.other` (RefreshHit, Error...) or `cloudfront.none` (no CloudFront, e.g. a local server).
function countCloudFrontCache(_request, response, _context, events, next) {
  const xCache = String(response.headers['x-cache'] ?? '').toLowerCase();
  const source = !xCache
    ? 'none'
    : xCache.startsWith('miss ')
      ? 'miss'
      : xCache.startsWith('hit ')
        ? 'hit'
        : 'other';

  events.emit('counter', `cloudfront.${source}`, 1);
  next();
}

module.exports = { countCloudFrontCache };
