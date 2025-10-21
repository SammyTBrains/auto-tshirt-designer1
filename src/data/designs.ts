export interface DesignPreview {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  prompt: string;
  releaseDate: string;
  popularity: number;
}

export const designs: DesignPreview[] = [
  {
    id: 1,
    title: "Aurora Bloom",
    description:
      "Vibrant aurora streaks wrapping around a minimalist bloom silhouette.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=900&q=80",
    category: "Abstract",
    tags: ["aurora", "neon", "minimal"],
    prompt:
      "macro shot of neon aurora petals spiralling around a single bloom, dark background, cinematic lighting, 8k",
    releaseDate: "2024-06-12",
    popularity: 94,
  },
  {
    id: 2,
    title: "Glitch Garden",
    description: "Floral collage spliced with vaporwave glitch fragments.",
    imageUrl:
      "https://images.unsplash.com/photo-1551360021-0ff81fe67c4d?auto=format&fit=crop&w=900&q=80",
    category: "Nature",
    tags: ["floral", "glitch", "retro"],
    prompt:
      "vaporwave flower collage with pixel sorting glitches, magenta and cyan palette, retro VHS grain",
    releaseDate: "2024-07-08",
    popularity: 88,
  },
  {
    id: 3,
    title: "Neural Skyline",
    description:
      "City horizon rendered in circuit traces and electric gradients.",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    category: "Urban",
    tags: ["city", "circuit", "cyberpunk"],
    prompt:
      "futuristic skyline composed of neural network circuitry, dusk lighting, teal and amber glow, high detail",
    releaseDate: "2024-04-19",
    popularity: 97,
  },
  {
    id: 4,
    title: "Celestial Waves",
    description: "Cosmic tide forms rippling lines across a midnight tee.",
    imageUrl:
      "https://images.unsplash.com/photo-1529257335238-6a679cda0d13?auto=format&fit=crop&w=900&q=80",
    category: "Cosmic",
    tags: ["galaxy", "wave", "gradient"],
    prompt:
      "cosmic ocean waves blending into a starfield, soft gradients, deep navy canvas, dreamy atmosphere",
    releaseDate: "2024-05-22",
    popularity: 90,
  },
  {
    id: 5,
    title: "Bio Loop",
    description:
      "Organic mycelium network twisted into an infinity loop motif.",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    category: "Nature",
    tags: ["organic", "loop", "biotech"],
    prompt:
      "mycelium strands forming an infinity loop, bioluminescent glow, macro photography, rich detail",
    releaseDate: "2024-03-28",
    popularity: 84,
  },
  {
    id: 6,
    title: "Chromatic Drift",
    description: "Prismatic trails sweep across a minimalist horizon.",
    imageUrl:
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=900&q=80",
    category: "Abstract",
    tags: ["prism", "minimal", "gradient"],
    prompt:
      "minimal horizon with drifting prismatic trails, soft focus, modern art poster aesthetic",
    releaseDate: "2024-08-15",
    popularity: 79,
  },
  {
    id: 7,
    title: "Synth Petals",
    description: "Petal geometry rendered with synthwave lighting.",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80&sat=-100",
    category: "Retro",
    tags: ["synthwave", "flora", "geometry"],
    prompt:
      "low poly petals under synthwave lighting, purple and neon pink palette, 3d render",
    releaseDate: "2024-02-10",
    popularity: 76,
  },
  {
    id: 8,
    title: "Vapor Trail",
    description: "A ribbon of color drifts through a stark negative space.",
    imageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    category: "Minimal",
    tags: ["minimal", "gradient", "motion"],
    prompt:
      "single ribbon of vapor trail across black background, 35mm photography, vibrant pastel spectrum",
    releaseDate: "2024-09-04",
    popularity: 82,
  },
  {
    id: 9,
    title: "Coral Circuit",
    description: "Underwater coral meets iridescent circuitry.",
    imageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    category: "Biotech",
    tags: ["coral", "circuit", "iridescent"],
    prompt:
      "iridescent coral reef fused with circuit board patterns, underwater lighting, hyperreal",
    releaseDate: "2024-01-18",
    popularity: 86,
  },
  {
    id: 10,
    title: "Quantum Bloom",
    description: "Blooming particles orbit a central quantum core.",
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    category: "Tech Art",
    tags: ["particles", "halo", "sci-fi"],
    prompt:
      "quantum core emitting blooming particles, dark background, cinematic rim lighting, volumetric glow",
    releaseDate: "2024-07-29",
    popularity: 92,
  },
  {
    id: 11,
    title: "Midnight Glyph",
    description: "Mystic glyphs float above a deep indigo fabric.",
    imageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80&sat=-70",
    category: "Surreal",
    tags: ["glyphs", "mystic", "indigo"],
    prompt:
      "floating mystic glyphs etched in light above indigo silk, surreal ambience, soft depth of field",
    releaseDate: "2024-05-01",
    popularity: 73,
  },
  {
    id: 12,
    title: "Lunar Bloom",
    description: "A moonlit bloom with subtle iridescence.",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80&sat=-50",
    category: "Cosmic",
    tags: ["moonlight", "flora", "iridescent"],
    prompt:
      "moonlit flower petals with iridescent edges, gentle bokeh, film grain texture",
    releaseDate: "2024-03-05",
    popularity: 81,
  },
  {
    id: 13,
    title: "Solar Bloom",
    description: "Sunburst petals rendered in radiant gradients.",
    imageUrl:
      "https://images.unsplash.com/photo-1520170350709-6d6ae6701e16?auto=format&fit=crop&w=900&q=80",
    category: "Nature",
    tags: ["sunburst", "petals", "radiant"],
    prompt:
      "sunburst petals fanning out from a glowing core, vibrant gradients, macro photography, high saturation",
    releaseDate: "2024-06-01",
    popularity: 85,
  },
  {
    id: 14,
    title: "Geo Flux",
    description: "Angular geometry dissolves into fluid ink strokes.",
    imageUrl:
      "https://images.unsplash.com/photo-1526481280695-3c4699d602eb?auto=format&fit=crop&w=900&q=80",
    category: "Abstract",
    tags: ["geometry", "ink", "contrast"],
    prompt:
      "sharp polygonal forms dissolving into fluid japanese ink strokes, monochrome with crimson accents",
    releaseDate: "2024-02-24",
    popularity: 78,
  },
  {
    id: 15,
    title: "Circuit Bloom",
    description: "Floral lattice composed of luminous circuitry.",
    imageUrl:
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=900&q=80",
    category: "Tech Art",
    tags: ["circuit", "flora", "luminous"],
    prompt:
      "flower petals constructed from luminous circuitry, glowing copper traces, futuristic botanical illustration",
    releaseDate: "2024-08-02",
    popularity: 91,
  },
  {
    id: 16,
    title: "Nebula Thread",
    description: "Stitched nebula strands weave across the chest.",
    imageUrl:
      "https://images.unsplash.com/photo-1526313199968-d78aa08d7188?auto=format&fit=crop&w=900&q=80",
    category: "Cosmic",
    tags: ["nebula", "thread", "stitch"],
    prompt:
      "embroidered threads forming a colorful nebula swirl, deep space backdrop, textile photography",
    releaseDate: "2024-05-30",
    popularity: 89,
  },
];

export const designCategories = Array.from(
  new Set(designs.map((design) => design.category))
).sort();

export const designTags = Array.from(
  new Set(designs.flatMap((design) => design.tags))
).sort((a, b) => a.localeCompare(b));

export const featuredDesigns = designs
  .filter((design) => design.popularity >= 90)
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 4);

export default designs;
