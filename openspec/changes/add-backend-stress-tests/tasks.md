## 1. Package setup

- [x] 1.1 Create `packages/stress-tests` with a private `package.json` (`@clubmed/stress-tests`) and `artillery` as dev dependency
- [x] 1.2 Add `packages/stress-tests/reports/` to `.gitignore`
- [x] 1.3 Add the root script `stress:payment-config` (`stress:report` dropped: `artillery report` is deprecated, see design)

## 2. Payment config scenario

- [x] 2.1 Write `config/environments.yml` with the `local` (8083) and `docker` (8080) targets
- [x] 2.2 Write `data/payment-config-headers.csv` (locale × issuer type, plus a row without headers)
- [x] 2.3 Write `scenarios/payment-config.yml`: phases (D3), `GET /rest/payment_config` with the CSV headers, `expect` on status, content type, `feature_flips` and `settings`
- [x] 2.4 Add `ensure` thresholds (p95, p99, error rate)

## 3. Verification

- [x] 3.1 Warn the staging CMS owners, then run the full scenario against the local server and check the JSON report (see design: cache added and TTL unit fixed)
- [x] 3.2 Check a non-zero exit code when a threshold is exceeded (e.g. temporarily set p95 to 1 ms)
- [x] 3.3 Check an invalid `x-issuer-type` row makes the run report failed requests (`400`), then remove it
- [ ] 3.4 Run against the Docker container (`docker compose up`) and compare
- [ ] 3.5 Split the latency between the server and Directus (logs or Datadog APM), tune the D3 thresholds and record the results and deviations in `design.md`

## 4. Documentation

- [x] 4.1 `packages/stress-tests/README.md`: how to run, environments, safety rules (no production, no PSP, Directus load), baseline table
- [x] 4.2 List the next candidate endpoints and what they need (`payment_content` as-is; `payment_schedules`, `payment_providers` with Club Med API mocks and test bookings)
