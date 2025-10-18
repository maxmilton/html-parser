await Bun.$`rm -rf dist`;
await Bun.$`mkdir -p test-cache`;

// XXX: Uncomment to debug network requests.
// Bun.env.BUN_CONFIG_VERBOSE_FETCH = '1';
