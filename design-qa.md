# SciForge homepage design QA

## Comparison target

- Source visual truth: `audit/2026-08-12/04-skillforge-redesign-desktop-viewport.jpg` and `audit/2026-08-12/05-skillforge-redesign-mobile.jpg`.
- Current implementation: `audit/2026-08-13/10-global-filter-harbor-desktop.png` and `audit/2026-08-13/11-general-mobile.png`.
- Same-input comparisons: `audit/2026-08-13/12-desktop-source-vs-current.png` and `audit/2026-08-13/13-mobile-source-vs-current.png` (source left, implementation right).
- Intended changes from the visual source: the user selected Harbor title colors and replaced repeated per-section discipline controls with one global research-domain filter. `通用科研` is a cross-disciplinary scope, not a discipline.

## Capture normalization

- Desktop: source and implementation are both 1280 x 720 pixels at a 1280 x 720 CSS viewport.
- Mobile: source and implementation are both 390 x 844 pixels at a 390 x 844 CSS viewport.
- Browser device pixel ratio: 1. No density conversion was needed.
- Desktop state: home route, empty query, `全部` selected.
- Mobile state: home route, empty query, `通用科研` selected to expose its active and empty states.

## Findings

- No actionable P0, P1, or P2 mismatch remains.
- P3: the current catalog has no cross-disciplinary resource yet, so the `通用科研` empty state is visible until literature, writing, visualization, data-processing, or reference-management entries are added. The interface states this honestly and does not fabricate cards or counts.

## Full-view comparison evidence

- The approved minimal navigation, centered hero, outline wordmark, pale background, rounded search input, and restrained black/white directory language remain intact.
- The Harbor title treatment is the intentional visual delta: pale mist blue `#c5d9ed` and coral `#efc5b5` offset the original black outline without reducing text contrast.
- The new global `资源范围与学科` block now sits between hero and resource sections. It is visually secondary to search, but high enough in the hierarchy to filter Skill, MCP, and Plugin together. Within it, `通用科研` is exposed as `适用范围` and the 13 academic choices are exposed separately as `学科领域`.
- On mobile, the filter remains a compact horizontal rail instead of expanding into a tall multi-row taxonomy. The active chip scrolls into the rail viewport while the page itself remains 390 px wide.

## Focused-region comparison evidence

- `audit/2026-08-13/13-mobile-source-vs-current.png` is the focused comparison because the mobile header, hero, search, global-filter heading, selected `通用科研` chip, and adjacent discipline chips are all readable at original scale.
- The comparison confirms that the global filter replaces the older Skill-local filter without changing the established hero or navigation. No additional crop is needed because the relevant controls are legible in the same-input mobile comparison.

## Required fidelity surfaces

- Fonts and typography: existing Outfit/Inter hierarchy, weight, line height, wrapping, and outline display text remain consistent. Long Chinese copy wraps cleanly at 390 and 320 px without clipping.
- Spacing and layout rhythm: desktop hero proportions stay aligned with the source; the global filter adds one intentional section boundary. Cards remain 3 / 3 / 2 / 1 / 1 columns at the tested widths.
- Colors and visual tokens: Harbor uses only the approved blue/coral pair. Active filters retain the source's near-black control state; the cross-disciplinary chip receives a subtle blue wash when inactive. All small gray text uses contrast-safe tokens.
- Image quality and asset fidelity: no raster hero imagery is present in the source or implementation. Existing SciForge and GitHub vector assets remain crisp and unchanged; no placeholder art was introduced.
- Copy and content: `通用科研` and the 13 disciplines are presented as separate semantic groups. The general empty-state copy explicitly limits this scope to cross-disciplinary literature retrieval, research writing, reference management, and general-purpose data organization/plotting; discipline-specific tools remain under their academic field.
- Icons: SciForge, GitHub, and search icons retain the existing library/source treatment and remain aligned at desktop and mobile sizes.
- Accessibility: filters are real buttons in two labelled subgroups, expose `aria-pressed`, have 42 px minimum height, and retain global focus-visible styles. SearchBar is the only live result region, preventing duplicate announcements. Programmatic rail scrolling respects `prefers-reduced-motion`. Card category badges use contrast ratios from 6.78:1 to 8.49:1. Empty options remain selectable rather than falsely disabled.

## Interaction and responsive verification

- Initial state: 15 filter buttons (`全部`, `通用科研`, and 13 disciplines), 11 real resource cards.
- `通用科研`: URL becomes `?scope=general`; `field` is absent; count is 0; the dedicated empty state names the intended cross-disciplinary resource types.
- `计算机科学` + search `Qiskit`: URL is `?field=computer-science&q=Qiskit`; exactly one Plugin card is visible; section counts are 0 / 0 / 1.
- Clearing search preserves the selected discipline and restores three computer-science resources.
- Conflicting legacy URL `?scope=general&field=computer-science&theme=foo` canonicalizes to `?scope=general`; empty and repeated `field`/`scope` keys are also normalized to one valid state.
- Mobile rail: selecting `艺术` scrolls the active chip to the end of the rail; selecting `通用科研` keeps the chip fully visible.
- No page-level horizontal overflow at 1440 x 900, 1024 x 768, 768 x 1024, 390 x 844, or 320 x 568.
- Card columns at those viewports: 3, 3, 2, 1, 1.
- Mobile navigation stays visible in a two-row 106 px header.
- Fresh browser tab console: no warnings or errors.

## Comparison history

### Prior approved baseline

- The simplified hero, compact resource cards, reduced navigation, responsive breakpoints, anchor handling, and search/filter consistency had already passed the previous source-to-implementation QA in `audit/2026-08-12`.

### Current iteration

- Potential P2 reviewed: adding 15 top-level choices could have produced a tall mobile filter wall. The implementation uses a single horizontal rail, verified at 390 and 320 px with no document overflow.
- Potential P2 reviewed: treating general-purpose research as a discipline would have made taxonomy and URLs misleading. The implementation uses independent `scope=general`, keeps academic choices under `field`, and canonicalizes conflicting parameters.
- Potential P2 reviewed: search could have reported a global count that the active domain hid. Counts, visible cards, per-section counts, and URL state were verified as the same intersection.
- Finding [P2]: the first implementation still labelled the combined choices as `研究领域`, allowed ambiguous empty/repeated URL keys, exposed multiple live result regions, used low-contrast card category badges, and did not defend future general-versus-discipline classification.
- Fix: split the controls into labelled `适用范围` and `学科领域` groups; canonicalize URL keys with `getAll`; keep SearchBar as the single live region; change badges to dark text on pale backgrounds; encode explicit classification objects and runtime invariants; add `overflow-wrap` for adversarial queries; make rail animation obey `prefers-reduced-motion`.
- Post-fix evidence: desktop and mobile same-input comparisons were recaptured; 15 controls remain visible; `?field=&scope=general` becomes `?scope=general`; a 180-character unbroken query has zero page overflow at 320 px; badge contrast is 8.49:1 / 8.33:1 / 6.78:1; fresh console has no warnings/errors.

## Implementation checklist

- [x] Harbor is the single fixed title treatment; temporary palette controls are absent.
- [x] One global filter controls Skill, MCP, and Plugin.
- [x] `通用科研` is placed directly after `全部` and modeled outside the discipline field.
- [x] URL, count, search, empty, mobile-scroll, navigation, and accessibility states are verified.
- [x] `npm run build` passes.
- [x] `npm run lint` passes with only three pre-existing warnings in unrelated legacy routes/components.

## Follow-up polish

- Add the first real `通用科研` resources only when their metadata and type are ready; the current empty state is deliberately honest.

final result: passed
