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
 */
"use strict";

function buildLogo() {
  const wordmark = document.createElement("span");
  wordmark.className = "chloe-wordmark";

  const logo = document.createElement("img");
  logo.className = "chloe-wordmark__logo";
  logo.src = "RadioCalicoStyle/RadioCalicoLogoTM.png";
  logo.alt = "Radio Calico logo";

  wordmark.appendChild(document.createTextNode("Radio"));
  wordmark.appendChild(logo);
  wordmark.appendChild(document.createTextNode("Calico"));

  return wordmark;
}
