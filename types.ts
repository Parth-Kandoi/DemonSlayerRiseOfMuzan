
export enum Rarity {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
  MYTHIC = 'Mythic',
  GODLY = 'Godly'
}

export interface Weapon {
  id: string;
  name: string;
  rarity: Rarity;
  damageMultiplier: number;
  description: string;
  style: 'Blade' | 'Spear' | 'Hammer' | 'Bow' | 'Dagger';
}

export interface Power {
  id: string;
  name: string;
  rarity: Rarity;
  effectValue: number;
  effectType: 'Crit' | 'Lifesteal' | 'AttackSpeed' | 'RawPower' | 'Shield';
  description: string;
  breathingStyle?: string;
  formsCount: number;
}

export interface Demon {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  isBoss: boolean;
  image: string;
  type: 'Normal' | 'Hashira' | 'LowerMoon' | 'UpperMoon' | 'Muzan';
  bloodDemonArt?: string;
}

export interface Upgrades {
  strength: number;
  speed: number;
  health: number;
  ability: number;
}

export interface PlayerStats {
  playerName: string;
  level: number;
  currentHp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  tokens: number;
  stage: number;
  maxReachedStage: number;
  weapons: Weapon[];
  powers: Power[];
  activeWeaponId: string | null;
  activePowerId: string | null;
  upgrades: Upgrades;
  resurrectedHashiras: string[];
  resurrectedFormerHashiras: string[];
  isGodMode?: boolean;
}
