export type ArtStyle = {
  slug: string;
  name: string;
  keyword: string;
  secondaryKeywords: string[];
  image: string;
  shortDescription: string;
  related: string[];
};

export const STYLES: readonly ArtStyle[] = [
  {
    slug: 'watercolor-family-portraits',
    name: 'Watercolor',
    keyword: 'watercolor family portrait',
    secondaryKeywords: ['watercolor family painting', 'custom watercolor family portrait', 'ai watercolor family photo'],
    image: '/samples/card-art-styles/watercolor.jpg',
    shortDescription: 'Soft washes and paper texture. Your family painted as if by hand.',
    related: ['oil-painting-family-portraits', 'colored-pencil-family-portraits', 'storybook-family-portraits'],
  },
  {
    slug: 'oil-painting-family-portraits',
    name: 'Oil Painting',
    keyword: 'oil painting family portrait',
    secondaryKeywords: ['custom oil painting family portrait', 'family oil painting from photo', 'classical family painting'],
    image: '/samples/card-art-styles/oil-painting.jpg',
    shortDescription: 'Visible brushwork, deep color, your family painted like an old-master commission.',
    related: ['watercolor-family-portraits', 'storybook-family-portraits', 'colored-pencil-family-portraits'],
  },
  {
    slug: 'colored-pencil-family-portraits',
    name: 'Colored Pencil',
    keyword: 'colored pencil family portrait',
    secondaryKeywords: ['family colored pencil drawing', 'pencil family portrait from photo'],
    image: '/samples/card-art-styles/colored-pencil.jpg',
    shortDescription: 'Fine strokes, gentle color, the kind of drawing you keep on the fridge for years.',
    related: ['watercolor-family-portraits', 'storybook-family-portraits', 'oil-painting-family-portraits'],
  },
  {
    slug: 'storybook-family-portraits',
    name: 'Storybook',
    keyword: 'storybook family portrait',
    secondaryKeywords: ['family storybook illustration', 'childrens book style family portrait', 'illustrated family portrait'],
    image: '/samples/card-art-styles/storybook.jpg',
    shortDescription: 'Hand-drawn warmth, picture-book color. Your family as the heroes of a story.',
    related: ['watercolor-family-portraits', 'colored-pencil-family-portraits', 'clay-3d-family-portraits'],
  },
  {
    slug: 'clay-3d-family-portraits',
    name: 'Clay 3D',
    keyword: 'clay 3d family portrait',
    secondaryKeywords: ['3d clay family portrait', 'claymation family portrait', 'cute 3d family illustration'],
    image: '/samples/card-art-styles/clay-3d.jpg',
    shortDescription: 'Soft sculpted figures, big smiles, the family as a tiny clay diorama.',
    related: ['storybook-family-portraits', 'oil-painting-family-portraits', 'photoshoot-family-portraits'],
  },
  {
    slug: 'photoshoot-family-portraits',
    name: 'Photoshoot',
    keyword: 'family photoshoot portrait',
    secondaryKeywords: ['ai family photoshoot', 'studio family portrait', 'family photography style portrait'],
    image: '/samples/card-art-styles/photoshoot.jpg',
    shortDescription: 'Studio-lit, sharp, magazine-grade. Your family with a photographer-quality finish.',
    related: ['oil-painting-family-portraits', 'clay-3d-family-portraits', 'storybook-family-portraits'],
  },
] as const;

export const styleBySlug = (slug: string) => STYLES.find(s => s.slug === slug);
