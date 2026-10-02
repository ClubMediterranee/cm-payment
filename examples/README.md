# CAPS embed host examples

Minimal host applications consuming the **published shape** of `@clubmed/caps` (installed from
`packages/sdk/dist`, like the npm tarball). They are outside the pnpm workspace on purpose.

| Example        | Bundler              | Port |
| -------------- | -------------------- | ---- |
| `webpack-host` | webpack 5            | 4007 |
| `next-host`    | Next.js (App Router) | 4008 |

```bash
pnpm --filter @clubmed/caps run build   # builds packages/sdk/dist
cd examples/webpack-host && npm install && npm run build && npm start
cd examples/next-host && npm install && npm run build && npm start
```

Both pages accept `?caps_url=…&issuer=GM&type=proposal&id=…&customer_id=…&mode=iframe`.
The CAPS server must allow the example origin, e.g.
`CAPS_ALLOWED_ORIGINS=http://localhost:4007,http://localhost:4008`.
