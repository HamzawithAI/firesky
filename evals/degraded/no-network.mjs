/**
 * E8's preload (EVALS.md section 8, AC4, R26): the child process this is
 * imported into cannot reach the network and cannot see an API key.
 *
 * Loaded with `node --import`, so it runs before the CLI's first line.
 *
 * WHAT EACH LEG ACTUALLY PROVES, because a check that looks stronger than it is
 * would be the F-057 mistake again:
 *
 *   1. THE IMPORT HOOK. `module.registerHooks` (Node >= 22.15) refuses to
 *      resolve any networking builtin, so a static import, a dynamic import and
 *      a `require` of `node:net` and its siblings all throw at load time. This
 *      is the strong leg: it does not matter what the code would have done with
 *      the module, because the module never arrives.
 *   2. THE PATCHES. Where the hook is unavailable the same modules are loaded
 *      and their entry points replaced with throwing stubs. Weaker on purpose
 *      and labelled so: a caller holding a destructured reference taken before
 *      this file ran would slip past, which is why leg 1 is preferred and the
 *      mode is reported.
 *   3. `fetch`. Replaced in both modes; it is a global, so there is nothing to
 *      hold a prior reference to except the global itself.
 *   4. THE KEY SCAN. Any environment variable whose NAME looks like a model
 *      provider credential aborts the child. AC4 says "no API keys present",
 *      and the honest way to assert that is to fail rather than to hope the
 *      parent scrubbed correctly. Values are never read, printed or hashed.
 *
 * Not proven here, and not claimed: that the kit could not reach the network
 * through a subprocess. `src/git.ts` shells out to git, so E8's static leg
 * asserts separately that no git invocation in `src/` names a network
 * subcommand. Together the two cover the reachable surface; neither is a
 * sandbox, and this file is not one.
 */
import module from "node:module";

const BLOCKED = ["net", "tls", "http", "https", "http2", "dgram", "dns", "dns/promises", "inspector"];
const specifiers = new Set(BLOCKED.flatMap((n) => [n, `node:${n}`]));

const die = (what) => {
  const e = new Error(
    `E8: ${what} was reached, so this run is not zero-network. AC4 and R26 require ` +
      `every M-priority function to work with no network and no LLM available.`,
  );
  e.code = "E8_NETWORK_REACHED";
  throw e;
};

/* Leg 4 first: an aborted child is more useful than a green one that ran with a
   key in scope. The pattern matches names, never values. */
const KEYISH = /(^|_)(API_?KEY|ACCESS_?KEY|SECRET|TOKEN)($|_)|ANTHROPIC|OPENAI|GEMINI|GOOGLE_?API|VERTEX|AZURE_?OPENAI|COHERE|MISTRAL|HUGGINGFACE|HF_TOKEN|REPLICATE|TOGETHER_?API|GROQ|DEEPSEEK|XAI_/i;
const leaked = Object.keys(process.env).filter((k) => KEYISH.test(k));
if (leaked.length > 0) {
  process.stderr.write(`E8: the child was started with credential-shaped variables in scope: ${leaked.join(", ")}\n`);
  process.exit(97);
}

let mode = "patched";
if (typeof module.registerHooks === "function") {
  module.registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifiers.has(specifier)) die(`an import of '${specifier}'`);
      return nextResolve(specifier, context);
    },
  });
  mode = "import-hook";
} else {
  /* Leg 2, and its weakness is in the comment above, not hidden. */
  const patch = async (name, entries) => {
    const m = await import(`node:${name}`);
    for (const e of entries) if (m.default && e in m.default) m.default[e] = () => die(`${name}.${e}()`);
  };
  await patch("net", ["connect", "createConnection", "Socket"]);
  await patch("http", ["request", "get"]);
  await patch("https", ["request", "get"]);
  await patch("tls", ["connect"]);
  await patch("dgram", ["createSocket"]);
  await patch("dns", ["lookup", "resolve"]);
}

globalThis.fetch = () => die("fetch()");
process.env.DSK_E8_MODE = mode;
