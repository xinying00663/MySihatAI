---
name: avoid-ai-design-tells
description: Checklist and guidance for avoiding the common visual patterns that make a UI look obviously AI-generated or templated. Use this whenever building or reviewing any frontend surface — landing pages, marketing sections, dashboards, app screens, cards, hero sections — to catch generic SaaS-template defaults before they ship. Trigger on any frontend design or UI-building task, or when a design is described as looking "generic," "templated," or "AI-generated."
---

# Avoid AI Design Tells

AI-generated interfaces converge on a recognizable set of defaults. None of these are wrong in isolation, but stacked together they signal "unstyled AI output" rather than a considered design. Before shipping any UI, check for and remove these patterns unless the content genuinely calls for them.

## The common tells

- **SaaS-card kit**: content chopped into identical rounded cards, one border-radius applied to everything regardless of hierarchy, the same soft grey drop shadow (`rgba(0,0,0,.1)`) under every card, gradient washes used as pure decoration.
- **Status-metrics filler cards**: a card listing vague labels ("System status," "Coverage," "Output") paired with green pills and unsourced numbers. If a stat isn't real, specific, and meaningfully useful to the viewer, cut it.
- **Decorative numbering**: a "01 / 02 / 03" row with icon-in-a-circle markers, used even when the content isn't actually a sequence. Only number things that are a true sequence (steps, timeline, ranked order) — and even then, prefer a plain typographic treatment over icon-in-a-circle.
- **Tracked-out ALL-CAPS eyebrow labels** placed above every heading ("OUR SERVICES," "HOW IT WORKS"). This is template chrome, not content — drop it.
- **Pill badges as filler**: tags and pills used decoratively rather than to encode real, scannable state.
- **Meta strings joined with middle dots** ("A · B · C") or labels built as "WORD — fragment" with a spaced em dash.
- **A monospace face for small data labels** regardless of whether the content is actually code or data.
- **A "→" appended to every link and button label.**
- **Accenting a single word in a headline** via italic, bold, or a different color, as a reflexive move rather than a deliberate one.
- **Generic geometric sans + muted grayscale palette + one safe accent color** (often a green or blue) — the default when no real palette decision was made.
- **Specific overused color/style clusters**, worth recognizing on sight:
  - warm cream background (~#F4F1EA) + high-contrast serif display + terracotta/clay accent (~#D97757)
  - near-black background + single bright acid-green or vermilion accent
  - broadsheet layout: hairline rules, zero border-radius, dense newspaper-like columns
- **Fade-and-slide-up entrance animation on every section**, plus a hover transition on every card — scattered motion rather than one deliberate moment.
- **Punchy fragmented ad-copy headlines** ("Do X. Get Y. Ship Z.") used regardless of whether the audience or content calls for that register.

## What to do instead

1. **Ground the design in the actual subject matter.** Identify what's genuinely characteristic about this product/content and let that drive the hero treatment, palette, and type — not a generic "startup landing page" template. A tool for financial analysts and a toy for 8-year-olds should look nothing alike, even with the same layout skeleton.
2. **Make a real color decision.** Name 4–6 specific hex values deliberately tied to the subject, not the safe-default palette. Reserve the most saturated color for the single most important action or element.
3. **Pick typography on purpose.** One or two type families, chosen for the subject and audience, not the default geometric sans. Set a real type scale with intentional weight/spacing, and treat headline type as an active design element rather than a neutral text container.
4. **Let structure encode meaning.** Borders, numbering, dividers, and labels should communicate something true about the content's structure, not decorate empty space.
5. **Spend boldness in one place.** Pick one memorable element and keep everything else disciplined and quiet, rather than distributing "interesting" treatments evenly across every section.
6. **One motion moment, not many.** A single orchestrated reveal or hover state beats scattered animation on every element.
7. **Write copy specific to the actual audience and moment**, not generic marketing fragments — plain, active-voice, specific language beats clever ad-style headlines in almost every real product context.

## Quick pre-ship check

Before calling a design done, scan it against this list:
- Are any cards identical in shape/shadow/radius purely by default, with no hierarchy reasoning?
- Is any number on the page unsourced or vague filler?
- Is numbering used only where the content is a genuine sequence?
- Are there ALL-CAPS eyebrow labels or middle-dot meta strings that add no information?
- Is the palette a deliberate choice tied to this subject, or the safe grayscale-plus-accent default?
- Is there exactly one place where the design takes a real risk, with everything else calm around it?
- Would this headline/copy make sense specifically for this product, or could it be pasted onto any other landing page unchanged?

If several of these fail, treat it as a signal to revise before shipping, not just cosmetic polish to skip.