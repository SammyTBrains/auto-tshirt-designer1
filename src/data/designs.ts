export interface DesignPreview {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
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
  },
  {
    id: 2,
    title: "Glitch Garden",
    description: "Floral collage spliced with vaporwave glitch fragments.",
    imageUrl:
      "https://images.unsplash.com/photo-1551360021-0ff81fe67c4d?auto=format&fit=crop&w=900&q=80",
    category: "Nature",
    tags: ["floral", "glitch", "retro"],
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
  },
  {
    id: 4,
    title: "Celestial Waves",
    description: "Cosmic tide forms rippling lines across a midnight tee.",
    imageUrl:
      "https://images.unsplash.com/photo-1529257335238-6a679cda0d13?auto=format&fit=crop&w=900&q=80",
    category: "Cosmic",
    tags: ["galaxy", "wave", "gradient"],
  },
  {
    id: 5,
    title: "Bio Loop",
    description:
      "Organic mycelium network twisted into an infinity loop motif.",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    category: "Nature",
    tags: ["organic", "loops", "biotech"],
  },
];

export const featuredDesigns = designs.filter((design) =>
  ["Aurora Bloom", "Neural Skyline", "Celestial Waves"].includes(design.title)
);

export default designs;
