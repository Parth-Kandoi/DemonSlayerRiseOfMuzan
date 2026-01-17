
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Rarity, Weapon, Power, Demon, PlayerStats, Upgrades } from './types';
import { 
  INITIAL_WEAPON, RARITY_CHANCES, WEAPON_ROLL_COST, POWER_ROLL_COST, 
  WEAPON_NAMES, NORMAL_TOKEN_REWARD, BOSS_TOKEN_BONUS, 
  UPGRADE_BASE_COST, HASHIRAS, 
  LOWER_MOONS, UPPER_MOONS, MUZAN, MUZAN_STAGE, BREATHING_STYLES,
  mapStages, INITIAL_POWER
} from './constants';
import { getFormNames } from './services/gemini';

const SAVE_KEY = 'nichirin_soul_v1_save';
const HIRE_COST = 50000;

const RarityBadge: React.FC<{ rarity: Rarity }> = ({ rarity }) => {
  const colorMap = {
    [Rarity.COMMON]: 'bg-gray-500', 
    [Rarity.RARE]: 'bg-blue-600', 
    [Rarity.EPIC]: 'bg-purple-600', 
    [Rarity.LEGENDARY]: 'bg-yellow-600', 
    [Rarity.MYTHIC]: 'bg-red-600',
    [Rarity.GODLY]: 'bg-white text-black ring-4 ring-yellow-400',
  };
  return <span className={`${colorMap[rarity]} text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm`}>{rarity}</span>;
};

const VictoryCutscene: React.FC<{ playerName: string, onFinish: () => void }> = ({ playerName, onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 25000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[1000] star-wars-container bg-black">
      <div className="star-wars-crawl">
        <div className="star-wars-content">
          <p className="text-4xl mb-12">Episode Final: The End of Darkness</p>
          <h1 className="text-8xl mb-24">VICTORY</h1>
          <p className="text-2xl mb-12 leading-loose">
            In the ultimate battle of fate, the Demon King Muzan Kibutsuji has finally been laid to rest. 
            The age of terror that lasted a millennium has come to an end.
          </p>
          <p className="text-2xl mb-12 leading-loose">
            Through sheer will and indomitable spirit, the brave slayer known as {playerName} led the charge. 
            With the combined strength of the Nine Hashiras, the unbreakable sun has dawned upon the world once more.
          </p>
          <p className="text-2xl mb-12 leading-loose">
            Now, all Demon Slayers and humans live in peaceful and normal lives. 
            The Nichirin blades are sheathed forever, and the breathing styles are now only stories whispered to children at night.
          </p>
          <p className="text-2xl mb-12 leading-loose">
            The world is at peace. The nightmare is over.
          </p>
        </div>
      </div>
      <button onClick={onFinish} className="absolute bottom-8 right-8 z-[1100] px-8 py-3 bg-white/10 text-white font-black rounded-full hover:bg-white/20 transition-all border border-white/20">SKIP</button>
    </div>
  );
};

const TeaserScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-white text-4xl md:text-6xl font-black tracking-widest leading-tight uppercase animate-pulse">
        DEMON SLAYER: RISE OF DEMON KING LUFFY.... COMING SOON!
      </h2>
      <button onClick={onFinish} className="mt-20 px-12 py-4 border-2 border-white text-white font-black hover:bg-white hover:text-black transition-all">RETURN TO MENU</button>
    </div>
  );
};

const FORM_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'q', 'r', 't', 'y', 'u', 'i', 'o'];
const ENERGY_REGEN_RATE = 1.5; 
const FORM_ENERGY_COST = 10;
const TRAINING_REWARD = 1000;
const MAX_MANUAL_TRAINING = 999;

const getHashiraColor = (name: string): string => {
  if (name.includes('Tomioka')) return '#2563eb';
  if (name.includes('Shinobu')) return '#9333ea';
  if (name.includes('Rengoku')) return '#ef4444';
  if (name.includes('Tengen')) return '#cbd5e1';
  if (name.includes('Kanroji')) return '#f472b6';
  if (name.includes('Tokito')) return '#14b8a6';
  if (name.includes('Iguro')) return '#1e293b';
  if (name.includes('Shinazugawa')) return '#166534';
  if (name.includes('Gyomei')) return '#78350f';
  return '#ffffff';
};

const BLOOD_DEMON_ARTS = [
  "Blood Mist", "Shattering Scream", "Web of Death", "Frozen Void", 
  "Exploding Curse", "Shadow Thorns", "Spatial Tear", "Soul Devourer"
];

const getCorpsRank = (stage: number, isGodMode?: boolean) => {
  if (isGodMode) return { name: 'HEAD OF ELITE HASHIRAS', kanji: '皇' };
  if (stage >= 300) return { name: 'HASHIRA', kanji: '柱' };
  if (stage >= 250) return { name: 'KINOE', kanji: '甲' };
  if (stage >= 200) return { name: 'KINOTO', kanji: '乙' };
  if (stage >= 150) return { name: 'HINOTO', kanji: '丁' };
  if (stage >= 100) return { name: 'TUCHINOTO', kanji: '己' };
  if (stage >= 50) return { name: 'KANOTO', kanji: '辛' };
  return { name: 'MIZUNOTO', kanji: '癸' };
};

const getRandomRarity = (): Rarity => {
  const rand = Math.random();
  let cumulative = 0;
  const rarities = [Rarity.COMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC];
  for (const rarity of rarities) {
    cumulative += RARITY_CHANCES[rarity];
    if (rand <= cumulative) return rarity;
  }
  return Rarity.COMMON;
};

