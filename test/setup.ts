await Bun.$`rm -rf dist`;
await Bun.$`mkdir -p temp`;

// XXX: Uncomment to debug network requests.
// Bun.env.BUN_CONFIG_VERBOSE_FETCH = '1';
