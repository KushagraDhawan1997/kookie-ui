/**
 * The chapters, as data. One entry per chapter: this array is the navigation, the route table
 * and the homepage index, so a chapter is added by adding a row here and a file in `content/`.
 *
 * A chapter is listed only once it is written, so the navigation, the sitemap and the homepage
 * never point at an empty page.
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
      'Learn the principles and the words of the system. Then install it and set its theme.',
  },
  {
    id: 'foundations',
    title: 'Foundations',
    blurb:
      'These chapters cover colour, type, radius and depth. Every other decision in the system is built from them.',
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
      "These are the words the system uses for the kinds of component. Once you know a component's kind, you know which of its options your product should decide.",
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
      'A Theme sets the values that apply to your whole app, such as its appearance, accent colour, radius and fonts.',
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
    slug: 'foundations/radius',
    title: 'Radius',
    section: 'foundations',
    blurb: 'One setting controls how round the corners are across your app. Controls and surfaces each get corners that suit them.',
  },
  {
    slug: 'foundations/depth',
    title: 'Depth',
    section: 'foundations',
    blurb: 'Shadows show which surfaces sit above others. This chapter covers the shadow scale and when to use each step.',
  },
  {
    slug: 'foundations/constants',
    title: 'Constants',
    section: 'foundations',
    blurb: 'These are the fixed values behind transitions, effects, sizing and focus.',
  },
];

export const BY_SLUG: ReadonlyMap<string, Chapter> = new Map(CHAPTERS.map((chapter) => [chapter.slug, chapter]));

export function chaptersIn(section: SectionId): Chapter[] {
  return CHAPTERS.filter((chapter) => chapter.section === section);
}

export function sectionTitle(section: SectionId): string {
  return SECTIONS.find((s) => s.id === section)?.title ?? '';
}
