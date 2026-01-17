
import { Rarity, Weapon, Power } from './types';

export const RARITY_CHANCES = {
  [Rarity.COMMON]: 0.55,
  [Rarity.RARE]: 0.28,
  [Rarity.EPIC]: 0.12,
  [Rarity.LEGENDARY]: 0.04,
  [Rarity.MYTHIC]: 0.01,
};

export const WEAPON_ROLL_COST = 50;
export const POWER_ROLL_COST = 100;
export const BOSS_TOKEN_BONUS = 30;
export const NORMAL_TOKEN_REWARD = 10;
export const UPGRADE_BASE_COST = 5;
export const RESURRECTION_COST = 100;
export const FORMER_RESURRECTION_COST = 250;

export const HASHIRAS = [
  "Giyu Tomioka", "Shinobu Kocho", "Kyojuro Rengoku", "Tengen Uzui", 
  "Mitsuri Kanroji", "Muichiro Tokito", "Obanai Iguro", "Sanemi Shinazugawa", "Gyomei Himejima"
];

export const FORMER_HASHIRAS = [
  "Kanae Kocho", "Jigoro Kuwajima", "Sakonji Urokodaki", "Shinjuro Rengoku"
];

export const LOWER_MOONS = ["Enmu", "Rokuro", "Wakuraba", "Mukago", "Rui", "Kamanue"];
export const UPPER_MOONS = ["Kokushibo", "Doma", "Akaza", "Hantengu", "Gyokko", "Gyutaro & Daki"];
export const MUZAN = "Muzan Kibutsuji";

export const MUZAN_STAGE = 300;
export const mapStages = Array.from({ length: MUZAN_STAGE }, (_, i) => i + 1);

export const INITIAL_WEAPON: Weapon = {
  id: 'basic-01',
  name: 'Nichirin Sword (Water)',
  rarity: Rarity.COMMON,
  damageMultiplier: 1.0,
  description: 'A standard demon slayer blade.',
  style: 'Blade'
};

export const INITIAL_POWER: Power = {
  id: 'basic-p-01',
  name: 'Water Breathing',
  rarity: Rarity.COMMON,
  effectValue: 15,
  effectType: 'Shield',
  description: 'Master the flow of water.',
  formsCount: 11
};

export const BREATHING_STYLES = {
  [Rarity.MYTHIC]: [
    { name: 'Sun Breathing', forms: 13, type: 'RawPower' },
    { name: 'Moon Breathing', forms: 16, type: 'Crit' },
    { name: 'Star Breathing', forms: 10, type: 'RawPower' }
  ],
  [Rarity.LEGENDARY]: [
    { name: 'Stone Breathing', forms: 5, type: 'Shield' },
    { name: 'Flame Breathing', forms: 9, type: 'RawPower' },
    { name: 'Mist Breathing', forms: 7, type: 'Crit' },
    { name: 'Ice Breathing', forms: 8, type: 'Shield' }
  ],
  [Rarity.EPIC]: [
    { name: 'Thunder Breathing', forms: 7, type: 'AttackSpeed' },
    { name: 'Wind Breathing', forms: 9, type: 'Crit' },
    { name: 'Sound Breathing', forms: 5, type: 'AttackSpeed' },
    { name: 'Storm Breathing', forms: 8, type: 'RawPower' }
  ],
  [Rarity.RARE]: [
    { name: 'Love Breathing', forms: 6, type: 'Lifesteal' },
    { name: 'Serpent Breathing', forms: 5, type: 'Crit' },
    { name: 'Beast Breathing', forms: 10, type: 'RawPower' },
    { name: 'Flower Breathing', forms: 7, type: 'Lifesteal' },
    { name: 'Insect Breathing', forms: 4, type: 'AttackSpeed' }
  ],
  [Rarity.COMMON]: [
    { name: 'Water Breathing', forms: 11, type: 'Shield' },
    { name: 'Leaf Breathing', forms: 5, type: 'Shield' },
    { name: 'Sand Breathing', forms: 6, type: 'RawPower' }
  ]
};

export const WEAPON_NAMES = {
  Blade: ['Katana', 'Longsword', 'Odachi', 'Nodachi', 'Executioner Blade'],
  Spear: ['Trident', 'Yari', 'Naginata', 'Soul Piercer'],
  Hammer: ['Kanabo', 'Warhammer', 'Sledge', 'Meteor Hammer'],
  Bow: ['Yumi', 'Crossbow', 'Greatbow', 'Spirit Bow'],
  Dagger: ['Tanto', 'Kunai', 'Wakizashi', 'Hidden Fang'],
};
