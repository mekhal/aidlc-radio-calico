<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/verify-uploaded-asset-content-before-mapping/SKILL.md
Surfaced while closing issue #189 — 4 images were requested for 4 distinct README sections, but
inspection showed only 2 visually distinct diagrams among the uploads (one diagram was uploaded
3 times with only an in-image text label differing). Flagging this before drafting a plan avoided
guessing a positional (1st image -> 1st slot) mapping that would have been wrong.
Decision record: docs/decisions/2026-07-27-readme-diagrams-shared-image-reuse-and-branching-role-split.md
-->
<!-- BEGIN SKILL.md -->
---
name: verify-uploaded-asset-content-before-mapping
description: Use when a request maps N uploaded files (images, diagrams, attachments) to N distinct slots/sections — read each file's actual content before assuming positional order matches intent, and flag duplicates/mismatches to the human instead of guessing.
---

When a human's request lists several uploaded assets alongside several target locations (e.g.
"put image 1 in section A, image 2 in section B..."), do not assume the Nth upload belongs to the
Nth listed slot. Read/inspect each file's actual content first (for images, use the Read tool; for
other assets, open and compare them) and check whether it plausibly matches the topic of its
intended slot.

If two or more uploads turn out to be identical or near-identical (e.g. same diagram re-exported,
or differing only in an incidental label), or a file's content doesn't match its requested slot's
topic, do not silently proceed with the stated order — post a comparison table showing what was
requested vs. what each file actually contains, and ask the human to confirm or correct the
mapping before writing a plan. This is the "ask when in doubt" rule applied specifically to
multi-asset requests, where the risk isn't ambiguous instructions but a request whose stated
mapping and actual attachments have silently drifted apart.
<!-- END SKILL.md -->
