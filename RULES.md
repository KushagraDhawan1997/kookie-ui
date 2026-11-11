# Composition rules

Read this before you build or change any screen, example, figure or preview made of Womp UI
components. These are settled rules. A screen that breaks one is not done, however good its
parts are.

Each rule says what to do and how to test it. Rule 1 also logs a warning in development. Every other rule is checked by eye: look at
the screenshot, light and dark, against this file before you show anything.

More rules will join this file as they are settled for v1. Until then, a rule that is not here
is not a rule.

## How to work

1. Use the component that owns the job. If a component draws a band, a footer, a close button
   or a title, use it. Never hand-build a band, toolbar, header or close button from a `Flex`
   or a positioned `div`. If no component owns the job, stop and say so. That's a gap in the
   system, not a call-site decision.
2. Never swap one component for another to get past a rule (a `Card` to a `Box`, a `Button` to
   a `div`). If a rule is wrong, stop, say which rule and why, and leave it as it is.

## Panels

1. **Every titled panel has a Close X, always.** It sits at the end of a `Toolbar` that is the
   first thing in the panel, with the title at its start. Cancel, Escape and a press outside
   don't replace it. Test: every titled Dialog and Sheet shows an X in its top row. In
   development, a titled Dialog or Sheet without one logs a warning. `Navigator` draws the row
   and the X for you.
2. **A band sits one step inside the content edge.** A panel's toolbar sits one step closer to
   the panel's edge than the content's padding, measured from the panel's own padding, so it
   moves with the panel's size. Applies to every band: dialogs, sheets, popovers, and Shell pane
   headers and footers. `Navigator` and the Shell panes do this for you.

## Flows: several screens in one panel

3. **The primary action is full width, on every screen of a flow, including the first.** Same
   place on every screen, at the bottom. Notes sit above it, never beside it.
4. **Back keeps what was entered, and a finished flow has no Back.** `Navigator` does this for
   you.

## Grouping and space

5. **Distance is relationship.** The gap inside a group is at least two steps smaller than the
   gap around it, compared along the same direction. A screen with one gap top to bottom has no
   structure. Usual steps: label to field 3, group to group 5, section to section 6.
6. **Space around a heading is asymmetric.** A heading sits closer to what follows it than to
   what comes before.
7. **Space groups first; a border only when space can't.** Never both a container and a rule
   around the same group. No card inside a card. (Lines and hover on one list: rule 19.)
8. **Every gap is a step on the scale.** No invented lengths (`13px`, `1.35rem`).

## Alignment

9. **One axis.** Everything aligns to the container's edge unless it has a reason. Values in
   label/value rows align on the baseline. In a list, sidebar or group, the group's label (or
   the band's title above it), every row's text or icon, and the separators start on one left
   edge. A selection or hover fill hangs outside that edge; it never pushes the text in.
10. **Nothing floats.** Every icon, arrow and badge belongs to a row or a control. An arrow next
   to a title with no job is a break.

## Type

11. **Rank text by at least two steps.** Page 8, section 7, card title 6, body 3, label and meta
    2.

## Words

12. **Every element has a one-word job** (label, value, action, meta). Cut anything without one.
13. **Say less.** Helper text carries a consequence, a scope or a limit, never a definition of
    the control. Option cards hold a name, a price or value, and one short line, no more. (Dots
    between facts: rule 18.)
14. **No eyebrows.** A title carries its own subject.
15. **An action says what it does**, as a verb and its object, and keeps its name through the
    flow (Publish, then Published).
16. **Real words.** No placeholder copy. A placeholder is not a label and holds no
    instructions. Errors say how to fix it.

## Choices

17. **Pick the smallest control that fits.** Two to five short options: `SegmentedControl`.
    More: `Select`. On or off at once: `Switch`, which never waits for Save. A radio needs at
    least two siblings.

## Lists and controls

18. **No dot between facts.** Never join two facts with `·` or `•` ("Friday · Flights at 9:40").
    Give each fact its own place, or cut one.
19. **Lines or hover, never both.** A list divided by separators doesn't light its rows on
    hover, and a list that lights its rows draws no lines between them.
20. **Every control has a name.** An icon-only button carries an `aria-label`, so a screen
    reader says what it does.

## Figures and examples

21. **Real screens from real products, built from real components.** No abstract glyphs. Any
    annotation lives in the caption, outside the composed surface. The figure itself passes
    every rule above. A window may bleed off a figure's band, but words are never cut off. The
    wrong half of a do/don't figure is the only half that may break a rule.