const cleanFormName = (name: string) => {
  if (!name) return "";
  return name.replace(/\d+/g, '').replace(/Form:?/i, '').trim();
};

const BackgroundEffects: React.FC<{ styleName: string }> = ({ styleName }) => {
  const name = styleName.toLowerCase();
  if (name.includes('water')) return <div className="bg-layer"><div className="absolute inset-0 bg-blue-900/20"></div><div className="absolute bottom-0 w-[400%] h-[90vh] bg-gradient-to-t from-cyan-400/50 via-blue-500/30 to-transparent blur-[80px] animate-water"></div></div>;
  if (name.includes('flame') || name.includes('sun')) return <div className="bg-layer"><div className="absolute inset-0 bg-red-950/25"></div>{Array.from({ length: 30 }).map((_, i) => (<div key={i} className="particle-flame" style={{ left: `${Math.random() * 100}%`, bottom: '-50px', width: `${Math.random() * 60 + 20}px`, height: `${Math.random() * 60 + 20}px`, animationDelay: `${Math.random() * 2}s` }}></div>))}</div>;
  if (name.includes('galaxy')) return <div className="bg-layer"><div className="absolute inset-0 bg-purple-950/30"></div>{Array.from({ length: 60 }).map((_, i) => (<div key={i} className="absolute rounded-full bg-white animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: '2px', height: '2px', animationDuration: `${Math.random() * 3 + 1}s` }}></div>))}</div>;
  return <div className="bg-layer bg-black/40"></div>;
};

const INITIAL_PLAYER_STATS: PlayerStats = {
  playerName: '',
  level: 1, currentHp: 800, maxHp: 800, energy: 100, maxEnergy: 100, tokens: 200, stage: 1, maxReachedStage: 1,
  weapons: [INITIAL_WEAPON], 
  powers: [INITIAL_POWER],
  activeWeaponId: INITIAL_WEAPON.id,
  activePowerId: INITIAL_POWER.id,
  upgrades: { strength: 0, speed: 0, health: 0, ability: 0 },
  resurrectedHashiras: [],
  resurrectedFormerHashiras: [],
  isGodMode: false,
};

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);

  const [nameInput, setNameInput] = useState('');
  const [currentDemon, setCurrentDemon] = useState<Demon | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showRollResult, setShowRollResult] = useState<Weapon | Power | null>(null);
  const [view, setView] = useState<'battle' | 'inventory' | 'shop' | 'map' | 'training' | 'naming' | 'victory' | 'teaser'>('naming');
  const [isFighting, setIsFighting] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [formCooldowns, setFormCooldowns] = useState<Record<number, number>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [showCheatPad, setShowCheatPad] = useState(false);
  const [cheatInput, setCheatInput] = useState("");
  const [demonWarning, setDemonWarning] = useState(false);
  const [isDodging, setIsDodging] = useState(false);
  const [activeFormLabel, setActiveFormLabel] = useState<string | null>(null);
  const [playerX, setPlayerX] = useState(100);
  const [playerY, setPlayerY] = useState(0);
  const [demonX, setDemonX] = useState(600);
  const [vfx, setVfx] = useState<{ x: number, y: number, type: string, id: number, text?: string }[]>([]);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  
  const pXRef = useRef(100);
  const pYRef = useRef(0);
  const pVelYRef = useRef(0);
  const dXRef = useRef(600);
  const isDodgingRef = useRef(false);
  const keysPressed = useRef<Set<string>>(new Set());
  const vfxIdCounter = useRef(0);
  const requestRef = useRef<number>(null);
  const formNamesCache = useRef<Record<string, Record<number, string>>>({});
  const lastDemonArtTime = useRef<number>(0);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.playerName) { 
          setStats(parsed); 
          setView('map'); 
        }
      } catch (e) { 
        console.error("Save load error", e); 
      }
    }
  }, []);

  useEffect(() => { 
    if (stats.playerName) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stats)); 
    }
  }, [stats]);

  const activeWeapon = useMemo(() => stats.weapons.find(w => w.id === stats.activeWeaponId) || INITIAL_WEAPON, [stats.weapons, stats.activeWeaponId]);
  const activePower = useMemo(() => stats.powers.find(p => p.id === stats.activePowerId) || INITIAL_POWER, [stats.powers, stats.activePowerId]);
  const currentRank = useMemo(() => getCorpsRank(stats.maxReachedStage, stats.isGodMode), [stats.maxReachedStage, stats.isGodMode]);

  const hashiraMultiplier = useMemo(() => {
    const count = stats.resurrectedHashiras.length;
    let multiplier = 1 + (count * 4.0); 
    if (count === 9) multiplier *= 80; 
    return multiplier;
  }, [stats.resurrectedHashiras]);

  const getStageMultiplier = (s: number) => {
    if (s <= 1) return 1;
    if (s < 50) return Math.pow(1.06, s - 1);
    return Math.pow(1.06, 49) * Math.pow(1.02, s - 50);
  };

  const addVfx = (x: number, y: number, type: string, text?: string) => {
    const id = vfxIdCounter.current++;
    setVfx(prev => [...prev.slice(-10), { x, y, type, id, text }]);
    setTimeout(() => setVfx(prev => prev.filter(v => v.id !== id)), 600);
  };

  const spawnDemon = useCallback(async (stageNum: number, training: boolean = false) => {
    const flowPrefixes = ["Flowing Water", "Flowing Fire", "Flowing Wind", "Flowing Fog", "Falling Stone"];
    let name = training ? "Corps Training Spirit" : `${flowPrefixes[stageNum % flowPrefixes.length]} Demon`;
    let type: Demon['type'] = 'Normal';
    let isBoss = false;
    
    if (!training) {
      if (stageNum === MUZAN_STAGE) { name = MUZAN; type = 'Muzan'; isBoss = true; }
      else if (stageNum % 10 === 0) {
        isBoss = true;
        const bossIndex = Math.floor(stageNum / 10) - 1;
        if (bossIndex < HASHIRAS.length) { name = HASHIRAS[bossIndex]; type = 'Hashira'; }
        else if (bossIndex < HASHIRAS.length + LOWER_MOONS.length) { name = LOWER_MOONS[bossIndex - HASHIRAS.length]; type = 'LowerMoon'; }
        else { name = UPPER_MOONS[(bossIndex - HASHIRAS.length - LOWER_MOONS.length) % UPPER_MOONS.length]; type = 'UpperMoon'; }
      }
    }
    const stageMultiplier = getStageMultiplier(stageNum);
    const hp = training ? 8000 : Math.max(10, Math.floor(800 * (isBoss ? 15 : 1) * stageMultiplier));
    const atk = training ? 5 : Math.max(1, Math.floor(15.0 * (isBoss ? 3 : 1) * stageMultiplier));
    const bloodArt = BLOOD_DEMON_ARTS[Math.floor(Math.random() * BLOOD_DEMON_ARTS.length)];
    dXRef.current = 650;
    setDemonX(650);
    setDemonWarning(false);
    lastDemonArtTime.current = Date.now();
    setCurrentDemon({ name, hp, maxHp: hp, isBoss, type, attack: atk, bloodDemonArt: bloodArt, image: `https://picsum.photos/seed/demon-${stageNum}-${name}/400/300` });
    setBattleLog([`${name} has emerged.`]);
  }, []);

  const handleVictory = () => {
    const isMuzanDefeated = currentDemon?.type === 'Muzan';
    const reward = view === 'training' ? TRAINING_REWARD : (currentDemon?.isBoss ? BOSS_TOKEN_BONUS : NORMAL_TOKEN_REWARD);
    setStats(prev => ({
      ...prev,
      tokens: prev.tokens + reward,
      maxReachedStage: prev.stage === prev.maxReachedStage && prev.stage < MUZAN_STAGE ? prev.maxReachedStage + 1 : prev.maxReachedStage,
      currentHp: Math.min(prev.maxHp, prev.currentHp + 800),
      energy: prev.maxEnergy
    }));
    addVfx(pXRef.current, 100, '🌟', `+${reward}`);
    setIsFighting(false);
    setTimeout(() => { if (isMuzanDefeated) setView('victory'); else setView('map'); }, 800);
  };

  const handleAttack = useCallback((type: 'normal' | 'form', formIdx?: number) => {
    if (!currentDemon || stats.currentHp <= 0 || !isFighting) return;
    const dist = Math.abs(pXRef.current - dXRef.current);
    if (dist > 250) return; 

    let damageReduction = 1.0;
    if (currentDemon.type === 'Muzan' && stats.resurrectedHashiras.length < 9) {
      damageReduction = 0; 
      setBattleLog(prev => ["MUZAN REGENERATES! ALL 9 HASHIRAS REQUIRED!", ...prev].slice(0, 10));
    }

    if (type === 'form') {
      if (stats.energy < FORM_ENERGY_COST) { addVfx(pXRef.current, 120, '⚡', 'EMPTY'); return; }
      if (formCooldowns[formIdx || 0] > 0) { addVfx(pXRef.current, 120, '⌛', 'WAIT'); return; }
    }
    
    let damage = 0;
    if (type === 'form' && activePower) {
      const fNum = formIdx || 1;
      if (!formNamesCache.current[activePower.name]) {
         getFormNames(activePower.name, activePower.formsCount).then(res => {
           formNamesCache.current[activePower.name] = res;
         });
      }
      const fLoreName = formNamesCache.current[activePower.name]?.[fNum] || `Form ${fNum}`;
      setActiveFormLabel(cleanFormName(fLoreName));
      setTimeout(() => setActiveFormLabel(null), 1000);
      damage = Math.floor(450 * activeWeapon.damageMultiplier * (1 + (fNum * 0.4)) * (1 + (stats.upgrades.ability * 0.8)) * hashiraMultiplier * damageReduction);
      setStats(prev => ({ ...prev, energy: Math.max(0, prev.energy - FORM_ENERGY_COST) }));
      setFormCooldowns(prev => ({ ...prev, [fNum]: 1200 + (fNum * 150) }));
    } else {
      damage = Math.floor(180 * activeWeapon.damageMultiplier * (1 + (stats.upgrades.strength * 0.6)) * hashiraMultiplier * damageReduction);
    }
    
    if (damageReduction > 0) damage = Math.max(1, damage);
    setCurrentDemon(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - damage) } : null);
    addVfx(dXRef.current, 100, '💥', damage === 0 ? "INVULNERABLE" : `-${damage}`);
    if (currentDemon.hp - damage <= 0 && damage > 0) handleVictory();
  }, [currentDemon, stats.currentHp, stats.energy, isFighting, activePower, activeWeapon, stats.upgrades, formCooldowns, hashiraMultiplier, stats.resurrectedHashiras.length]);

  const update = useCallback(() => {
    if (!isFighting || !currentDemon) return;
    const baseMoveSpeed = 5.5 + (stats.upgrades.speed * 0.4);
    let moveDir = 0;
    if (keysPressed.current.has('a')) moveDir -= 1;
    if (keysPressed.current.has('d')) moveDir += 1;
    pXRef.current = Math.max(0, Math.min(800, pXRef.current + moveDir * baseMoveSpeed));
    pYRef.current += pVelYRef.current;
    if (pYRef.current <= 0) { pYRef.current = 0; pVelYRef.current = 0; }
    else pVelYRef.current -= 1.8;
    const diff = pXRef.current - dXRef.current;
    const demonSpeed = (1.8 + (stats.stage * 0.04));
    if (Math.abs(diff) > 85) dXRef.current += Math.sign(diff) * demonSpeed;

    const now = Date.now();
    if (now - lastDemonArtTime.current > 4000 && !demonWarning) {
      lastDemonArtTime.current = now;
      setBattleLog(prev => [`${currentDemon.name} uses ${currentDemon.bloodDemonArt}!`, ...prev].slice(0, 10));
      addVfx(dXRef.current, 150, '🩸', currentDemon.bloodDemonArt);
      setDemonWarning(true);
      setTimeout(() => { 
        setStats(p => ({ ...p, currentHp: Math.max(0, p.currentHp - (currentDemon.attack * 0.5)) })); 
        setDemonWarning(false); 
      }, 500);
    }

    if (Math.abs(diff) < 250 && !demonWarning && Math.random() < 0.045) {
        setDemonWarning(true);
        setTimeout(() => {
            if (isFighting && !isDodgingRef.current && Math.abs(pXRef.current - dXRef.current) < 190) {
              setStats(prev => {
                let actualAttack = currentDemon.attack;
                if (currentDemon.type === 'Muzan') actualAttack = prev.maxHp / (prev.resurrectedHashiras.length + 1);
                const newHp = Math.max(0, prev.currentHp - actualAttack);
                if (newHp <= 0) { setIsFighting(false); setShowRetry(true); }
                return { ...prev, currentHp: newHp };
              });
            }
            setDemonWarning(false);
        }, 650);
    }
    setStats(prev => ({ ...prev, energy: Math.min(prev.maxEnergy, prev.energy + ENERGY_REGEN_RATE), currentHp: prev.currentHp }));
    setPlayerX(pXRef.current); setPlayerY(pYRef.current); setDemonX(dXRef.current);
    requestRef.current = requestAnimationFrame(update);
  }, [isFighting, currentDemon, stats.stage, stats.upgrades, demonWarning]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent, down: boolean) => {
      const key = e.key.toLowerCase();
      if (down) keysPressed.current.add(key); else keysPressed.current.delete(key);
      if (!isFighting) return;
      if (down) {
        if (key === 'w' && pYRef.current === 0) pVelYRef.current = 32;
        if (key === 'e') handleAttack('normal');
        if (key === ' ' && !isDodgingRef.current) { setIsDodging(true); isDodgingRef.current = true; setTimeout(() => { setIsDodging(false); isDodgingRef.current = false; }, 400); }
        const keyIdx = FORM_KEYS.indexOf(key);
        if (keyIdx !== -1 && activePower && keyIdx < activePower.formsCount) handleAttack('form', keyIdx + 1);
      }
    };
    window.onkeydown = (e) => handleKey(e, true);
    window.onkeyup = (e) => handleKey(e, false);
  }, [isFighting, activePower, handleAttack]);

  const hireHashira = (name: string) => {
    if (stats.tokens < HIRE_COST || stats.resurrectedHashiras.includes(name)) return;
    setStats(prev => ({
      ...prev,
      tokens: prev.tokens - HIRE_COST,
      resurrectedHashiras: [...prev.resurrectedHashiras, name]
    }));
    addVfx(400, 300, '🎖️', `RECRUITED: ${name}`);
  };

  const handleRollInitiate = (type: 'weapon' | 'power') => {
    const cost = type === 'weapon' ? WEAPON_ROLL_COST : POWER_ROLL_COST;
    if (stats.tokens < cost) return;
    const rarity = getRandomRarity();
    let newItem: Weapon | Power;
    if (type === 'weapon') {
      const styles: Array<'Blade' | 'Spear' | 'Hammer' | 'Bow' | 'Dagger'> = ['Blade', 'Spear', 'Hammer', 'Bow', 'Dagger'];
      const style = styles[Math.floor(Math.random() * styles.length)];
      const name = WEAPON_NAMES[style][Math.floor(Math.random() * WEAPON_NAMES[style].length)];
      const multipliers = { [Rarity.COMMON]: 1.2, [Rarity.RARE]: 1.8, [Rarity.EPIC]: 2.5, [Rarity.LEGENDARY]: 4.0, [Rarity.MYTHIC]: 8.0, [Rarity.GODLY]: 1000.0 };
      newItem = { id: `w-${Date.now()}`, name: `${rarity} ${name}`, rarity, damageMultiplier: (multipliers as any)[rarity] || 1.0, description: `A ${rarity} grade ${style}.`, style };
      setStats(prev => ({ ...prev, tokens: prev.tokens - cost, weapons: [...prev.weapons, newItem as Weapon] }));
    } else {
      const pool = (BREATHING_STYLES as any)[rarity];
      const style = pool[Math.floor(Math.random() * pool.length)];
      const effectValues = { [Rarity.COMMON]: 15, [Rarity.RARE]: 30, [Rarity.EPIC]: 50, [Rarity.LEGENDARY]: 100, [Rarity.MYTHIC]: 250, [Rarity.GODLY]: 1000 };
      newItem = { id: `p-${Date.now()}`, name: style.name, rarity, effectValue: (effectValues as any)[rarity] || 10, effectType: style.type as any, description: `Master the ${style.name}.`, formsCount: style.forms };
      setStats(prev => ({ ...prev, tokens: prev.tokens - cost, powers: [...prev.powers, newItem as Power] }));
    }
    setShowRollResult(newItem);
  };

  const startFight = (s: number, t: boolean = false) => {
    setStats(p => ({ ...p, currentHp: p.maxHp, energy: p.maxEnergy, stage: t ? p.stage : s }));
    spawnDemon(s, t);
    setIsFighting(true); setShowRetry(false); setView(t ? 'training' : 'battle');
  };

  const executeWipe = () => {
    localStorage.removeItem(SAVE_KEY);
    setStats(INITIAL_PLAYER_STATS);
    window.location.reload();
  };

  const handleCheatDigit = (digit: string) => {
    const newCode = (cheatInput + digit).slice(-7);
    setCheatInput(newCode);
    if (newCode === "1985200") {
        const gb: Power = { id: 'gb-god', name: 'Galaxy Breathing', rarity: Rarity.GODLY, effectType: 'AttackSpeed', effectValue: 100, description: "Celestial power.", formsCount: 12 };
        const ic: Weapon = { id: 'ic-god', name: 'Mythical Elite Indian Chappal', rarity: Rarity.GODLY, damageMultiplier: 1000.0, description: "Infinite Reset.", style: 'Hammer' };
        setStats(p => ({ ...p, playerName: p.playerName || 'ELITE MASTER', tokens: 9999999, weapons: [...p.weapons, ic], powers: [...p.powers, gb], activeWeaponId: ic.id, activePowerId: gb.id, upgrades: { strength: 9999, speed: 9999, health: 9999, ability: 9999 }, maxHp: 10000000, currentHp: 10000000, maxEnergy: 10000, energy: 10000, maxReachedStage: 300, isGodMode: true }));
        setCheatInput(""); setShowCheatPad(false);
    }
  };

  if (view === 'teaser') return <TeaserScreen onFinish={() => setView('map')} />;
  if (view === 'victory') return <VictoryCutscene playerName={stats.playerName} onFinish={() => setView('teaser')} />;

  if (view === 'naming') {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 bg-demon-gradient">
        <div className="max-w-xs w-full p-6 bg-black/80 rounded-[30px] border-2 border-red-900 shadow-2xl animate-float text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-red-600 flex items-center justify-center bg-black/40 text-red-600 text-5xl font-black">滅</div>
          <h1 className="text-3xl font-black text-red-600 mb-1 italic tracking-tighter uppercase">NICHIRIN SOUL</h1>
          <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="ENTER YOUR NAME" maxLength={14} className="w-full bg-black border-2 border-red-900/50 rounded-xl p-3 text-center font-black text-white text-xl outline-none mb-6" />
          <button onClick={() => { if (nameInput.trim().length >= 3) { setStats(p => ({...p, playerName: nameInput.trim()})); setView('map'); } }} className="w-full py-3.5 bg-red-700 rounded-xl font-black text-white uppercase shadow-[0_0_20px_red]">START JOURNEY</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-demon-gradient text-gray-200 flex flex-col font-cinzel select-none overflow-hidden fixed inset-0">
      <BackgroundEffects styleName={activePower?.name || ''} />
      <div className={`attack-flash ${demonWarning ? 'visible' : ''}`}></div>

      <header className="h-[8vh] bg-black/95 border-b border-white/10 px-4 z-[100] flex justify-between items-center backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-3">
          <div onClick={() => setShowSettings(!showSettings)} className="h-10 w-10 rounded-lg border border-red-600 flex items-center justify-center bg-black/60 text-red-600 text-xl font-black shadow-[0_0_10px_rgba(255,0,0,0.3)] cursor-pointer hover:scale-110 active:scale-95 transition-all">
            {currentRank.kanji}
          </div>
          <div className="flex flex-col cursor-pointer" onClick={() => setView('map')}>
            <h1 className="text-sm font-black text-red-600 italic leading-none">{stats.playerName.toUpperCase()}</h1>
            <span className="text-[9px] font-black text-gray-500 tracking-widest mt-0.5">{currentRank.name}</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {stats.maxReachedStage >= 300 && (<button onClick={() => startFight(stats.stage, true)} className="px-5 py-2 rounded-xl border-2 border-cyan-500 bg-cyan-900/30 text-cyan-400 font-black text-[11px] uppercase shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse">TRAIN</button>)}
          <div className="bg-yellow-900/40 px-3 py-1 rounded-full border border-yellow-700/50 text-yellow-400 font-black text-sm">{stats.tokens} 🪙</div>
          <div className="flex gap-2">
            {['map', 'shop', 'inventory'].map(v => (
              <button key={v} onClick={() => setView(v as any)} className={`px-3 py-1.5 rounded-lg border font-black text-[9px] uppercase ${view === v ? 'bg-red-700 border-red-400 text-white shadow-lg' : 'bg-gray-950 border-gray-700 text-gray-500 hover:text-white transition-colors'}`}>{v === 'shop' ? 'ESTATE' : v}</button>
            ))}
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-black border-4 border-red-900 p-8 rounded-[40px] max-w-sm w-full flex flex-col gap-4 text-center">
            <h3 className="text-3xl font-black text-red-600 mb-6 italic uppercase">Slayer Command</h3>
            <button onClick={() => setShowSettings(false)} className="py-4 bg-gray-800 rounded-2xl font-black uppercase text-sm hover:bg-gray-700 transition-colors">Continue Game</button>
            <button onClick={() => { localStorage.setItem(SAVE_KEY, JSON.stringify(stats)); setShowSettings(false); addVfx(400, 300, '💾', 'SAVED'); }} className="py-4 bg-blue-900/50 border border-blue-500 rounded-2xl font-black uppercase text-sm hover:bg-blue-800/50 transition-colors">Save Game</button>
            <button onClick={() => window.location.reload()} className="py-4 bg-purple-900/50 border border-purple-500 rounded-2xl font-black uppercase text-sm hover:bg-purple-800/50 transition-colors">Load Game</button>
            <div className="h-px bg-white/10 my-2"></div>
            <button onClick={() => setShowWipeConfirm(true)} className="py-4 bg-red-900/50 border border-red-500 rounded-2xl font-black uppercase text-sm hover:bg-red-800 transition-colors">New Game (WIPE)</button>
            <button onClick={() => setShowSettings(false)} className="mt-4 text-xs font-black text-gray-500 uppercase hover:text-white transition-colors">Close</button>
          </div>
        </div>
      )}

      {showWipeConfirm && (
        <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-black border-4 border-red-900 p-8 rounded-[40px] max-w-sm w-full flex flex-col gap-6 text-center">
            <h3 className="text-3xl font-black text-red-600 italic uppercase">ABANDON JOURNEY?</h3>
            <p className="text-sm text-gray-400 font-black uppercase leading-relaxed">ALL YOUR PROGRESS, WEAPONS, AND POWERS WILL BE LOST FOREVER.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeWipe} className="py-4 bg-red-700 rounded-2xl font-black uppercase text-white shadow-[0_0_20px_red]">CONFIRM WIPE</button>
              <button onClick={() => setShowWipeConfirm(false)} className="py-4 bg-gray-800 rounded-2xl font-black uppercase text-sm">CANCEL</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 relative flex flex-col items-center overflow-hidden z-10 w-full">
        {view === 'map' && (
          <div className="w-full h-full flex flex-col items-center py-6 gap-4 overflow-y-auto scrollbar-hide px-4">
            <h2 className="text-4xl font-black text-white tracking-[0.5em] uppercase italic drop-shadow-lg mb-2">THE PATH</h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-5xl pb-24">
              {mapStages.map(s => {
                let displayLabel = s.toString();
                let subLabel = "DEMON";
                let isElite = s % 10 === 0 && s !== 300;
                let isMuzan = s === 300;
                if (isMuzan) { displayLabel = "MUZAN"; subLabel = "FINAL BOSS"; }
                else if (isElite) { displayLabel = "ELITE"; subLabel = "BOSS"; }
                return (
                  <button key={s} disabled={s > stats.maxReachedStage} onClick={() => startFight(s)} className={`w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${s === stats.maxReachedStage ? 'bg-red-600 border-white scale-110 shadow-[0_0_25px_red] z-10' : (isElite || isMuzan) ? 'bg-red-950/80 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.3)]' : 'bg-gray-950 border-gray-700'} ${s > stats.maxReachedStage ? 'opacity-20 grayscale' : 'hover:scale-105'}`}>
                    <span className="text-[8px] uppercase text-gray-400 font-black mb-1">{subLabel}</span>
                    <span className={`font-black text-center px-2 ${isElite || isMuzan ? 'text-xs text-red-500 animate-pulse' : 'text-xl'}`}>{displayLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(view === 'battle' || view === 'training') && currentDemon && (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="relative flex-1 bg-transparent overflow-hidden">
              {stats.resurrectedHashiras.map((h, i) => (
                <div key={h} className="absolute transition-all duration-300 ease-out" style={{ left: playerX - 100 - (i % 3) * 40, bottom: 40 + playerY + (Math.floor(i / 3)) * 40 }}>
                  <div className="pixel-hashira-body" style={{ backgroundColor: getHashiraColor(h) }}><div className="pixel-hashira-head"></div></div>
                </div>
              ))}
              <div className="absolute transition-all duration-75 ease-out sprite-container" style={{ left: playerX, bottom: 40 + playerY }}>
                <div className={`transition-all ${isDodging ? 'opacity-30 translate-x-12 scale-x-[-1] blur-sm' : ''}`}>
                   <div className="pixel-player-body"><div className="pixel-player-head"></div><div className="pixel-player-sword"></div>{activeFormLabel && <div className="absolute -top-24 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 border-2 border-white/30 px-5 py-2 rounded-full text-white font-black italic animate-bounce">{activeFormLabel}</div>}</div>
                </div>
                <div className="w-24 h-4 space-y-1 mt-6">
                  <div className="h-2 bg-black rounded-full overflow-hidden border border-white/20"><div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(stats.currentHp / stats.maxHp) * 100}%` }}></div></div>
                  <div className="h-1.5 bg-black rounded-full overflow-hidden border border-blue-900/40"><div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${(stats.energy / stats.maxEnergy) * 100}%` }}></div></div>
                </div>
              </div>
              <div className="absolute transition-all duration-100 ease-out sprite-container" style={{ left: demonX, bottom: 40 }}>
                 <div className={`${demonWarning ? 'animate-shake' : ''}`}>
                    <div className="pixel-demon-body">
                       <img src={currentDemon.image} className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale pixelated" alt="demon" />
                       <div className="pixel-demon-head"><div className="pixel-demon-eye" style={{ left: '8px' }}></div><div className="pixel-demon-eye" style={{ right: '8px' }}></div></div>
                    </div>
                    <div className="mt-4 w-48 h-2 bg-black border border-red-900/60 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(currentDemon.hp / currentDemon.maxHp) * 100}%` }}></div></div>
                    <div className="text-[10px] text-center font-black mt-2 text-red-700 uppercase">{currentDemon.name}</div>
                 </div>
              </div>
              {vfx.map(v => <div key={v.id} className="absolute animate-ping z-[400] text-7xl text-white font-black italic pointer-events-none" style={{ left: v.x, bottom: v.y + 120 }}>{v.type} {v.text}</div>)}
              {showRetry && (
                <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center z-[500] backdrop-blur-md">
                  <h3 className="text-8xl font-black text-red-900 mb-6 italic uppercase">Fallen</h3>
                  {stats.stage === MUZAN_STAGE && <div className="text-xl font-black text-white uppercase text-center max-w-lg px-8 mb-10 border-2 border-yellow-600/40 p-6 rounded-3xl bg-black/60">MUZAN REGENERATES! ALL 9 HASHIRAS REQUIRED!<br/><span className="text-xs text-yellow-500 block italic">Hired: {stats.resurrectedHashiras.length}/9</span></div>}
                  <button onClick={() => startFight(stats.stage)} className="px-16 py-6 bg-red-700 rounded-full font-black uppercase text-2xl shadow-xl transition-all">REAWAKEN</button>
                  <button onClick={() => setView('map')} className="mt-4 text-gray-400 uppercase text-xs hover:text-white transition-colors">Return to Path</button>
                </div>
              )}
            </div>
            <div className="h-[22vh] min-h-[160px] bg-black/98 p-4 border-t border-white/10 flex gap-6 z-[100] backdrop-blur-3xl shrink-0 overflow-hidden">
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                <div className="flex gap-4 h-14 shrink-0">
                  <button onClick={() => handleAttack('normal')} className="w-14 h-14 bg-white/5 border border-white/15 rounded-xl text-3xl flex items-center justify-center active:scale-90 shrink-0 hover:bg-white/10 transition-colors">⚔️</button>
                  {activePower && (
                    <div className="flex-1 overflow-x-auto flex gap-2 scrollbar-hide items-center">
                      {Array.from({length: activePower.formsCount}).map((_, i) => {
                        const loreName = formNamesCache.current[activePower.name]?.[i + 1];
                        const displayLabel = loreName ? cleanFormName(loreName) : `F${i + 1}`;
                        const isCoolingDown = (formCooldowns[i + 1] || 0) > 0;
                        return (<button key={i} onClick={() => handleAttack('form', i + 1)} disabled={stats.energy < FORM_ENERGY_COST || isCoolingDown} className={`h-11 min-w-[70px] border border-blue-500/40 px-2 rounded-xl text-[8px] font-black uppercase bg-blue-900/10 shrink-0 relative ${isCoolingDown ? 'opacity-40 grayscale' : 'hover:bg-blue-800/30'}`}>{displayLabel}{isCoolingDown && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white">⌛</div>}</button>);
                      })}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto text-[9px] bg-black/90 p-2 rounded-xl border border-white/10 scrollbar-hide shadow-inner">
                  {battleLog.map((log, i) => <div key={i} className={`italic py-0.5 ${i === 0 ? 'text-white font-bold' : 'text-gray-500'}`}>{log}</div>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'shop' && (
          <div className="w-full h-full p-4 flex flex-col items-center overflow-y-auto scrollbar-hide gap-6">
            <h2 className="text-4xl font-black tracking-[0.4em] italic uppercase mt-4">ESTATE</h2>
            <div className="grid grid-cols-2 gap-4 w-full max-w-4xl shrink-0">
              <button onClick={() => handleRollInitiate('weapon')} disabled={stats.tokens < 50} className="p-6 bg-black/98 rounded-[30px] border-2 border-red-900/50 flex flex-col items-center gap-2 hover:border-red-600 transition-all group">
                <div className="text-5xl group-hover:scale-110 transition-transform">⚔️</div>
                <div className="font-black text-sm uppercase text-white">FORGE WEAPON (50)</div>
              </button>
              <button onClick={() => handleRollInitiate('power')} disabled={stats.tokens < 100} className="p-6 bg-black/98 rounded-[30px] border-2 border-blue-900/50 flex flex-col items-center gap-2 hover:border-blue-600 transition-all group">
                <div className="text-5xl group-hover:scale-110 transition-transform">📜</div>
                <div className="font-black text-sm uppercase text-white">BREATHING (100)</div>
              </button>
            </div>
            
            <div className="bg-black/90 border border-white/10 p-4 rounded-2xl w-full max-w-4xl grid grid-cols-4 gap-3 shrink-0">
              {(['strength', 'health', 'speed', 'ability'] as const).map(u => {
                const cost = UPGRADE_BASE_COST + stats.upgrades[u]*25;
                return (
                  <button key={u} onClick={() => { if (stats.upgrades[u] < MAX_MANUAL_TRAINING && stats.tokens >= cost) setStats(prev => ({ ...prev, tokens: prev.tokens - cost, upgrades: { ...prev.upgrades, [u]: prev.upgrades[u] + 1 }, maxHp: u === 'health' ? prev.maxHp + 300 : prev.maxHp, currentHp: u === 'health' ? prev.currentHp + 300 : prev.currentHp })); }} disabled={stats.upgrades[u] >= MAX_MANUAL_TRAINING} className="p-3 rounded-xl border border-white/10 flex flex-col items-center bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-[8px] uppercase font-black text-gray-400">{u}</span>
                    <span className="text-base font-black">LVL {stats.upgrades[u]}</span>
                    <span className="text-[8px] mt-1 text-yellow-500 font-bold">{stats.upgrades[u] >= MAX_MANUAL_TRAINING ? 'MAX' : `${cost} 🪙`}</span>
                  </button>
                );
              })}
            </div>

            <div className="w-full max-w-4xl mt-4">
               <h3 className="text-xl font-black text-yellow-500 uppercase italic mb-4 text-center tracking-widest border-b-2 border-yellow-500/30 pb-2">Hashira Recruitment (Barracks)</h3>
               <div className="grid grid-cols-3 md:grid-cols-5 gap-3 pb-24">
                  {HASHIRAS.map(h => (
                    <button key={h} onClick={() => hireHashira(h)} disabled={stats.resurrectedHashiras.includes(h) || stats.tokens < HIRE_COST} className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${stats.resurrectedHashiras.includes(h) ? 'bg-green-950/40 border-green-500 opacity-60 cursor-default' : 'bg-gray-950 border-gray-800 hover:border-yellow-600'}`}>
                      <div className="w-8 h-12 mb-2 pixel-hashira-body relative !static" style={{ backgroundColor: getHashiraColor(h) }}><div className="pixel-hashira-head"></div></div>
                      <div className="text-[8px] font-black uppercase text-center mb-1 leading-tight">{h.split(' ').slice(-1)}</div>
                      <div className="text-[7px] font-bold text-yellow-500 uppercase">{stats.resurrectedHashiras.includes(h) ? 'ACTIVE' : `50,000 🪙`}</div>
                    </button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {view === 'inventory' && (
           <div className="w-full h-full p-8 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
             <h2 className="text-4xl font-black uppercase italic text-center">ARMORY</h2>
             <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-24">
                {stats.weapons.map(w => (
                  <div key={w.id} onClick={() => setStats(p => ({...p, activeWeaponId: w.id}))} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${stats.activeWeaponId === w.id ? 'bg-red-950/40 border-red-500 scale-105 shadow-xl' : 'bg-gray-950 border-gray-900 opacity-60 hover:opacity-100'}`}>
                    <RarityBadge rarity={w.rarity} />
                    <div className={`font-black mt-2 text-white text-xs truncate italic ${w.rarity === Rarity.GODLY ? 'rarity-godly' : ''}`}>{w.name}</div>
                    <div className="text-[8px] text-gray-500 mt-1">DMG x{w.damageMultiplier.toFixed(1)}</div>
                  </div>
                ))}
                {stats.powers.map(p => (
                  <div key={p.id} onClick={() => setStats(prev => ({...prev, activePowerId: p.id}))} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${stats.activePowerId === p.id ? 'bg-blue-950/40 border-blue-500 scale-105 shadow-xl' : 'bg-gray-950 border-gray-900 opacity-60 hover:opacity-100'}`}>
                    <RarityBadge rarity={p.rarity} />
                    <div className={`font-black mt-2 text-white text-xs truncate italic ${p.rarity === Rarity.GODLY ? 'rarity-godly' : ''}`}>{p.name}</div>
                    <div className="text-[8px] text-blue-300 mt-1 uppercase">{p.effectType}</div>
                  </div>
                ))}
             </div>
           </div>
        )}
      </main>

      {showRollResult && (
        <div className="fixed inset-0 z-[800] bg-black/99 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl">
           <div className="animate-float flex flex-col items-center max-w-2xl">
              <div className="text-red-600 font-black uppercase mb-12 text-sm italic">UNLOCKED</div>
              <h2 className={`text-7xl font-black uppercase italic ${showRollResult.rarity === Rarity.GODLY ? 'rarity-godly' : showRollResult.rarity === Rarity.MYTHIC ? 'rarity-mythic' : 'text-white'}`}>{showRollResult.name}</h2>
              <div className="scale-[2.5] my-16"><RarityBadge rarity={showRollResult.rarity} /></div>
              <button onClick={() => setShowRollResult(null)} className="mt-16 px-24 py-6 bg-white text-black rounded-full font-black text-3xl uppercase tracking-widest active:scale-95 transition-all shadow-lg">CLAIM</button>
           </div>
        </div>
      )}

      <button onClick={() => setShowCheatPad(!showCheatPad)} className="fixed bottom-4 right-4 z-[900] w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-gray-600 hover:text-white transition-colors"><span className="text-xl">▼</span></button>

      {showCheatPad && (
        <div className="fixed inset-0 z-[1000] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm p-4">
           <div className="bg-black border-2 border-red-900/50 p-6 rounded-3xl shadow-2xl max-w-[300px] w-full">
              <div className="bg-black/50 border border-red-900/30 p-4 rounded-xl text-center text-2xl font-black text-white mb-6 h-16 flex items-center justify-center">{cheatInput || "-------"}</div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (<button key={n} onClick={() => handleCheatDigit(n.toString())} className="h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl hover:bg-white/10 transition-colors">{n}</button>))}
                <button onClick={() => setCheatInput("")} className="h-16 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center justify-center font-black text-xs hover:bg-red-900 transition-colors">CLR</button>
                <button onClick={() => setShowCheatPad(false)} className="h-16 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center font-black text-xs col-span-1 hover:bg-gray-800 transition-colors">X</button>
              </div>
           </div>
        </div>
      )}

      <footer className="h-[4vh] bg-black/98 border-t border-white/10 flex items-center justify-center px-4 opacity-60 z-[100] backdrop-blur-md shrink-0">
        <div className="flex gap-12 text-[8px] font-black tracking-[0.2em] italic text-gray-500 uppercase">
            <span>WASD: MOVE</span><span>SPACE: EVADE</span><span>E: SLASH</span><span>1-O: FORMS</span>
        </div>
      </footer>
    </div>
  );
}
