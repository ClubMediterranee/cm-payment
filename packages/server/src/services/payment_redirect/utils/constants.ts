export const RETRY_DEFAULTS = { attempts: 3, delay: 3000 };

/**
 * Longest total time spent waiting between attempts (status polling, DTMF retry), whatever Directus sets: with the
 * 8 s timeout of each upstream call, the request stays under CloudFront's 30 s origin timeout.
 */
export const WAIT_BUDGET_MS = 20_000;
