
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const LORE_FALLBACKS: Record<string, Record<number, string>> = {
  "Water Breathing": {
    1: "First Form: Water Surface Slash", 2: "Second Form: Water Wheel", 3: "Third Form: Flowing Dance",
    4: "Fourth Form: Striking Tide", 5: "Fifth Form: Blessed Rain After the Drought", 6: "Sixth Form: Whirlpool",
    7: "Seventh Form: Drop Ripple Thrust", 8: "Eighth Form: Waterfall Basin", 9: "Ninth Form: Splashing Water Flow",
    10: "Tenth Form: Constant Flux", 11: "Eleventh Form: Dead Calm"
  },
  "Flame Breathing": {
    1: "First Form: Unknowing Fire", 2: "Second Form: Rising Scorching Sun", 3: "Third Form: Blazing Universe",
    4: "Fourth Form: Blooming Flame Undulation", 5: "Fifth Form: Flame Tiger", 9: "Ninth Form: Rengoku"
  },
  "Thunder Breathing": {
    1: "First Form: Thunderclap and Flash", 2: "Second Form: Rice Spirit", 3: "Third Form: Thunder Swarm",
    4: "Fourth Form: Distant Thunder", 5: "Fifth Form: Heat Lightning", 6: "Sixth Form: Rumble and Flash",
    7: "Seventh Form: Honoikazuchi no Kami"
  },
  "Sun Breathing": {
    1: "Dance", 2: "Clear Blue Sky", 3: "Raging Sun", 4: "Fake Rainbow", 5: "Fire Wheel",
    6: "Burning Bones, Summer Sun", 7: "Sunflower Thrust", 8: "Solar Heat Haze", 9: "Setting Sun Transformation",
    10: "Beneficent Radiance", 11: "Dragon Sun Halo Head Dance", 12: "Flame Dance", 13: "Thirteenth Form"
  },
  "Moon Breathing": {
    1: "First Form: Dark Knight, Evening Palace", 2: "Second Form: Pearl Flower Moongazing",
    3: "Third Form: Loathsome Moon, Chains", 4: "Fourth Form: Lunar Phase", 5: "Fifth Form: Moon Spirit Calamitous Eddy",
    6: "Sixth Form: Perpetual Night, Lonely Moon - Incessant", 7: "Seventh Form: Mirror of Misfortune, Moonlit",
    8: "Eighth Form: Moon-Dragon Ringtail", 9: "Ninth Form: Waning Moonswath", 10: "Tenth Form: Drilling Slashes, Moon Through Bamboo Leaves",
    14: "Fourteenth Form: Catastrophe, Tenman Crescent Moon", 16: "Sixteenth Form: Moonbow, Half Moon"
  },
  "Beast Breathing": {
    1: "First Fang: Pierce", 2: "Second Fang: Slice", 3: "Third Fang: Devour", 4: "Fourth Fang: Mince",
    5: "Fifth Fang: Crazy Cutting", 6: "Sixth Fang: Palisade Bite", 7: "Seventh Fang: Spatial Awareness",
    8: "Eighth Fang: Explosive Rush", 9: "Ninth Fang: Extending Bendy Slash", 10: "Tenth Fang: Whirling Fangs"
  },
  "Mist Breathing": {
    1: "First Form: Low Clouds, Distant Haze", 2: "Second Form: Eight-Layered Mist", 3: "Third Form: Scattering Mist Blast",
    4: "Fourth Form: Shifting Flow Slash", 5: "Fifth Form: Sea of Cloud and Haze", 6: "Sixth Form: Moonlit Mist",
    7: "Seventh Form: Obscuring Clouds"
  },
  "Galaxy Breathing": {
    1: "First Form: Nebula Slash", 2: "Second Form: Starfall Cascade", 3: "Third Form: Black Hole Vortex",
    4: "Fourth Form: Supernova Burst", 5: "Fifth Form: Comet Tail Sweep", 6: "Sixth Form: Cosmic Dust Shield",
    7: "Seventh Form: Milky Way Dance", 8: "Eighth Form: Pulsar Beam", 9: "Ninth Form: Event Horizon Strike",
    10: "Tenth Form: Universal Stillness", 11: "Eleventh Form: Void Reaping", 12: "Twelfth Form: Galactic Sovereign"
  }
};

export async function generateDemonDetails(stage: number, isBoss: boolean) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a name and a short terrifying description for a ${isBoss ? 'Boss ' : ''}Demon encountered at stage ${stage} of a dark fantasy game.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "description"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      name: isBoss ? "Ancient Abyss Lord" : "Vile Shadow Stalker",
      description: "A creature born of pure malice and darkness."
    };
  }
}

export async function generateRollFlavor(itemName: string, rarity: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a 1-sentence epic flavor text for a ${rarity} item named '${itemName}' in a demon-slaying RPG.`,
    });
    return response.text;
  } catch (error) {
    return "A legendary artifact of immense power.";
  }
}

export async function getFormNames(style: string, count: number) {
  if (LORE_FALLBACKS[style]) {
    return LORE_FALLBACKS[style];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              number: { type: Type.NUMBER },
              name: { type: Type.STRING }
            },
            required: ["number", "name"]
          }
        }
      },
      contents: `List the official names for forms 1 through ${count} of "${style}" from Demon Slayer. If any forms are unknown or don't exist, invent a highly accurate and cool name in the same naming style. Return as a JSON array.`,
    });
    const parsed = JSON.parse(response.text);
    const cache: Record<number, string> = {};
    parsed.forEach((f: any) => { cache[f.number] = f.name; });
    return cache;
  } catch (error: any) {
    const genericCache: Record<number, string> = {};
    for (let i = 1; i <= count; i++) {
      genericCache[i] = `Form ${i}: ${style} Strike`;
    }
    return genericCache;
  }
}
