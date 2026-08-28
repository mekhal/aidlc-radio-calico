/**
 * Issue #254 (Ticket 2 of #245): logo component extracted out of
 * album-promo.js's buildHeader() (previously album-promo.js:226-236) so it
 * can be mounted independently of the header shell/nav — plain <script> tag,
 * no ES modules (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md);
 * a plain function declaration attaches to `window` automatically.
 *
 * No `state` param: the wordmark markup reads nothing off state (confirmed
 * on issue #254, 2026-08-03 — the "(a)" interpretation). See
 * tests/logo/logo.test.js.
 *
 * Issue #559: wordmark is an <a> linking to https://www.radio-calico.com,
 * opening in a new tab (target="_blank" rel="noopener noreferrer") since
 * it's an external site. Applies everywhere buildLogo() is used (reuse-first
 * — see tests/logo/logo.test.js for the full attribute contract).
 */
"use strict";

function buildLogo() {
  const wordmark = document.createElement("a");
  wordmark.className = "chloe-wordmark";
  wordmark.href = "https://www.radio-calico.com";
  wordmark.target = "_blank";
  wordmark.rel = "noopener noreferrer";
  wordmark.setAttribute("aria-label", "Radio Calico website");

  const logo = document.createElement("img");
  logo.className = "chloe-wordmark__logo";
  logo.src = "RadioCalicoStyle/RadioCalicoLogoTM.png";
  logo.alt = "Radio Calico logo";

  wordmark.appendChild(document.createTextNode("Radio"));
  wordmark.appendChild(logo);
  wordmark.appendChild(document.createTextNode("Calico"));

  return wordmark;
}
