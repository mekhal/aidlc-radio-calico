/**
 * Minimal vanilla-JS test harness (no npm, no Jest) — see tests/README.md.
 * Loaded as a plain <script> global; exposes window.TestHarness.
 */
(function (global) {
  const results = [];
  const pending = [];
  let currentSuite = "";
  let queue = Promise.resolve();

  function describe(name, fn) {
    const previousSuite = currentSuite;
    currentSuite = previousSuite ? `${previousSuite} > ${name}` : name;
    fn();
    currentSuite = previousSuite;
  }

  // Issue #205, PR C (AC-C1): tags each recorded result with the
  // page/component its registering *.test.js file belongs to, grouped by
  // test folder — everything else (files directly under tests/, covering
  // index.html/app.js) buckets to "index/app". Pure/testable on its own so
  // it can be unit-tested without needing a real <script> load.
  function categorizeScriptPath(url) {
    if (!url) return "index/app";
    const match = url.match(/\/tests\/(shared|logo|menu|sidebar|footer|about|case-study|contact|whats-this)\//);
    return match ? match[1] : "index/app";
  }

  function it(name, fn) {
    const fullName = currentSuite ? `${currentSuite} > ${name}` : name;
    // Captured synchronously at registration time — document.currentScript
    // is only meaningful while the registering <script> is still executing,
    // not once the queued async test body below actually runs.
    const category = categorizeScriptPath(document.currentScript && document.currentScript.src);
    const promise = queue.then(async () => {
      try {
        await fn();
        results.push({ name: fullName, passed: true, category });
        console.log(`PASS: ${fullName}`);
      } catch (error) {
        const message = error && error.message ? error.message : String(error);
        results.push({ name: fullName, passed: false, error: message, category });
        console.log(`FAIL: ${fullName} — ${message}`);
      }
    });
    queue = promise;
    pending.push(promise);
    return promise;
  }

  function stringify(value) {
    try {
      return JSON.stringify(value);
    } catch (_e) {
      return String(value);
    }
  }

  function expect(actual) {
    const matchers = {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${stringify(actual)} to be ${stringify(expected)}`);
        }
      },
      toEqual(expected) {
        if (stringify(actual) !== stringify(expected)) {
          throw new Error(`Expected ${stringify(actual)} to equal ${stringify(expected)}`);
        }
      },
      toContain(expected) {
        if (!actual || !actual.includes(expected)) {
          throw new Error(`Expected ${stringify(actual)} to contain ${stringify(expected)}`);
        }
      },
      toBeTruthy() {
        if (!actual) throw new Error(`Expected ${stringify(actual)} to be truthy`);
      },
      toBeFalsy() {
        if (actual) throw new Error(`Expected ${stringify(actual)} to be falsy`);
      },
      toBeGreaterThan(expected) {
        if (!(actual > expected)) {
          throw new Error(`Expected ${stringify(actual)} to be greater than ${stringify(expected)}`);
        }
      },
    };

    // Issue #542 (root cause D): negates each matcher above by asserting it
    // throws — reused rather than duplicated so .not stays in sync with
    // whatever matchers exist.
    matchers.not = Object.keys(matchers).reduce((negated, name) => {
      negated[name] = (...args) => {
        let threw = false;
        try {
          matchers[name](...args);
        } catch (_e) {
          threw = true;
        }
        if (!threw) {
          throw new Error(`Expected ${stringify(actual)} not to satisfy ${name}(${args.map(stringify).join(", ")})`);
        }
      };
      return negated;
    }, {});

    return matchers;
  }

  async function allSettled() {
    await Promise.all(pending);
  }

  global.TestHarness = {
    describe,
    it,
    expect,
    allSettled,
    getResults: () => results.slice(),
    categorizeScriptPath,
  };
})(window);
