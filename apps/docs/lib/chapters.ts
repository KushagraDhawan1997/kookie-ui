/**
 * The chapters, as data. One entry per chapter: this array is the navigation, the route table
 * and the homepage index, so a chapter is added by adding a row here and a file in `content/`.
 *
 * The structure matches Kookie UI v2's docs on purpose (docs/LOG.md, 2026-09-19): the same
 * sections, the same chapters, in the same order. Only the content is written for v1.
 *
 * This file holds data only, no MDX imports, because the sidebar reads it on the client.
 * `chapter-content.ts` maps each slug to its compiled MDX.
 */

export type SectionId = 'start' | 'foundations' | 'patterns';

export type Section = {
  id: SectionId;
  title: string;
  /** What the section is for. Shown on the homepage. */
  blurb: string;
};

export type Chapter = {
  /** The URL and the key: `<section>/<name>`. */
  slug: string;
  title: string;
  section: SectionId;
  /** One sentence on what a reader gets from the chapter. Shown under its title. */
  blurb: string;
};

export const SECTIONS: readonly Section[] = [
  {
    id: 'start',
    title: 'Getting started',
    blurb:
      'Learn the principles and the words of the system. Then install it, set its theme and build your first screen.',
  },
  {
    id: 'foundations',
    title: 'Foundations',
    blurb:
      'These chapters cover colour, type, space, size, material, depth and motion. Every other decision in the system is built from them.',
  },
  {
    id: 'patterns',
    title: 'Patterns',
    blurb: 'Build the structures that repeat across an app, such as forms, dialogs, navigation and feedback.',
  },
];

export const CHAPTERS: readonly Chapter[] = [
  {
    slug: 'start/principles',
    title: 'Principles',
    section: 'start',
    blurb: 'These are the beliefs the system is built on. Every foundation, pattern and component follows from them.',
  },
  {
    slug: 'start/vocabulary',
    title: 'Vocabulary',
    section: 'start',
    blurb:
      "These are the words the system uses for the kinds of component. Once you know a component's kind, you know which props to expect.",
  },
  {
    slug: 'start/installation',
    title: 'Installation',
    section: 'start',
    blurb: 'Add the package to your app, import the stylesheet, and wrap your app in a Theme.',
  },
  {
    slug: 'start/theming',
    title: 'Theming',
    section: 'start',
    blurb:
      'A Theme sets the values that apply to your whole app, such as its appearance, accent colour, radius and scaling.',
  },
  {
    slug: 'start/quickstart',
    title: 'Quickstart',
    section: 'start',
    blurb: 'Build your first screen from an empty file, one component at a time.',
  },
  {
    slug: 'start/agents',
    title: 'AI agents',
    section: 'start',
    blurb: "Set up an AI agent so that the code it writes follows the system's rules.",
  },
  {
    slug: 'foundations/color',
    title: 'Colour',
    section: 'foundations',
    blurb:
      'Colour comes from 12-step scales that work in light and dark mode. The Theme sets the accent and the gray, and each step has a job.',
  },
  {
    slug: 'foundations/typography',
    title: 'Typography',
    section: 'foundations',
    blurb: 'Text and Heading share one type scale. This chapter covers its steps, its weights and its fonts.',
  },
  {
    slug: 'foundations/layout',
    title: 'Layout',
    section: 'foundations',
    blurb: 'Space comes from one spacing scale. This chapter covers how a container places what is inside it.',
  },
  {
    slug: 'foundations/size',
    title: 'Size',
    section: 'foundations',
    blurb: 'Components come in a set of sizes. This chapter covers what each step means and how sizes line up across components.',
  },
  {
    slug: 'foundations/radius',
    title: 'Radius',
    section: 'foundations',
    blurb: 'One setting controls how round the corners are across your app. Controls and surfaces each get corners that suit them.',
  },
  {
    slug: 'foundations/materials',
    title: 'Materials',
    section: 'foundations',
    blurb: 'A material decides whether a surface is solid or translucent. This chapter covers each material and where it fits.',
  },
  {
    slug: 'foundations/depth',
    title: 'Depth',
    section: 'foundations',
    blurb: 'Shadows show which surfaces sit above others. This chapter covers the shadow scale and when to use each step.',
  },
  {
    slug: 'foundations/motion',
    title: 'Motion',
    section: 'foundations',
    blurb: 'Motion covers how things move and change state, and how fast they do it.',
  },
  {
    slug: 'foundations/states',
    title: 'States',
    section: 'foundations',
    blurb: 'Every control has the same set of states, such as hover, pressed, focused and disabled. This chapter covers how each one looks.',
  },
  {
    slug: 'foundations/responsiveness',
    title: 'Responsiveness',
    section: 'foundations',
    blurb: 'This chapter covers what changes when the window or a container changes size, and what decides it.',
  },
  /* INTERIM. v2 has no Constants chapter. Its sections (transitions, effects, sizing, spacing,
     focus) belong in Motion, Size, Layout and States, and move there when those chapters are
     written. Until then it stays reachable here rather than disappearing. */
  {
    slug: 'foundations/constants',
    title: 'Constants',
    section: 'foundations',
    blurb: 'These are the fixed values behind transitions, effects, sizing and focus. They will move into the chapters they belong to.',
  },
  {
    slug: 'patterns/composition',
    title: 'Composition',
    section: 'patterns',
    blurb: 'Correct components do not add up to a good screen on their own. These are the rules for putting them together.',
  },
  {
    slug: 'patterns/forms',
    title: 'Forms',
    section: 'patterns',
    blurb: 'Build a form: its fields, their labels, how it shows errors and how it submits.',
  },
  {
    slug: 'patterns/modality',
    title: 'Modality',
    section: 'patterns',
    blurb: 'Choose between a dialog, a sheet, a popover and a menu, and learn when each one fits.',
  },
  {
    slug: 'patterns/navigation',
    title: 'Navigation',
    section: 'patterns',
    blurb: 'Build the frame of an app: its header, its sidebar and how they change with the size of the window.',
  },
  {
    slug: 'patterns/feedback',
    title: 'Feedback',
    section: 'patterns',
    blurb: 'Tell people what happened and what is happening, from a status message to a loading state.',
  },
];

export const BY_SLUG: ReadonlyMap<string, Chapter> = new Map(CHAPTERS.map((chapter) => [chapter.slug, chapter]));

export function chaptersIn(section: SectionId): Chapter[] {
  return CHAPTERS.filter((chapter) => chapter.section === section);
}

export function sectionTitle(section: SectionId): string {
  return SECTIONS.find((s) => s.id === section)?.title ?? '';
}
