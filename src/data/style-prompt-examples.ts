export type StylePromptExample = {
  id: string;
  title: string;
  image: string;
  alt: string;
  prompt: string;
  themeId: string;
  tips: string[];
};

// Existing covers were visually checked against these scene descriptions.
// These are reusable scene prompts, not fresh generation results or a promise
// of identical output. Subject wording follows the user's selected roster.
export const STYLE_PROMPT_EXAMPLES: Record<string, StylePromptExample[]> = {
  "superhero-family-photos": [
    {
      id: "superhero-rooftop-lineup",
      title: "Golden-hour rooftop heroes",
      image: "/samples/theme-superhero.jpg",
      alt: "Two adults and two children in red and blue superhero costumes posing with a small dog on a sunlit city rooftop",
      // Adapted from the theme-superhero job in generate-landing-samples.mjs:
      // the unconditional small-dog sentence becomes conditional on selection.
      prompt:
        "Create a cinematic superhero family portrait using the selected people and pets on a city rooftop at golden hour. Coordinated distinct hero costumes, billowing capes, confident heroic poses, a sweeping skyline, and dramatic lens flare. If a pet is selected, give it a matching tiny cape. Keep every selected face visible. No text.",
      themeId: "superhero-family",
      tips: [
        "Use a standing lineup with shorter family members toward the front so the skyline and capes do not hide anyone.",
        "Ask for uncovered faces if masks make someone harder to recognize.",
        "Keep the pet instruction only when you have selected a pet; the rooftop scene also works with people alone.",
      ],
    },
  ],
  "ghibli-family-photos": [
    {
      id: "ghibli-countryside-meadow",
      title: "A breezy countryside afternoon",
      image: "/samples/theme-ghibli-countryside.jpg",
      alt: "Hand-drawn family of four and a dog in a green hillside meadow beneath a broad blue sky and soft white clouds",
      // Adapted from the theme-ghibli-countryside job in
      // generate-landing-samples.mjs, with selected-roster wording added.
      prompt:
        "Create a Studio Ghibli style hand-drawn illustration of the selected people and pets in a rolling green countryside meadow under a wide watercolor sky. Wind through tall grass, softly painted cumulus clouds, Hayao Miyazaki aesthetic, and gentle cel shading. Keep the group together with each face visible, warm clothing colors, and a quiet afternoon feeling. No text.",
      themeId: "ghibli-countryside",
      tips: [
        "Keep the meadow, soft clouds, and warm afternoon light as the main scene details; a simple setting leaves room for the family.",
        "Choose clear reference photos that show hair, face shape, and usual accessories, which can help guide a simplified illustrated likeness.",
        "For a closer portrait, ask for waist-up framing and less sky; for the pictured landscape feeling, keep the group on a grassy rise.",
      ],
    },
  ],
  "minecraft-family-photos": [
    {
      id: "minecraft-family-build",
      title: "Build a block-world home together",
      image: "/samples/theme-minecraft.jpg",
      alt: "Five smiling voxel family characters building a small wooden block house with a blocky dog, cubic trees, and a blue sky",
      // No original generation job for this cover was found. This suggested
      // prompt describes the inspected asset and draws on the minecraft theme
      // and its house-front variation; it is not the asset's recorded prompt.
      prompt:
        "Create a Minecraft-inspired voxel family portrait using the selected people and pets, building a small wooden block house together on a grassy hillside. Give the people square heads, blocky limbs, readable hairstyles, and distinct clothing colors. Show blocks held in their hands, a partly built warm wooden house, cubic trees, white block clouds, and a bright blue sky. If a pet is selected, place it beside the builders in the same blocky style. Cheerful expressions, warm daylight, no text.",
      themeId: "minecraft",
      tips: [
        "Describe one shared activity, such as building a house, so the blocks and tools have a clear role in the scene.",
        "Use distinct hairstyles and clothing colors to help tell family members apart when faces become square and simplified.",
        "Expect a stylized likeness: asking for realistic skin and facial detail works against a consistent block-world look.",
      ],
    },
  ],
};
