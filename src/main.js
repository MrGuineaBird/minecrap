
const THREE = window.THREE;
if (!THREE) {
  throw new Error("THREE failed to load from ./assets/three.min.js");
}

const CHUNK = 16;
const WORLD_H = 48;
const SEA = 26;
const MAX_RD = 6;
const MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const HW_THREADS = navigator.hardwareConcurrency || 4;
const RAM_GB = navigator.deviceMemory || 4;
const LOW_END_DEVICE = MOBILE || HW_THREADS <= 4 || RAM_GB <= 4;
// Add your own splash lines here. You can also set window.WebCraftSplashes = ["..."] before game boot.
const TITLE_SPLASHES = [
  "Now with extra questionable physics!",
  "Made by a single developer in their free time!",
  "Completely free and open source!",
  "Inspired by Minecraft but not affiliated with Mojang!",
  "Play on desktop for the best experience!",
  "straight ass game cerified!",
  "kyklos domain is peak",
  "school unblocked!",
  "better than eaglercraft...maybe",
  "please down sue me mojang",
  "yeah, games not good...cry about it"
];

function randomSplash() {
  const extra = Array.isArray(window.WebCraftSplashes) ? window.WebCraftSplashes : [];
  const cleanExtra = extra.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim());
  const pool = [...TITLE_SPLASHES, ...cleanExtra];
  if (!pool.length) return "Now with extra questionable physics!";
  return pool[Math.floor(Math.random() * pool.length)];
}

const BLOCK = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  SAND: 4,
  SNOW: 5,
  LOG: 6,
  LEAF: 7, //last done
  WATER: 8,
  LAVA: 9,
  GLASS: 10,
  COAL: 11,
  IRON: 12,
  GOLD: 13,
  PLANK: 14,
  COBBLE: 15,
  CRAFT: 16,
  FURNACE: 17,
  CHEST: 18,
  FARM: 19,
  CROP: 20,
  TORCH: 21,
  TNT: 22,
  RED: 23,
  SWITCH: 24,
  DOOR: 25,
  PISTON: 26,
  RAIL: 27,
  PORTAL: 28,
  OBS: 29,
  ENCHANT: 30,
};

const NAME = Object.fromEntries(Object.entries(BLOCK).map(([k, v]) => [v, k.toLowerCase()]));

const DEF = {
  [BLOCK.AIR]: { solid: 0, trans: 1, repl: 1 },
  [BLOCK.GRASS]: { solid: 1, hard: 1.1, tool: "shovel", drop: "dirt" },
  [BLOCK.DIRT]: { solid: 1, hard: 1.0, tool: "shovel", drop: "dirt" },
  [BLOCK.STONE]: { solid: 1, hard: 2.0, tool: "pickaxe", drop: "cobble" },
  [BLOCK.SAND]: { solid: 1, hard: 0.8, tool: "shovel", drop: "sand", fall: 1 },
  [BLOCK.SNOW]: { solid: 1, hard: 0.6, tool: "shovel", drop: "snow" },
  [BLOCK.LOG]: { solid: 1, hard: 1.8, tool: "axe", drop: "log", flam: 1 },
  [BLOCK.LEAF]: { solid: 1, trans: 1, hard: 0.2, drop: "seed", decay: 1, flam: 1 },
  [BLOCK.WATER]: { solid: 0, trans: 1, repl: 1, liquid: 1 },
  [BLOCK.LAVA]: { solid: 0, trans: 1, repl: 1, liquid: 1, light: 10 },
  [BLOCK.GLASS]: { solid: 1, trans: 1, hard: 0.5, drop: "glass" },
  [BLOCK.COAL]: { solid: 1, hard: 2.2, tool: "pickaxe", drop: "coal" },
  [BLOCK.IRON]: { solid: 1, hard: 2.4, tool: "pickaxe", drop: "raw_iron" },
  [BLOCK.GOLD]: { solid: 1, hard: 2.6, tool: "pickaxe", drop: "raw_gold" },
  [BLOCK.PLANK]: { solid: 1, hard: 1.4, tool: "axe", drop: "plank", flam: 1 },
  [BLOCK.COBBLE]: { solid: 1, hard: 2.0, tool: "pickaxe", drop: "cobble" },
  [BLOCK.CRAFT]: { solid: 1, hard: 2, tool: "axe", drop: "crafting_table", use: "craft" },
  [BLOCK.FURNACE]: { solid: 1, hard: 2.8, tool: "pickaxe", drop: "furnace", use: "furnace" },
  [BLOCK.CHEST]: { solid: 1, hard: 2.2, tool: "axe", drop: "chest", use: "chest" },
  [BLOCK.FARM]: { solid: 1, hard: 0.6, tool: "shovel", drop: "dirt" },
  [BLOCK.CROP]: { solid: 0, trans: 1, repl: 1, plant: 1, drop: "wheat" },
  [BLOCK.TORCH]: { solid: 0, trans: 1, repl: 1, light: 12, drop: "torch" },
  [BLOCK.TNT]: { solid: 1, hard: 0.2, drop: "tnt", tnt: 1 },
  [BLOCK.RED]: { solid: 0, trans: 1, repl: 1, red: 1, drop: "redstone" },
  [BLOCK.SWITCH]: { solid: 1, hard: 0.5, use: "switch", drop: "switch" },
  [BLOCK.DOOR]: { solid: 1, hard: 0.8, use: "door", drop: "door" },
  [BLOCK.PISTON]: { solid: 1, hard: 1.4, drop: "piston" },
  [BLOCK.RAIL]: { solid: 0, trans: 1, repl: 1, rail: 1, drop: "rail" },
  [BLOCK.PORTAL]: { solid: 0, trans: 1, repl: 1 },
  [BLOCK.OBS]: { solid: 1, hard: 40, tool: "pickaxe", drop: "obsidian" },
  [BLOCK.ENCHANT]: { solid: 1, hard: 3.0, drop: "enchant_table", use: "enchant" },
};

const PACKS = {
  classic: { grass: 0x5ca645, dirt: 0x7a5134, stone: 0x8b8e95, sand: 0xdcc683, snow: 0xf4f8ff, log: 0x6c4930, leaf: 0x2f7d40, water: 0x4f83ff, lava: 0xff7c2b, glass: 0xb6e2ff, coal: 0x55585a, iron: 0xbd8e67, gold: 0xd6bb50, plank: 0xa5744a, cobble: 0x72747c, craft: 0x9f6d3f, furnace: 0x666c74, chest: 0xa8793e, farm: 0x5f402b, crop: 0x70c553, torch: 0xffe396, tnt: 0xd25050, red: 0xbf2b2b, switch: 0x7a694f, door: 0x8a663e, piston: 0x77705e, rail: 0xbe9a45, portal: 0x7b3fbf, obs: 0x25203a, enchant: 0x324fb6 },
  pastel: { grass: 0x93d27d, dirt: 0xc39a7a, stone: 0xb6b9c6, sand: 0xf5dea5, snow: 0xfafcff, log: 0xb38a6c, leaf: 0x78c994, water: 0x86b9ff, lava: 0xffaa7a, glass: 0xd8f3ff, coal: 0x86889b, iron: 0xd0ab92, gold: 0xf2d173, plank: 0xcfaa7a, cobble: 0x9da2b0, craft: 0xc79b68, furnace: 0x989cab, chest: 0xd2aa6d, farm: 0x9a6e4a, crop: 0x94db79, torch: 0xffebbb, tnt: 0xe98383, red: 0xdd6262, switch: 0xab9b80, door: 0xbc9366, piston: 0xa4a093, rail: 0xd3b56a, portal: 0xad7be0, obs: 0x4f4667, enchant: 0x6f90f7 },
  "high-contrast": { grass: 0x40ff40, dirt: 0x8f4b00, stone: 0xb0b0b0, sand: 0xffee6f, snow: 0xffffff, log: 0x87561d, leaf: 0x009e35, water: 0x3070ff, lava: 0xff4f00, glass: 0xbff1ff, coal: 0x4b4b4b, iron: 0xcf8d57, gold: 0xffcd37, plank: 0xc08b42, cobble: 0x8e8e8e, craft: 0xb97a2a, furnace: 0x7a7a7a, chest: 0xcc8f2f, farm: 0x5d3200, crop: 0x4dfa46, torch: 0xfff09d, tnt: 0xff0000, red: 0xff2a2a, switch: 0x91805d, door: 0xa26e2d, piston: 0x89806f, rail: 0xe2b33f, portal: 0xb331ff, obs: 0x1f1635, enchant: 0x2052ff },
};

const COLOR_KEY = {
  [BLOCK.GRASS]: "grass", [BLOCK.DIRT]: "dirt", [BLOCK.STONE]: "stone", [BLOCK.SAND]: "sand", [BLOCK.SNOW]: "snow", [BLOCK.LOG]: "log", [BLOCK.LEAF]: "leaf", [BLOCK.WATER]: "water", [BLOCK.LAVA]: "lava", [BLOCK.GLASS]: "glass", [BLOCK.COAL]: "coal", [BLOCK.IRON]: "iron", [BLOCK.GOLD]: "gold", [BLOCK.PLANK]: "plank", [BLOCK.COBBLE]: "cobble", [BLOCK.CRAFT]: "craft", [BLOCK.FURNACE]: "furnace", [BLOCK.CHEST]: "chest", [BLOCK.FARM]: "farm", [BLOCK.CROP]: "crop", [BLOCK.TORCH]: "torch", [BLOCK.TNT]: "tnt", [BLOCK.RED]: "red", [BLOCK.SWITCH]: "switch", [BLOCK.DOOR]: "door", [BLOCK.PISTON]: "piston", [BLOCK.RAIL]: "rail", [BLOCK.PORTAL]: "portal", [BLOCK.OBS]: "obs", [BLOCK.ENCHANT]: "enchant",
};

const ATLAS_TILE = 16;
const ATLAS_COLS = 8;
const EXTRA_TILE_KEYS = ["grasstop", "grassside", "logside", "logtopandbottom"];
const TILE_KEYS = [...new Set([...Object.keys(PACKS.classic), ...EXTRA_TILE_KEYS])];
const TILE_INDEX = new Map(TILE_KEYS.map((k, i) => [k, i]));
const FILE_PROTOCOL = typeof window !== "undefined" && window.location?.protocol === "file:";
const GRASS_TEXTURE_VERSION = Date.now();
const CUSTOM_TILE_TEXTURE_FILES = {
  grasstop: ["grasstop.png"],
  grassside: ["grassside.png"],
  dirt: ["dirt.png"],
  stone: ["stone.png"],
  sand: ["sand.png"],
  snow: ["snow.png"],
  logside: ["logside.png"],
  logtopandbottom: ["logtopandbottom.png"],
  leaf: ["leaves.png", "leaf.png"],
};
const CUSTOM_TILE_TEXTURE_KEYS = Object.keys(CUSTOM_TILE_TEXTURE_FILES);
const GRASS_TEXTURE_ROOTS = [
  "./textures",
  "/textures",
  "./src/textures",
  "/src/textures",
  "./assets/textures",
  "/assets/textures",
];

function textureUrlsForKey(key) {
  const files = CUSTOM_TILE_TEXTURE_FILES[key];
  if (!files?.length) return [];
  const out = [];
  for (const root of GRASS_TEXTURE_ROOTS) {
    for (const file of files) {
      out.push(`${root}/${file}`);
      if (file.toLowerCase().endsWith(".png")) out.push(`${root}/${file.slice(0, -4)}.PNG`);
    }
  }
  return [...new Set(out)];
}

function tileColorKey(key) {
  if (key === "grasstop" || key === "grassside") return "grass";
  if (key === "logside" || key === "logtopandbottom") return "log";
  return key;
}

function hexRGB(hex) {
  return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 };
}

function tileShade(key, x, y, seed) {
  const k = key === "grasstop" || key === "grassside" ? "grass" : (key === "logside" || key === "logtopandbottom" ? "log" : key);
  let shade = 0.9 + (r01(x, y, 0, seed) - 0.5) * 0.24;
  if (k === "log" && x % 4 < 2) shade *= 0.73;
  if (k === "plank" && y % 4 === 0) shade *= 0.84;
  if (k === "water") shade = 0.78 + Math.sin((x + y) * 0.65) * 0.07 + (r01(x, y, 1, seed) - 0.5) * 0.1;
  if (k === "lava") shade = 0.86 + Math.sin((x * 0.8 + y * 0.6) + (seed & 7)) * 0.12;
  if (k === "glass") shade = 0.9 + (x % 5 === 0 || y % 5 === 0 ? 0.07 : 0);
  if (k === "leaf") shade *= 0.92 + (x + y) % 3 * 0.04;
  if (k === "farm" && y % 3 === 0) shade *= 0.8;
  if (k === "rail") shade = x % 4 < 2 ? 0.96 : 0.72;
  return shade;
}

function drawDots(ctx, tx, ty, key, count, color, seed) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = tx + (hc(i, seed & 255, 0, seed) % (ATLAS_TILE - 2)) + 1;
    const y = ty + (hc(i, (seed >> 8) & 255, 1, seed) % (ATLAS_TILE - 2)) + 1;
    if ((key === "coal" || key === "iron" || key === "gold") && i % 2 === 0) ctx.fillRect(x, y, 2, 2);
    else ctx.fillRect(x, y, 1, 1);
  }
}

function drawTile(ctx, tx, ty, key, hex, pack) {
  const seed = hs(`${pack}:${key}`);
  const rgb = hexRGB(hex);
  const img = ctx.createImageData(ATLAS_TILE, ATLAS_TILE);
  const px = img.data;
  for (let y = 0; y < ATLAS_TILE; y++) {
    for (let x = 0; x < ATLAS_TILE; x++) {
      const i = (y * ATLAS_TILE + x) * 4;
      const shade = tileShade(key, x, y, seed);
      px[i] = clamp(Math.floor(rgb.r * shade), 0, 255);
      px[i + 1] = clamp(Math.floor(rgb.g * shade), 0, 255);
      px[i + 2] = clamp(Math.floor(rgb.b * shade), 0, 255);
      px[i + 3] = key === "glass" ? 205 : key === "water" ? 190 : key === "leaf" ? 225 : 255;
    }
  }
  ctx.putImageData(img, tx, ty);

  if (key === "coal") drawDots(ctx, tx, ty, key, 14, "#1e1f22", seed);
  if (key === "iron") drawDots(ctx, tx, ty, key, 12, "#d9a27e", seed);
  if (key === "gold") drawDots(ctx, tx, ty, key, 12, "#ffd154", seed);
  if (key === "grass" || key === "grassside") {
    ctx.fillStyle = "rgba(40,110,35,0.25)";
    for (let x = 1; x < ATLAS_TILE; x += 3) ctx.fillRect(tx + x, ty + 2, 1, ATLAS_TILE - 4);
  }
  if (key === "tnt") {
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(tx, ty + 5, ATLAS_TILE, 3);
  }
}

function atlasFromCanvas(canvas) {
  const rows = Math.ceil(canvas.height / ATLAS_TILE);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return {
    texture,
    uvFor(key) {
      const idx = TILE_INDEX.get(key) ?? TILE_INDEX.get("stone") ?? 0;
      const col = idx % ATLAS_COLS;
      const row = Math.floor(idx / ATLAS_COLS);
      const eps = 0.001;
      const u0 = col / ATLAS_COLS + eps;
      const u1 = (col + 1) / ATLAS_COLS - eps;
      const v1 = 1 - row / rows - eps;
      const v0 = 1 - (row + 1) / rows + eps;
      return { u0, u1, v0, v1 };
    },
  };
}

function buildAtlas(packName) {
  const pack = PACKS[packName] || PACKS.classic;
  const rows = Math.ceil(TILE_KEYS.length / ATLAS_COLS);
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_COLS * ATLAS_TILE;
  canvas.height = rows * ATLAS_TILE;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  TILE_KEYS.forEach((key, i) => {
    const x = (i % ATLAS_COLS) * ATLAS_TILE;
    const y = Math.floor(i / ATLAS_COLS) * ATLAS_TILE;
    const cKey = tileColorKey(key);
    drawTile(ctx, x, y, key, pack[cKey] ?? 0xffffff, packName);
  });

  return atlasFromCanvas(canvas);
}

function loadImageMaybe(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    const sep = url.includes("?") ? "&" : "?";
    img.src = FILE_PROTOCOL ? url : `${url}${sep}v=${GRASS_TEXTURE_VERSION}`;
  });
}

async function loadImageFromUrls(urls) {
  for (const url of urls) {
    const img = await loadImageMaybe(url);
    if (img) return { img, url };
  }
  return { img: null, url: null };
}

function drawAtlasTileImage(atlas, key, img) {
  const idx = TILE_INDEX.get(key);
  const canvas = atlas?.texture?.image;
  const ctx = canvas?.getContext?.("2d");
  if (idx === undefined || !ctx || !img) return false;
  ctx.imageSmoothingEnabled = false;
  const x = (idx % ATLAS_COLS) * ATLAS_TILE;
  const y = Math.floor(idx / ATLAS_COLS) * ATLAS_TILE;
  ctx.clearRect(x, y, ATLAS_TILE, ATLAS_TILE);
  ctx.drawImage(img, 0, 0, img.width, img.height, x, y, ATLAS_TILE, ATLAS_TILE);
  atlas.texture.needsUpdate = true;
  return true;
}

const ITEM = {
  dirt: { block: BLOCK.DIRT, max: 64 }, sand: { block: BLOCK.SAND, max: 64 }, snow: { block: BLOCK.SNOW, max: 64 }, cobble: { block: BLOCK.COBBLE, max: 64 }, log: { block: BLOCK.LOG, max: 64 }, plank: { block: BLOCK.PLANK, max: 64 }, stick: { max: 64, fuel: 5 }, glass: { block: BLOCK.GLASS, max: 64 }, torch: { block: BLOCK.TORCH, max: 64 }, chest: { block: BLOCK.CHEST, max: 64 }, furnace: { block: BLOCK.FURNACE, max: 64 }, crafting_table: { block: BLOCK.CRAFT, max: 64 }, enchant_table: { block: BLOCK.ENCHANT, max: 64 }, rail: { block: BLOCK.RAIL, max: 64 }, tnt: { block: BLOCK.TNT, max: 64 }, door: { block: BLOCK.DOOR, max: 64 }, switch: { block: BLOCK.SWITCH, max: 64 }, piston: { block: BLOCK.PISTON, max: 64 }, obsidian: { block: BLOCK.OBS, max: 64 }, redstone: { block: BLOCK.RED, max: 64 }, portal: { block: BLOCK.PORTAL, max: 64 }, seed: { crop: 1, max: 64 }, wheat: { food: 2, max: 64 }, bread: { food: 5, max: 64 }, raw_meat: { food: 1, max: 64 }, cooked_meat: { food: 6, max: 64 }, coal: { fuel: 80, max: 64 }, raw_iron: { max: 64 }, raw_gold: { max: 64 }, iron_ingot: { max: 64 }, gold_ingot: { max: 64 }, emerald: { money: 1, max: 64 }, boat_item: { vehicle: "boat", max: 1 }, minecart_item: { vehicle: "cart", max: 1 }, wood_pickaxe: { tool: "pickaxe", tier: 1, dur: 59, max: 1 }, wood_axe: { tool: "axe", tier: 1, dur: 59, max: 1 }, wood_shovel: { tool: "shovel", tier: 1, dur: 59, max: 1 }, stone_pickaxe: { tool: "pickaxe", tier: 2, dur: 131, max: 1 }, stone_axe: { tool: "axe", tier: 2, dur: 131, max: 1 }, stone_shovel: { tool: "shovel", tier: 2, dur: 131, max: 1 }, iron_pickaxe: { tool: "pickaxe", tier: 3, dur: 250, max: 1 }, iron_axe: { tool: "axe", tier: 3, dur: 250, max: 1 }, iron_shovel: { tool: "shovel", tier: 3, dur: 250, max: 1 }, sword: { weapon: 5, dur: 200, max: 1 },
};

const RECIPES = [
  { in: { log: 1 }, out: { id: "plank", c: 4 } }, { in: { plank: 2 }, out: { id: "stick", c: 4 } }, { in: { plank: 4 }, out: { id: "crafting_table", c: 1 } }, { in: { plank: 8 }, out: { id: "chest", c: 1 } }, { in: { cobble: 8 }, out: { id: "furnace", c: 1 } }, { in: { obsidian: 4, gold_ingot: 2 }, out: { id: "enchant_table", c: 1 } }, { in: { plank: 3, stick: 2 }, out: { id: "wood_pickaxe", c: 1 } }, { in: { plank: 3, stick: 2 }, out: { id: "wood_axe", c: 1 } }, { in: { plank: 1, stick: 2 }, out: { id: "wood_shovel", c: 1 } }, { in: { cobble: 3, stick: 2 }, out: { id: "stone_pickaxe", c: 1 } }, { in: { cobble: 3, stick: 2 }, out: { id: "stone_axe", c: 1 } }, { in: { cobble: 1, stick: 2 }, out: { id: "stone_shovel", c: 1 } }, { in: { coal: 1, stick: 1 }, out: { id: "torch", c: 4 } }, { in: { wheat: 3 }, out: { id: "bread", c: 1 } }, { in: { plank: 6 }, out: { id: "door", c: 1 } }, { in: { iron_ingot: 2, stick: 1 }, out: { id: "rail", c: 4 } }, { in: { plank: 3, cobble: 4, iron_ingot: 1, redstone: 1 }, out: { id: "piston", c: 1 } }, { in: { cobble: 1, stick: 1 }, out: { id: "switch", c: 1 } }, { in: { sand: 4, coal: 2, redstone: 1 }, out: { id: "tnt", c: 1 } }, { in: { plank: 5 }, out: { id: "boat_item", c: 1 } }, { in: { iron_ingot: 5 }, out: { id: "minecart_item", c: 1 } },
];

const SMELT = { raw_iron: "iron_ingot", raw_gold: "gold_ingot", sand: "glass", raw_meat: "cooked_meat" };
const TOOL = { 1: 2, 2: 3.2, 3: 5 };
const FACE = [
  { d: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], s: 0.88 },
  { d: [-1, 0, 0], c: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], s: 0.88 },
  { d: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], s: 1.0 },
  { d: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], s: 0.6 },
  { d: [0, 0, 1], c: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], s: 0.76 },
  { d: [0, 0, -1], c: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], s: 0.76 },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const hs = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const hc = (x, y, z, sd) => { let h = sd ^ (x * 374761393) ^ (y * 668265263) ^ (z * 2147483647); h = (h ^ (h >>> 13)) >>> 0; h = Math.imul(h, 1274126177) >>> 0; return (h ^ (h >>> 16)) >>> 0; };
const r01 = (x, y, z, sd) => hc(x, y, z, sd) / 0xffffffff;
function n2(x, z, sd) {
  const x0 = Math.floor(x), z0 = Math.floor(z), tx = smooth(x - x0), tz = smooth(z - z0);
  const v00 = r01(x0, 0, z0, sd), v10 = r01(x0 + 1, 0, z0, sd), v01 = r01(x0, 0, z0 + 1, sd), v11 = r01(x0 + 1, 0, z0 + 1, sd);
  return lerp(lerp(v00, v10, tx), lerp(v01, v11, tx), tz);
}
function n3(x, y, z, sd) {
  const x0 = Math.floor(x), y0 = Math.floor(y), z0 = Math.floor(z), tx = smooth(x - x0), ty = smooth(y - y0), tz = smooth(z - z0);
  const g = (a, b, c) => r01(a, b, c, sd);
  const c000 = g(x0, y0, z0), c100 = g(x0 + 1, y0, z0), c010 = g(x0, y0 + 1, z0), c110 = g(x0 + 1, y0 + 1, z0), c001 = g(x0, y0, z0 + 1), c101 = g(x0 + 1, y0, z0 + 1), c011 = g(x0, y0 + 1, z0 + 1), c111 = g(x0 + 1, y0 + 1, z0 + 1);
  return lerp(lerp(lerp(c000, c100, tx), lerp(c010, c110, tx), ty), lerp(lerp(c001, c101, tx), lerp(c011, c111, tx), ty), tz);
}
const fbm2 = (x, z, sd, o = 4) => { let a = 1, f = 1, s = 0, n = 0; for (let i = 0; i < o; i++) { s += n2(x * f, z * f, sd + i * 101) * a; n += a; a *= 0.5; f *= 2; } return s / n; };
const fbm3 = (x, y, z, sd, o = 3) => { let a = 1, f = 1, s = 0, n = 0; for (let i = 0; i < o; i++) { s += n3(x * f, y * f, z * f, sd + i * 131) * a; n += a; a *= 0.5; f *= 2; } return s / n; };

const mk = (id = null, c = 0, d = 0, e = null) => ({ id, c, d, e });
class Inventory {
  constructor() { this.s = Array.from({ length: 36 }, () => mk()); this.sel = 0; }
  json() { return { s: this.s, sel: this.sel }; }
  load(v) { if (!v) return; this.s = (v.s || []).map((x) => ({ ...mk(), ...x })); while (this.s.length < 36) this.s.push(mk()); this.sel = clamp(v.sel || 0, 0, 8); }
  max(id) { return ITEM[id]?.max || 64; }
  count(id) { return this.s.reduce((a, b) => a + (b.id === id ? b.c : 0), 0); }
  has(req) { return Object.entries(req).every(([k, c]) => this.count(k) >= c); }
  add(id, c = 1) { const m = this.max(id); let left = c; for (const s of this.s) if (s.id === id && s.c < m) { const a = Math.min(left, m - s.c); s.c += a; left -= a; if (!left) return 0; } for (const s of this.s) if (!s.id) { const a = Math.min(left, m); s.id = id; s.c = a; s.d = ITEM[id]?.dur || 0; left -= a; if (!left) return 0; } return left; }
  take(id, c = 1) { if (this.count(id) < c) return 0; let left = c; for (const s of this.s) { if (s.id !== id) continue; const t = Math.min(left, s.c); s.c -= t; left -= t; if (s.c <= 0) Object.assign(s, mk()); if (!left) break; } return c; }
  consume(req) { if (!this.has(req)) return false; Object.entries(req).forEach(([k, c]) => this.take(k, c)); return true; }
  useSel() { const s = this.s[this.sel]; if (!s.id) return null; s.c -= 1; const id = s.id; if (s.c <= 0) Object.assign(s, mk()); return id; }
  selSlot() { return this.s[this.sel]; }
  cleanDur() { for (const s of this.s) if (s.id && ITEM[s.id]?.dur && s.d <= 0) Object.assign(s, mk()); }
}
class World {
  constructor(scene, seed, pack = "classic") {
    this.scene = scene;
    this.seed = typeof seed === "number" ? seed >>> 0 : hs(String(seed));
    this.pack = pack;
    this.dimension = "overworld";
    this.rd = 2;
    this.cd = new Map();
    this.cm = new Map();
    this.cl = new Map();
    this.mod = new Map();
    this.tile = new Map();
    this.fluid = new Set();
    this.decay = new Set();
    this.fire = new Set();
    this.power = new Set();
    this.loaded = new Set();
    this.pending = new Set();
    this.rebuildBudget = 4;
    this.maxChunkLights = 8;
    this.fluidLimit = 220;
    this.decayLimit = 100;
    this.fireLimit = 100;
    this.grassTexReq = 0;
    this.grassTexWarned = 0;
    this.atlas = buildAtlas(PACKS[this.pack] ? this.pack : "classic");
    this.applyGrassTextures();
  }
  ck(cx, cz) { return `${cx},${cz}`; }
  bk(x, y, z) { return `${x},${y},${z}`; }
  cc(x, z) { return [Math.floor(x / CHUNK), Math.floor(z / CHUNK)]; }
  lc(v) { return ((v % CHUNK) + CHUNK) % CHUNK; }
  idx(lx, y, lz) { return lx + CHUNK * (lz + CHUNK * y); }
  applyGrassTextures() {
    if (FILE_PROTOCOL) {
      if (!this.grassTexWarned) {
        console.warn("[WebCraft] Custom block textures require http(s) hosting. file:// taints canvas for WebGL. Run a local server (for example: `python -m http.server 8080`) and open http://localhost:8080/");
        this.grassTexWarned = 1;
      }
      return;
    }
    const req = ++this.grassTexReq;
    const atlas = this.atlas;
    Promise.all(CUSTOM_TILE_TEXTURE_KEYS.map((k) => loadImageFromUrls(textureUrlsForKey(k)))).then((results) => {
      if (req !== this.grassTexReq || atlas !== this.atlas) return;
      let changed = false;
      const loaded = {};
      for (let i = 0; i < CUSTOM_TILE_TEXTURE_KEYS.length; i++) {
        const key = CUSTOM_TILE_TEXTURE_KEYS[i];
        const res = results[i];
        loaded[key] = res.url;
        if (res.img) changed = drawAtlasTileImage(atlas, key, res.img) || changed;
      }
      const missing = CUSTOM_TILE_TEXTURE_KEYS.filter((_, i) => !results[i].img);
      if (missing.length) {
        if (!this.grassTexWarned) {
          const tried = Object.fromEntries(missing.map((key) => [key, textureUrlsForKey(key)]));
          console.warn("[WebCraft] Some custom block textures were not found. Using generated fallback for missing keys.", {
            loaded,
            missing,
            tried,
          });
          this.grassTexWarned = 1;
        }
      } else {
        this.grassTexWarned = 0;
        console.info("[WebCraft] Custom block textures loaded.", { loaded });
      }
      if (changed) atlas.texture.needsUpdate = true;
      // Ensure visible update even on drivers/caches that don't refresh atlas-bound materials immediately.
      if (changed) for (const k of this.loaded) this.rebuildKey(k);
    });
  }
  setPack(p) {
    this.pack = (typeof p === "string" && p.trim()) ? p.trim() : "classic";
    this.atlas = buildAtlas(PACKS[this.pack] ? this.pack : "classic");
    this.applyGrassTextures();
    for (const k of this.loaded) this.rebuildKey(k);
  }
  setRD(v) { this.rd = clamp(Math.round(v), 2, MAX_RD); }
  setPerf(o = {}) {
    if (o.rebuildBudget !== undefined) this.rebuildBudget = clamp(Math.floor(o.rebuildBudget), 1, 12);
    if (o.chunkLights !== undefined) this.maxChunkLights = clamp(Math.floor(o.chunkLights), 0, 8);
    if (o.fluidLimit !== undefined) this.fluidLimit = clamp(Math.floor(o.fluidLimit), 40, 320);
    if (o.decayLimit !== undefined) this.decayLimit = clamp(Math.floor(o.decayLimit), 20, 200);
    if (o.fireLimit !== undefined) this.fireLimit = clamp(Math.floor(o.fireLimit), 20, 200);
  }
  ensure(cx, cz) {
    const k = this.ck(cx, cz);
    if (!this.cd.has(k)) this.cd.set(k, this.gen(cx, cz));
    return this.cd.get(k);
  }
  get(x, y, z) {
    if (y < 0 || y >= WORLD_H) return BLOCK.AIR;
    const [cx, cz] = this.cc(x, z), c = this.ensure(cx, cz);
    return c.b[this.idx(this.lc(x), y, this.lc(z))];
  }
  gd(x, y, z) {
    if (y < 0 || y >= WORLD_H) return 0;
    const [cx, cz] = this.cc(x, z), c = this.ensure(cx, cz);
    return c.d[this.idx(this.lc(x), y, this.lc(z))] || 0;
  }
  sd(x, y, z, v) {
    if (y < 0 || y >= WORLD_H) return;
    const [cx, cz] = this.cc(x, z), c = this.ensure(cx, cz);
    c.d[this.idx(this.lc(x), y, this.lc(z))] = v;
    c.dirty = 1;
    this.rebuildNear(x, y, z);
  }
  set(x, y, z, id, o = {}) {
    if (y < 0 || y >= WORLD_H) return;
    const [cx, cz] = this.cc(x, z), c = this.ensure(cx, cz), i = this.idx(this.lc(x), y, this.lc(z));
    c.b[i] = id;
    if (o.data !== undefined) c.d[i] = o.data;
    c.dirty = 1;
    if (o.mod !== false) this.mod.set(this.bk(x, y, z), { id, d: c.d[i] || 0 });
    if (DEF[id]?.liquid) this.fluid.add(this.bk(x, y, z));
    if (id === BLOCK.LEAF) this.decay.add(this.bk(x, y, z));
    if (id === BLOCK.LAVA) this.fire.add(this.bk(x, y, z));
    if (id === BLOCK.CHEST && !this.tile.has(this.bk(x, y, z))) this.tile.set(this.bk(x, y, z), { t: "chest", i: Array.from({ length: 27 }, () => mk()) });
    if (id === BLOCK.FURNACE && !this.tile.has(this.bk(x, y, z))) this.tile.set(this.bk(x, y, z), { t: "furnace", in: null, fuel: null, left: 0, p: 0, out: null });
    this.rebuildNear(x, y, z);
  }
  isSolid(x, y, z) { const id = this.get(x, y, z), d = DEF[id] || {}; return !!d.solid && !d.liquid; }
  isLiquid(x, y, z) { return !!DEF[this.get(x, y, z)]?.liquid; }
  surface(x, z) { for (let y = WORLD_H - 1; y >= 0; y--) { const id = this.get(x, y, z); if (id !== BLOCK.AIR && id !== BLOCK.WATER && id !== BLOCK.LAVA && id !== BLOCK.LEAF) return y; } return 1; }
  biome(x, z) {
    const sd = this.dimension === "nether" ? this.seed + 99991 : this.seed;
    const t = fbm2(x / 180, z / 180, sd + 41), w = fbm2(x / 170 + 100, z / 170 - 100, sd + 87);
    if (this.dimension === "nether") return "ash";
    if (t > 0.62 && w < 0.4) return "desert";
    if (t < 0.34) return "snow";
    if (w > 0.55) return "forest";
    return "plains";
  }
  height(x, z) {
    const sd = this.dimension === "nether" ? this.seed + 99991 : this.seed;
    const base = fbm2(x / 90, z / 90, sd + 11) * 18 + 22;
    const detail = fbm2(x / 28, z / 28, sd + 19) * 4;
    const b = this.biome(x, z);
    let h = base + detail;
    if (b === "desert") h += 2;
    if (b === "snow") h += 4;
    if (this.dimension === "nether") h += 4;
    return clamp(Math.floor(h), 6, WORLD_H - 6);
  }
  gen(cx, cz) {
    const b = new Uint16Array(CHUNK * CHUNK * WORLD_H);
    const d = new Uint16Array(CHUNK * CHUNK * WORLD_H);
    const hm = new Uint8Array(CHUNK * CHUNK);
    const c = { cx, cz, b, d, mob: 0, village: null, dirty: 1 };
    for (let lx = 0; lx < CHUNK; lx++) for (let lz = 0; lz < CHUNK; lz++) {
      const wx = cx * CHUNK + lx, wz = cz * CHUNK + lz;
      const bio = this.biome(wx, wz), h = this.height(wx, wz);
      hm[lx + CHUNK * lz] = h;
      for (let y = 0; y <= h; y++) {
        let id = BLOCK.STONE;
        if (this.dimension === "nether") id = y >= h - 1 ? BLOCK.OBS : BLOCK.STONE;
        else if (bio === "desert") id = y === h ? BLOCK.SAND : y > h - 4 ? BLOCK.SAND : BLOCK.STONE;
        else if (bio === "snow") id = y === h ? BLOCK.SNOW : y > h - 4 ? BLOCK.DIRT : BLOCK.STONE;
        else id = y === h ? BLOCK.GRASS : y > h - 4 ? BLOCK.DIRT : BLOCK.STONE;
        const caveN = fbm3(wx / 25, y / 18, wz / 25, this.seed + 301, 3);
        const deepCave = y < h - 18 && y < SEA - 10 && caveN > 0.7;
        if (deepCave) id = BLOCK.AIR;
        if (id === BLOCK.STONE) {
          const o = r01(wx, y, wz, this.seed + 500);
          if (y < 42 && o < 0.015) id = BLOCK.COAL;
          if (y < 28 && o < 0.008) id = BLOCK.IRON;
          if (y < 20 && o < 0.004) id = BLOCK.GOLD;
        }
        b[this.idx(lx, y, lz)] = id;
      }
      if (this.dimension !== "nether") {
        for (let y = h + 1; y <= SEA; y++) { b[this.idx(lx, y, lz)] = bio === "snow" ? BLOCK.GLASS : BLOCK.WATER; d[this.idx(lx, y, lz)] = 1; }
      } else {
        for (let y = 4; y <= 8; y++) if (b[this.idx(lx, y, lz)] === BLOCK.AIR) { b[this.idx(lx, y, lz)] = BLOCK.LAVA; d[this.idx(lx, y, lz)] = 1; }
      }
    }
    for (let lx = 0; lx < CHUNK; lx++) for (let lz = 0; lz < CHUNK; lz++) {
      const wx = cx * CHUNK + lx, wz = cz * CHUNK + lz, bio = this.biome(wx, wz), h = hm[lx + CHUNK * lz];
      if (this.dimension !== "nether" && (bio === "forest" || bio === "plains")) if (r01(wx, h, wz, this.seed + 700) < (bio === "forest" ? 0.085 : 0.03) && h > SEA + 1) this.tree(c, lx, h + 1, lz);
    }
    for (let lx = 0; lx < CHUNK; lx++) for (let lz = 0; lz < CHUNK; lz++) {
      const wx = cx * CHUNK + lx, wz = cz * CHUNK + lz, bio = this.biome(wx, wz), h = hm[lx + CHUNK * lz];
      const topFill = bio === "desert" ? BLOCK.SAND : BLOCK.DIRT;
      for (let y = h - 1; y >= Math.max(1, h - 18); y--) {
        const ii = this.idx(lx, y, lz);
        const id = c.b[ii];
        if (id === BLOCK.AIR || id === BLOCK.WATER || id === BLOCK.LAVA) c.b[ii] = y >= h - 4 ? topFill : BLOCK.STONE;
      }
    }
    if (r01(cx, 0, cz, this.seed + 900) < 0.02 && this.dimension !== "nether") this.dungeon(c);
    if (r01(cx, 1, cz, this.seed + 901) < 0.012 && this.dimension !== "nether") this.village(c);
    if (r01(cx, 2, cz, this.seed + 905) < 0.006) this.egg(c);
    this.applyMod(c);
    return c;
  }
  top(c, lx, lz) { for (let y = WORLD_H - 1; y >= 0; y--) { const id = c.b[this.idx(lx, y, lz)]; if (id !== BLOCK.AIR && id !== BLOCK.WATER && id !== BLOCK.LAVA && id !== BLOCK.LEAF) return y; } return 0; }
  tree(c, lx, y, lz) {
    const h = 4 + Math.floor(r01(lx, y, lz, this.seed + 1001) * 3); if (y + h + 2 >= WORLD_H) return;
    for (let i = 0; i < h; i++) c.b[this.idx(lx, y + i, lz)] = BLOCK.LOG;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
      if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) > 4) continue;
      const px = lx + dx, py = y + h - 1 + dy, pz = lz + dz;
      if (px < 0 || px >= CHUNK || pz < 0 || pz >= CHUNK || py < 0 || py >= WORLD_H) continue;
      const i = this.idx(px, py, pz); if (c.b[i] === BLOCK.AIR) c.b[i] = BLOCK.LEAF;
    }
  }
  dungeon(c) {
    const x = 4 + Math.floor(r01(c.cx, 3, c.cz, this.seed + 1101) * 8), z = 4 + Math.floor(r01(c.cx, 4, c.cz, this.seed + 1102) * 8), y = 12 + Math.floor(r01(c.cx, 5, c.cz, this.seed + 1103) * 14);
    for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) for (let dy = -2; dy <= 2; dy++) {
      const px = x + dx, py = y + dy, pz = z + dz;
      if (px < 0 || px >= CHUNK || pz < 0 || pz >= CHUNK || py < 1 || py >= WORLD_H - 1) continue;
      const wall = Math.abs(dx) === 3 || Math.abs(dy) === 2 || Math.abs(dz) === 3;
      c.b[this.idx(px, py, pz)] = wall ? BLOCK.COBBLE : BLOCK.AIR;
    }
    const cy = y - 1; c.b[this.idx(x, cy, z)] = BLOCK.CHEST;
    const key = this.bk(c.cx * CHUNK + x, cy, c.cz * CHUNK + z);
    this.tile.set(key, { t: "chest", i: [{ id: "coal", c: 6 }, { id: "iron_ingot", c: 4 }, { id: "bread", c: 2 }, { id: "emerald", c: 3 }, ...Array.from({ length: 23 }, () => mk())] });
  }
  village(c) {
    const ox = 4 + Math.floor(r01(c.cx, 9, c.cz, this.seed + 1200) * 8), oz = 4 + Math.floor(r01(c.cx, 10, c.cz, this.seed + 1201) * 8), by = this.top(c, ox, oz) + 1;
    c.village = { x: c.cx * CHUNK + ox, y: by, z: c.cz * CHUNK + oz };
    for (let h = 0; h < 2; h++) {
      const sx = ox + h * 5 - 2, sz = oz + (h % 2 === 0 ? -2 : 2);
      for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) for (let y = 0; y <= 3; y++) {
        const px = sx + x, py = by + y, pz = sz + z;
        if (px < 0 || px >= CHUNK || pz < 0 || pz >= CHUNK || py < 1 || py >= WORLD_H - 1) continue;
        const wall = Math.abs(x) === 2 || Math.abs(z) === 2, roof = y === 3;
        c.b[this.idx(px, py, pz)] = roof ? BLOCK.PLANK : wall ? BLOCK.LOG : BLOCK.AIR;
      }
      c.b[this.idx(sx, by + 1, sz + 2)] = BLOCK.DOOR;
    }
  }
  egg(c) {
    const x = 8, z = 8, y = this.top(c, x, z) + 1;
    for (let i = 0; i < 4; i++) c.b[this.idx(x, y + i, z)] = BLOCK.OBS;
    if (y + 4 < WORLD_H) {
      c.b[this.idx(x, y + 4, z)] = BLOCK.CHEST;
      const key = this.bk(c.cx * CHUNK + x, y + 4, c.cz * CHUNK + z);
      this.tile.set(key, { t: "chest", i: [{ id: "iron_pickaxe", c: 1, d: ITEM.iron_pickaxe.dur }, { id: "gold_ingot", c: 12 }, { id: "emerald", c: 15 }, ...Array.from({ length: 24 }, () => mk())] });
    }
  }
  applyMod(c) {
    const bx = c.cx * CHUNK, bz = c.cz * CHUNK;
    for (let lx = 0; lx < CHUNK; lx++) for (let lz = 0; lz < CHUNK; lz++) for (let y = 0; y < WORLD_H; y++) {
      const m = this.mod.get(this.bk(bx + lx, y, bz + lz));
      if (!m) continue;
      const i = this.idx(lx, y, lz); c.b[i] = m.id; c.d[i] = m.d || 0;
    }
  }
  rebuildNear(x, y, z) {
    const [cx, cz] = this.cc(x, z);
    this.queueRebuild(cx, cz);
    if (this.lc(x) === 0) this.queueRebuild(cx - 1, cz);
    if (this.lc(x) === CHUNK - 1) this.queueRebuild(cx + 1, cz);
    if (this.lc(z) === 0) this.queueRebuild(cx, cz - 1);
    if (this.lc(z) === CHUNK - 1) this.queueRebuild(cx, cz + 1);
  }
  queueRebuild(cx, cz) {
    const k = this.ck(cx, cz);
    if (this.loaded.has(k)) this.pending.add(k);
  }
  rebuildKey(k) {
    if (k.includes(":")) return;
    this.pending.add(k);
  }
  dropMesh(k) {
    const o = this.cm.get(`${k}:o`), t = this.cm.get(`${k}:t`);
    if (o) { o.geometry.dispose(); o.material.dispose(); this.scene.remove(o); this.cm.delete(`${k}:o`); }
    if (t) { t.geometry.dispose(); t.material.dispose(); this.scene.remove(t); this.cm.delete(`${k}:t`); }
    const ls = this.cl.get(k); if (ls) { ls.forEach((l) => this.scene.remove(l)); this.cl.delete(k); }
  }
  rebuild(cx, cz) {
    const k = this.ck(cx, cz); if (!this.loaded.has(k)) return;
    const c = this.ensure(cx, cz); this.dropMesh(k);
    const g = this.mesh(c);
    if (g.o) {
      const m = new THREE.Mesh(g.o, new THREE.MeshLambertMaterial({ map: this.atlas.texture, vertexColors: true }));
      m.castShadow = true; m.receiveShadow = true; this.scene.add(m); this.cm.set(`${k}:o`, m);
    }
    if (g.t) {
      const m = new THREE.Mesh(g.t, new THREE.MeshLambertMaterial({ map: this.atlas.texture, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
      m.receiveShadow = true; this.scene.add(m); this.cm.set(`${k}:t`, m);
    }
    this.chunkLight(c);
    c.dirty = 0;
  }
  mesh(c) {
    const o = { p: [], n: [], cl: [], uv: [] }, t = { p: [], n: [], cl: [], uv: [] };
    const pal = PACKS[this.pack] || PACKS.classic;
    const bx = c.cx * CHUNK, bz = c.cz * CHUNK;
    for (let lx = 0; lx < CHUNK; lx++) for (let lz = 0; lz < CHUNK; lz++) for (let y = 0; y < WORLD_H; y++) {
      const id = c.b[this.idx(lx, y, lz)]; if (id === BLOCK.AIR) continue;
      const d = DEF[id] || DEF[BLOCK.AIR], w = d.trans || d.liquid || d.plant || d.rail || id === BLOCK.TORCH || id === BLOCK.RED;
      const b = w ? t : o;
      const x = bx + lx, z = bz + lz, key = COLOR_KEY[id] || "stone";
      const noTint = id === BLOCK.GRASS || id === BLOCK.DIRT || id === BLOCK.STONE || id === BLOCK.SAND || id === BLOCK.SNOW || id === BLOCK.LOG || id === BLOCK.LEAF;
      const baseHex = noTint ? 0xffffff : (pal[key] || 0xffffff);
      const col = new THREE.Color(baseHex);
      if (d.plant || d.rail || id === BLOCK.TORCH || id === BLOCK.RED) {
        const uv = this.atlas.uvFor(key);
        const uvTri = [[uv.u0, uv.v0], [uv.u0, uv.v1], [uv.u1, uv.v1], [uv.u0, uv.v0], [uv.u1, uv.v1], [uv.u1, uv.v0]];
        const planes = [[[0, 0, 0], [1, 1, 1], [1, 0, 1], [0, 1, 0]], [[1, 0, 0], [0, 1, 1], [0, 0, 1], [1, 1, 0]]];
        for (const p of planes) {
          const verts = [p[0], p[1], p[2], p[0], p[3], p[1]];
          for (let i = 0; i < verts.length; i++) {
            const v = verts[i], u = uvTri[i];
            b.p.push(x + v[0], y + v[1], z + v[2]); b.n.push(0, 1, 0); b.cl.push(col.r, col.g, col.b); b.uv.push(u[0], u[1]);
          }
        }
        continue;
      }
      for (const f of FACE) {
        const nx = x + f.d[0], ny = y + f.d[1], nz = z + f.d[2];
        const nid = this.get(nx, ny, nz), nd = DEF[nid] || DEF[BLOCK.AIR];
        const vis = nid === BLOCK.AIR || (!d.trans && (nd.trans || nd.liquid || nd.plant || nd.rail)) || (d.trans && nid !== id && nid !== BLOCK.AIR);
        if (!vis) continue;
        let faceKey = key;
        if (id === BLOCK.GRASS) {
          if (f.d[1] > 0) faceKey = "grasstop";
          else if (f.d[1] < 0) faceKey = "dirt";
          else faceKey = "grassside";
        } else if (id === BLOCK.LOG) {
          faceKey = f.d[1] !== 0 ? "logtopandbottom" : "logside";
        }
        const uv = this.atlas.uvFor(faceKey);
        const uvTri = [[uv.u0, uv.v0], [uv.u0, uv.v1], [uv.u1, uv.v1], [uv.u0, uv.v0], [uv.u1, uv.v1], [uv.u1, uv.v0]];
        const c1 = col.clone().multiplyScalar(f.s), v = [f.c[0], f.c[1], f.c[2], f.c[0], f.c[2], f.c[3]];
        for (let i = 0; i < v.length; i++) {
          const q = v[i], u = uvTri[i];
          b.p.push(x + q[0], y + q[1], z + q[2]); b.n.push(f.d[0], f.d[1], f.d[2]); b.cl.push(c1.r, c1.g, c1.b); b.uv.push(u[0], u[1]);
        }
      }
    }
    const mkGeo = (b) => {
      if (!b.p.length) return null;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(b.n, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(b.cl, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
      g.computeBoundingSphere();
      return g;
    };
    return { o: mkGeo(o), t: mkGeo(t) };
  }
  chunkLight(c) {
    const k = this.ck(c.cx, c.cz), old = this.cl.get(k); if (old) old.forEach((x) => this.scene.remove(x));
    const lim = this.maxChunkLights;
    if (lim <= 0) { this.cl.set(k, []); return; }
    const out = []; let n = 0;
    for (let lx = 0; lx < CHUNK && n < lim; lx++) for (let lz = 0; lz < CHUNK && n < lim; lz++) for (let y = 1; y < WORLD_H - 1 && n < lim; y++) {
      const id = c.b[this.idx(lx, y, lz)], lv = DEF[id]?.light || 0; if (lv <= 0) continue;
      const l = new THREE.PointLight(id === BLOCK.LAVA ? 0xff7722 : 0xffe29b, 0.35 + lv / 18, 8 + lv);
      l.position.set(c.cx * CHUNK + lx + 0.5, y + 0.6, c.cz * CHUNK + lz + 0.5);
      out.push(l); this.scene.add(l); n++;
    }
    this.cl.set(k, out);
  }
  updateLoaded(pos) {
    const [pcx, pcz] = this.cc(pos.x, pos.z), want = new Set();
    for (let dz = -this.rd; dz <= this.rd; dz++) for (let dx = -this.rd; dx <= this.rd; dx++) {
      const cx = pcx + dx, cz = pcz + dz, k = this.ck(cx, cz);
      want.add(k); this.loaded.add(k);
      const c = this.ensure(cx, cz);
      if ((!this.cm.has(`${k}:o`) && !this.cm.has(`${k}:t`)) || c.dirty) this.pending.add(k);
    }
    for (const k of Array.from(this.loaded)) if (!want.has(k)) { this.loaded.delete(k); this.pending.delete(k); this.dropMesh(k); }
    const todo = Array.from(this.pending).filter((k) => this.loaded.has(k));
    todo.sort((a, b) => {
      const [ax, az] = a.split(",").map(Number), [bx, bz] = b.split(",").map(Number);
      return (Math.abs(ax - pcx) + Math.abs(az - pcz)) - (Math.abs(bx - pcx) + Math.abs(bz - pcz));
    });
    for (let i = 0; i < Math.min(this.rebuildBudget, todo.length); i++) {
      const k = todo[i], [cx, cz] = k.split(",").map(Number);
      this.rebuild(cx, cz);
      this.pending.delete(k);
    }
  }
  ray(origin, dir, dist) {
    const p = origin.clone(), s = dir.clone().normalize().multiplyScalar(0.08), prev = new THREE.Vector3().copy(p);
    for (let t = 0; t < dist; t += 0.08) {
      prev.copy(p); p.add(s);
      const x = Math.floor(p.x), y = Math.floor(p.y), z = Math.floor(p.z), id = this.get(x, y, z);
      if (id !== BLOCK.AIR && id !== BLOCK.WATER && id !== BLOCK.LAVA) return { hit: 1, b: { x, y, z, id }, p: { x: Math.floor(prev.x), y: Math.floor(prev.y), z: Math.floor(prev.z) } };
    }
    return { hit: 0 };
  }
  lightAt(x, y, z, tn = 0.5) {
    let bl = 0;
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) for (let dz = -2; dz <= 2; dz++) {
      const id = this.get(x + dx, y + dy, z + dz), l = DEF[id]?.light || 0, dist = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
      bl = Math.max(bl, l - dist * 2);
    }
    let sky = 1;
    for (let sy = y + 1; sy < WORLD_H; sy++) { const id = this.get(x, sy, z); if (DEF[id]?.solid && !DEF[id]?.trans) { sky = 0; break; } }
    const dl = sky ? Math.max(0, Math.sin(tn * Math.PI * 2)) * 15 : 0;
    return Math.floor(Math.max(bl, dl));
  }
  tickPhysics() {
    const run = (set, fn, lim) => {
      const all = Array.from(set); set.clear();
      for (let i = 0; i < Math.min(all.length, lim); i++) fn(all[i]);
      for (let i = lim; i < all.length; i++) set.add(all[i]);
    };
    run(this.fluid, (k) => { const [x, y, z] = k.split(",").map(Number); this.upFluid(x, y, z); }, this.fluidLimit);
    run(this.decay, (k) => { const [x, y, z] = k.split(",").map(Number); this.upDecay(x, y, z); }, this.decayLimit);
    run(this.fire, (k) => { const [x, y, z] = k.split(",").map(Number); this.upFire(x, y, z); }, this.fireLimit);
    this.fallTick();
  }
  upFluid(x, y, z) {
    const id = this.get(x, y, z); if (!(id === BLOCK.WATER || id === BLOCK.LAVA)) return;
    const lim = id === BLOCK.WATER ? 5 : 3, lv = this.gd(x, y, z) || 1;
    for (const d of [[0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]]) {
      const nx = x + d[0], ny = y + d[1], nz = z + d[2]; if (ny < 1 || ny >= WORLD_H - 1) continue;
      const nid = this.get(nx, ny, nz);
      if ((id === BLOCK.WATER && nid === BLOCK.LAVA) || (id === BLOCK.LAVA && nid === BLOCK.WATER)) { this.set(nx, ny, nz, ny < y ? BLOCK.OBS : BLOCK.STONE, { data: 0, mod: 1 }); continue; }
      if (nid !== BLOCK.AIR && !DEF[nid]?.repl) continue;
      const nl = d[1] === -1 ? 1 : lv + 1; if (nl > lim) continue;
      this.set(nx, ny, nz, id, { data: nl, mod: 1 }); this.fluid.add(this.bk(nx, ny, nz));
    }
  }
  upDecay(x, y, z) {
    if (this.get(x, y, z) !== BLOCK.LEAF) return;
    let log = 0;
    for (let dx = -4; dx <= 4 && !log; dx++) for (let dy = -4; dy <= 4 && !log; dy++) for (let dz = -4; dz <= 4; dz++) if (this.get(x + dx, y + dy, z + dz) === BLOCK.LOG) { log = 1; break; }
    if (!log && Math.random() < 0.2) this.set(x, y, z, BLOCK.AIR, { mod: 1 }); else this.decay.add(this.bk(x, y, z));
  }
  upFire(x, y, z) {
    if (this.get(x, y, z) !== BLOCK.LAVA) return;
    for (const d of [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0]]) {
      const nx = x + d[0], ny = y + d[1], nz = z + d[2], id = this.get(nx, ny, nz);
      if (DEF[id]?.flam && Math.random() < 0.08) this.set(nx, ny, nz, BLOCK.AIR, { mod: 1 });
    }
    if (Math.random() < 0.7) this.fire.add(this.bk(x, y, z));
  }
  fallTick() {
    for (const k of this.loaded) {
      const [cx, cz] = k.split(",").map(Number), c = this.ensure(cx, cz), bx = cx * CHUNK, bz = cz * CHUNK;
      for (let lx = 0; lx < CHUNK; lx++) for (let lz = 0; lz < CHUNK; lz++) for (let y = 1; y < WORLD_H; y++) {
        const i = this.idx(lx, y, lz), id = c.b[i]; if (!DEF[id]?.fall) continue;
        const wx = bx + lx, wz = bz + lz, below = this.get(wx, y - 1, wz);
        if (below === BLOCK.AIR || DEF[below]?.repl || DEF[below]?.liquid) { this.set(wx, y - 1, wz, id, { data: c.d[i] || 0, mod: 1 }); this.set(wx, y, wz, BLOCK.AIR, { mod: 1 }); }
      }
    }
  }
  togglePower(x, y, z, on) { this.sd(x, y, z, on ? 1 : 0); this.power.add(this.bk(x, y, z)); this.powerTick(); }
  powerTick() {
    const q = Array.from(this.power).map((k) => ({ k, p: 15 })), seen = new Set(); this.power.clear();
    while (q.length) {
      const cur = q.shift(); if (seen.has(cur.k)) continue; seen.add(cur.k);
      const [x, y, z] = cur.k.split(",").map(Number), id = this.get(x, y, z);
      if (id === BLOCK.DOOR) this.sd(x, y, z, cur.p > 0 ? 1 : 0);
      if (id === BLOCK.PISTON && cur.p > 0) this.piston(x, y, z);
      if (cur.p <= 0) continue;
      for (const d of [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0]]) {
        const nx = x + d[0], ny = y + d[1], nz = z + d[2], nid = this.get(nx, ny, nz);
        if (nid === BLOCK.RED || nid === BLOCK.DOOR || nid === BLOCK.PISTON || nid === BLOCK.SWITCH) q.push({ k: this.bk(nx, ny, nz), p: cur.p - 1 });
      }
    }
  }
  piston(x, y, z) {
    const f = { x: x + 1, y, z }, t = { x: x + 2, y, z }, bid = this.get(f.x, f.y, f.z);
    if (bid !== BLOCK.AIR && this.get(t.x, t.y, t.z) === BLOCK.AIR) { this.set(t.x, t.y, t.z, bid, { mod: 1 }); this.set(f.x, f.y, f.z, BLOCK.AIR, { mod: 1 }); }
  }
  save() { return { seed: this.seed, pack: this.pack, dim: this.dimension, mod: Array.from(this.mod.entries()), tile: Array.from(this.tile.entries()) }; }
  load(v) {
    if (!v) return;
    this.seed = v.seed || this.seed;
    this.pack = typeof v.pack === "string" && PACKS[v.pack] ? v.pack : (PACKS[this.pack] ? this.pack : "classic");
    this.dimension = v.dim || this.dimension;
    this.atlas = buildAtlas(this.pack);
    this.applyGrassTextures();
    this.mod = new Map(v.mod || []);
    this.tile = new Map(v.tile || []);
    this.cd.clear();
    this.pending.clear();
    for (const k of this.loaded) this.dropMesh(k);
    this.loaded.clear();
  }
}
class AudioSys {
  constructor() { this.ctx = null; this.master = null; this.low = null; this.amb = null; this.music = 0; }
  on() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.35;
    this.low = this.ctx.createBiquadFilter(); this.low.type = "lowpass"; this.low.frequency.value = 2400;
    this.master.connect(this.low); this.low.connect(this.ctx.destination);
    const noise = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate); const arr = noise.getChannelData(0); for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() * 2 - 1) * 0.2;
    const s = this.ctx.createBufferSource(); s.buffer = noise; s.loop = true;
    const f = this.ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 290; f.Q.value = 0.7;
    const g = this.ctx.createGain(); g.gain.value = 0.05;
    s.connect(f); f.connect(g); g.connect(this.master); s.start();
  }
  setOccl(v) { if (this.low) this.low.frequency.value = lerp(420, 2600, clamp(1 - v, 0, 1)); }
  tone(fr, du = 0.08, ga = 0.05, ty = "square") {
    this.on();
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = ty; o.frequency.value = fr; g.gain.value = ga;
    o.connect(g); g.connect(this.master); o.start(t); g.gain.exponentialRampToValueAtTime(0.0001, t + du); o.stop(t + du + 0.02);
  }
  play(n) {
    if (n === "step") this.tone(140 + Math.random() * 40, 0.04, 0.03, "triangle");
    if (n === "break") this.tone(95, 0.06, 0.06, "sawtooth");
    if (n === "place") this.tone(220, 0.05, 0.05, "square");
    if (n === "hit") { this.tone(180, 0.07, 0.06, "square"); this.tone(80, 0.08, 0.05, "triangle"); }
    if (n === "hurt") this.tone(70, 0.16, 0.07, "sawtooth");
    if (n === "eat") this.tone(380, 0.06, 0.04, "triangle");
    if (n === "thunder") this.tone(60, 0.5, 0.1, "sawtooth");
    if (n === "xp") { this.tone(520, 0.08, 0.05, "triangle"); this.tone(660, 0.09, 0.04, "triangle"); }
    if (n === "ach") { this.tone(880, 0.11, 0.05, "triangle"); this.tone(1170, 0.11, 0.04, "triangle"); }
  }
  up(dt) {
    if (!this.ctx) return;
    this.music -= dt;
    if (this.music <= 0) {
      this.music = 22 + Math.random() * 24;
      const notes = [196, 247, 294, 392, 440, 523];
      let d = 0; for (let i = 0; i < 5; i++) { const f = notes[Math.floor(Math.random() * notes.length)]; setTimeout(() => this.tone(f, 0.23, 0.035, "sine"), d * 1000); d += 0.28; }
    }
  }
}

class Particles {
  constructor(scene, scale = 1, max = 420) { this.scene = scene; this.p = []; this.scale = scale; this.max = max; }
  burst(pos, hex = 0xffffff, n = 12, s = 2.5, life = 0.55) {
    const count = clamp(Math.floor(n * this.scale), 1, 120);
    if (this.p.length >= this.max) return;
    const col = new THREE.Color(hex);
    for (let i = 0; i < count && this.p.length < this.max; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 5), new THREE.MeshBasicMaterial({ color: col }));
      m.position.copy(pos); this.scene.add(m);
      this.p.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * s, Math.random() * s, (Math.random() - 0.5) * s), l: life + Math.random() * 0.3 });
    }
  }
  up(dt) {
    for (let i = this.p.length - 1; i >= 0; i--) {
      const q = this.p[i]; q.l -= dt; q.v.y -= 8 * dt; q.m.position.addScaledVector(q.v, dt);
      if (q.l <= 0) { q.m.geometry.dispose(); q.m.material.dispose(); this.scene.remove(q.m); this.p.splice(i, 1); }
    }
  }
}

class MobSys {
  constructor(game) {
    this.g = game; this.m = []; this.ar = []; this.v = [];
    this.spawn = 2; this.spawnInterval = 1.2; this.hostileCap = 10; this.passiveCap = 8;
    this.boss = 0; this.matCache = new Map();
  }
  setPerf(o = {}) {
    if (o.spawnInterval !== undefined) this.spawnInterval = clamp(o.spawnInterval, 0.7, 3.5);
    if (o.hostileCap !== undefined) this.hostileCap = clamp(Math.floor(o.hostileCap), 2, 20);
    if (o.passiveCap !== undefined) this.passiveCap = clamp(Math.floor(o.passiveCap), 2, 16);
  }
  clear() { this.m.forEach((x) => x.mesh && this.g.scene.remove(x.mesh)); this.ar.forEach((x) => this.g.scene.remove(x.mesh)); this.v.forEach((x) => this.g.scene.remove(x.mesh)); this.m = []; this.ar = []; this.v = []; this.boss = 0; }
  save() { return { m: this.m.map((x) => ({ t: x.t, p: x.p.toArray(), h: x.h, data: x.data })), boss: this.boss, v: this.v.map((x) => ({ t: x.t, p: x.p.toArray() })) }; }
  load(v) { this.clear(); if (!v) return; this.boss = !!v.boss; (v.m || []).forEach((x) => this.spawnMob(x.t, new THREE.Vector3(...x.p), { h: x.h, data: x.data })); (v.v || []).forEach((x) => this.spawnVehicle(x.t, new THREE.Vector3(...x.p))); }
  tag(text) {
    const c = document.createElement("canvas"); c.width = 256; c.height = 64; const ctx = c.getContext("2d");
    ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fillRect(0, 12, 256, 40); ctx.fillStyle = "white"; ctx.font = "28px sans-serif"; ctx.textAlign = "center"; ctx.fillText(text, 128, 42);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true })); s.scale.set(1.3, 0.34, 1); return s;
  }
  pxMat(name, baseHex, o = {}) {
    if (this.matCache.has(name)) return this.matCache.get(name);
    const seed = hs(`mob:${name}`);
    const size = o.size || 16;
    const noise = o.noise ?? 0.2;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    const base = hexRGB(baseHex);
    const pixels = ctx.createImageData(size, size);
    const d = pixels.data;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = ((hc(x, y, 0, seed) % 1000) / 1000 - 0.5) * noise;
      const shade = 1 + n;
      d[i] = clamp(Math.floor(base.r * shade), 0, 255);
      d[i + 1] = clamp(Math.floor(base.g * shade), 0, 255);
      d[i + 2] = clamp(Math.floor(base.b * shade), 0, 255);
      d[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    const spots = o.spots || [];
    for (let si = 0; si < spots.length; si++) {
      const s = spots[si];
      const col = `#${(s.color || 0xffffff).toString(16).padStart(6, "0")}`;
      const chance = s.chance ?? 0.1;
      const psize = s.psize || 1;
      ctx.fillStyle = col;
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        if (r01(x, y, si, seed + si * 17) > chance) continue;
        ctx.fillRect(x, y, psize, psize);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    const mat = new THREE.MeshLambertMaterial({ map: tex, color: 0xffffff });
    this.matCache.set(name, mat);
    return mat;
  }
  patMat(name, rows, pal, px = 2) {
    if (this.matCache.has(name)) return this.matCache.get(name);
    const h = rows.length, w = rows[0].length;
    const canvas = document.createElement("canvas");
    canvas.width = w * px; canvas.height = h * px;
    const ctx = canvas.getContext("2d");
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      const col = pal[ch] ?? pal.D ?? 0xff00ff;
      ctx.fillStyle = `#${col.toString(16).padStart(6, "0")}`;
      ctx.fillRect(x * px, y * px, px, px);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    const mat = new THREE.MeshLambertMaterial({ map: tex, color: 0xffffff });
    this.matCache.set(name, mat);
    return mat;
  }
  part(parent, sx, sy, sz, x, y, z, matOrColor) {
    const mat = typeof matOrColor === "number" ? new THREE.MeshLambertMaterial({ color: matOrColor }) : matOrColor;
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
    m.castShadow = true; m.receiveShadow = true; m.position.set(x, y, z); parent.add(m);
    return m;
  }
  leg(parent, x, z, o = {}) {
    const w = o.w || 0.2, h = o.h || 0.58, hip = o.hip || 0.56, hoofH = o.hoofH || 0.14;
    const c = o.col || 0x4f3320, hc = o.hoof || 0x1a1410;
    const g = new THREE.Group(); g.position.set(x, hip, z); parent.add(g);
    this.part(g, w, h - hoofH, w, 0, -(h - hoofH) / 2, 0, c);
    this.part(g, w + 0.02, hoofH, w + 0.02, 0, -h + hoofH / 2, 0, hc);
    return g;
  }
  cowModel(m) {
    const root = new THREE.Group();
    const pal = { D: 0x432f22, M: 0x4f3727, L: 0x5b4030, W: 0xe7edf2, G: 0x5f666c, K: 0x111111, P: 0xe3a9b5 };
    const flip = (rows) => rows.map((r) => r.split("").reverse().join(""));
    const bodyR = ["DDDDDDDDDDDD", "DDDDDDDDWDDD", "DDDDDDDWWWDD", "DDDDDDWWWWDD", "DDDWWWWWWDDD", "DDWWWWWDDDDD", "DDWWDDDDDDDD", "DDDDDDDDDDDD"];
    const bodyL = ["DDDDDDDDDDDD", "DDWDDDDDDDDD", "DWWWDDDDDDDD", "WWWWDDDDDDDD", "DWWWDDDDWWDD", "DDWDDDDWWWWD", "DDDDDDDWWWDD", "DDDDDDDDDDDD"];
    const bodyT = ["DDDDWDDDDDDD", "DDDWWWDDWDDD", "DDWWWWDWWWDD", "DDDWWWDDWDDD", "DDDDWDDDDDDD", "DDDDDDDDDDDD"];
    const bodyF = ["DDDDDDDD", "DDDDDDDD", "DDWWWWDD", "DWWWWWWD", "DWWWWWWD", "DDWWWWDD", "DDDDDDDD", "DDDDDDDD"];
    const bodyB = ["WWWDDDDD", "WWWWDDDD", "WWWDDDDD", "WWDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD"];
    const bodyBottom = ["DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD"];
    const bodyMats = [
      this.patMat("cow_body_r_fix", bodyR, pal, 2),
      this.patMat("cow_body_l_fix", bodyL, pal, 2),
      this.patMat("cow_body_t_fix", bodyT, pal, 2),
      this.patMat("cow_body_bt_fix", bodyBottom, pal, 2),
      this.patMat("cow_body_f_fix", bodyF, pal, 2),
      this.patMat("cow_body_b_fix", bodyB, pal, 2),
    ];
    const headR = ["DDDDPPDD", "DDDDPPDD", "DDDDDDDD", "DDDDDDWW", "DDDDDWWW", "DDDDDDWW", "DDDDDDDD", "DDDDDDDD"];
    const headL = flip(headR);
    const headT = ["DDDWDDDD", "DDWWWDDD", "DDDWWDDD", "DDDWDDDD", "DDDWDDDD", "DDDWDDDD", "DDDDDDDD", "DDDDDDDD"];
    const headF = ["DDDWDDDD", "DWWDWWDD", "DWKDWKWD", "DDDDDDDD", "DWWWWWWD", "WWGGGGWW", "WKGGGGKW", "DDWWWWDD"];
    const headB = ["DDDWDDDD", "DDWWWDDD", "DDDWDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD"];
    const headBottom = ["DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD", "DDDDDDDD"];
    const headMats = [
      this.patMat("cow_head_r_fix", headR, pal, 2),
      this.patMat("cow_head_l_fix", headL, pal, 2),
      this.patMat("cow_head_t_fix", headT, pal, 2),
      this.patMat("cow_head_bt_fix", headBottom, pal, 2),
      this.patMat("cow_head_f_fix", headF, pal, 2),
      this.patMat("cow_head_b_fix", headB, pal, 2),
    ];
    const legR = ["DDDD", "DDDD", "DDDD", "DDDD", "DDWD", "DWWD", "DDWD", "DDDD", "DDDD", "DDDD", "DDDD", "KKKK"];
    const legL = flip(legR);
    const legF = ["DDDD", "DDDD", "DDDD", "DDDD", "DDDD", "DDDD", "DDDD", "DDDD", "WWWW", "DDDD", "DDDD", "KKKK"];
    const legB = ["DDDD", "DDDD", "DDDD", "DDDD", "DDDD", "DDDD", "DDDD", "DDDD", "DDDD", "WWWW", "DDDD", "KKKK"];
    const legTop = ["DDDD", "DDDD", "DDDD", "DDDD"];
    const legBottom = ["KKKK", "KKKK", "KKKK", "KKKK"];
    const legMats = [
      this.patMat("cow_leg_r_fix", legR, pal, 2),
      this.patMat("cow_leg_l_fix", legL, pal, 2),
      this.patMat("cow_leg_t_fix", legTop, pal, 2),
      this.patMat("cow_leg_bt_fix", legBottom, pal, 2),
      this.patMat("cow_leg_f_fix", legF, pal, 2),
      this.patMat("cow_leg_b_fix", legB, pal, 2),
    ];

    // True Minecraft-like silhouette: narrow body (x), long body (z), legs at corners.
    this.part(root, 0.78, 0.64, 1.12, 0, 0.96, 0, bodyMats);
    this.part(root, 0.26, 0.06, 0.04, 0, 0.66, -0.38, 0xd9a1b3);
    const head = new THREE.Group(); head.position.set(0, 0.94, 0.78); root.add(head);
    this.part(head, 0.5, 0.46, 0.42, 0, 0.0, 0.08, headMats);
    this.part(head, 0.06, 0.12, 0.06, -0.16, 0.3, 0.08, 0x8d8f94);
    this.part(head, 0.06, 0.12, 0.06, 0.16, 0.3, 0.08, 0x8d8f94);
    m.legs = [
      this.leg(root, -0.24, 0.38, { w: 0.30, h: 0.66, hip: 0.64, col: legMats, hoof: 0x111111, hoofH: 0.06 }),
      this.leg(root, 0.24, 0.38, { w: 0.30, h: 0.66, hip: 0.64, col: legMats, hoof: 0x111111, hoofH: 0.06 }),
      this.leg(root, -0.24, -0.38, { w: 0.30, h: 0.66, hip: 0.64, col: legMats, hoof: 0x111111, hoofH: 0.06 }),
      this.leg(root, 0.24, -0.38, { w: 0.30, h: 0.66, hip: 0.64, col: legMats, hoof: 0x111111, hoofH: 0.06 }),
    ];
    m.phase = Math.random() * Math.PI * 2;
    return { root, yOff: 0, tagY: 1.86 };
  }
  sheepModel(m) {
    const root = new THREE.Group();
    const pal = { A: 0xe6e1e5, B: 0xd9d4d9, C: 0xc9c3c8, T: 0xa27d63, U: 0x875f49, W: 0xf6f5f6, K: 0x090909, P: 0xea9faa, Q: 0xd58e98 };
    const flip = (rows) => rows.map((r) => r.split("").reverse().join(""));
    const bodyR = ["AABBBBBBAAAA", "AABBBBBBAAAA", "AABBBBBBAAAA", "ABBBBAABBAAA", "ABBBAAAABAAA", "ABBAAAAABAAA", "ABBAAAAABAAA", "AABBBBBBAAAA"];
    const bodyL = flip(bodyR);
    const bodyT = ["AAAABBBBAAAA", "AAABBBBBBAAA", "AABBBBBBBBAA", "AABBBBBBBBAA", "AAABBBBBBAAA", "AAAABBBBAAAA"];
    const bodyF = ["AAAAAA", "AABBAA", "ABBBBA", "ABBBBA", "ABBBBA", "ABBBBA", "AABBAA", "AAAAAA"];
    const bodyB = ["AAAAAA", "AAABAA", "AABBAA", "ABBBBA", "ABBBBA", "AABBAA", "AAABAA", "AAAAAA"];
    const bodyBottom = ["AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA"];
    const bodyMats = [
      this.patMat("sheep_body_r_cowshape", bodyR, pal, 2),
      this.patMat("sheep_body_l_cowshape", bodyL, pal, 2),
      this.patMat("sheep_body_t_cowshape", bodyT, pal, 2),
      this.patMat("sheep_body_bt_cowshape", bodyBottom, pal, 2),
      this.patMat("sheep_body_f_cowshape", bodyF, pal, 2),
      this.patMat("sheep_body_b_cowshape", bodyB, pal, 2),
    ];
    const headR = ["AABBBBBB", "AABBBBBB", "AABBBBAA", "AABBBBAA", "AABBAAAA", "AABAAAAA", "AABAAAAA", "AAAAAAAA"];
    const headL = flip(headR);
    const headT = ["AAAAAABB", "AAAABBBB", "AAABBBBB", "AAABBBBB", "AAABBBBB", "AAAABBBB", "AAAAAABB", "AAAAAAAA"];
    const headF = ["AAAAAAAA", "AABBBBBA", "ATTTTTTA", "AKWTTWKA", "AUUTTTUA", "AWUTPPUA", "AAUTQPUA", "AAAAAAAA"];
    const headB = ["AAAAAAAA", "AAAABAAA", "AAABBBAA", "AAABBBAA", "AAAABAAA", "AAAAAAAA", "AAAAAAAA", "AAAAAAAA"];
    const headBottom = ["AAAAAAAA", "AAAAAAAA", "AAAAAAAA", "AAAAAAAA", "AAAAAAAA", "AAAAAAAA", "AAAAAAAA", "AAAAAAAA"];
    const headMats = [
      this.patMat("sheep_head_r_cowshape", headR, pal, 2),
      this.patMat("sheep_head_l_cowshape", headL, pal, 2),
      this.patMat("sheep_head_t_cowshape", headT, pal, 2),
      this.patMat("sheep_head_bt_cowshape", headBottom, pal, 2),
      this.patMat("sheep_head_f_cowshape", headF, pal, 2),
      this.patMat("sheep_head_b_cowshape", headB, pal, 2),
    ];
    const legR = ["AAAA", "AAAA", "AAAB", "AABB", "ABBB", "ABBB", "ABBB", "ABBB", "ABBB", "ABBB", "ABBB", "CCCC"];
    const legL = flip(legR);
    const legF = ["AAAA", "AAAA", "ABBA", "ABBA", "ABBA", "ABBA", "ABBA", "ABBA", "ABBA", "ABBA", "ABBA", "CCCC"];
    const legB = flip(legF);
    const legTop = ["AAAA", "AAAA", "AAAA", "AAAA"];
    const legBottom = ["CCCC", "CCCC", "CCCC", "CCCC"];
    const legPal = { A: 0xcba884, B: 0xbc9370, C: 0x8e694f };
    const legMats = [
      this.patMat("sheep_leg_r_cowshape", legR, legPal, 2),
      this.patMat("sheep_leg_l_cowshape", legL, legPal, 2),
      this.patMat("sheep_leg_t_cowshape", legTop, legPal, 2),
      this.patMat("sheep_leg_bt_cowshape", legBottom, legPal, 2),
      this.patMat("sheep_leg_f_cowshape", legF, legPal, 2),
      this.patMat("sheep_leg_b_cowshape", legB, legPal, 2),
    ];

    // Same silhouette as current cow model: body/head placement and leg rig.
    this.part(root, 0.78, 0.64, 1.12, 0, 0.96, 0, bodyMats);
    const head = new THREE.Group(); head.position.set(0, 0.94, 0.78); root.add(head);
    this.part(head, 0.5, 0.46, 0.42, 0, 0.0, 0.08, headMats);
    // No horns for sheep.
    m.legs = [
      this.leg(root, -0.24, 0.38, { w: 0.30, h: 0.66, hip: 0.64, col: legMats, hoof: 0x6c513d, hoofH: 0.06 }),
      this.leg(root, 0.24, 0.38, { w: 0.30, h: 0.66, hip: 0.64, col: legMats, hoof: 0x6c513d, hoofH: 0.06 }),
      this.leg(root, -0.24, -0.38, { w: 0.30, h: 0.66, hip: 0.64, col: legMats, hoof: 0x6c513d, hoofH: 0.06 }),
      this.leg(root, 0.24, -0.38, { w: 0.30, h: 0.66, hip: 0.64, col: legMats, hoof: 0x6c513d, hoofH: 0.06 }),
    ];
    m.phase = Math.random() * Math.PI * 2;
    return { root, yOff: 0, tagY: 1.86 };
  }
  animateLegs(m, dt) {
    if (!m.legs?.length) return;
    const speed = Math.hypot(m.v.x, m.v.z);
    const amp = Math.min(0.35, speed * 0.18);
    const t = performance.now() * 0.01 + (m.phase || 0);
    const targetA = Math.sin(t) * amp;
    const targetB = -targetA;
    const blend = clamp(dt * (speed > 0.05 ? 14 : 8), 0, 1);
    m.legs[0].rotation.x = lerp(m.legs[0].rotation.x, targetA, blend);
    m.legs[1].rotation.x = lerp(m.legs[1].rotation.x, targetB, blend);
    m.legs[2].rotation.x = lerp(m.legs[2].rotation.x, targetB, blend);
    m.legs[3].rotation.x = lerp(m.legs[3].rotation.x, targetA, blend);
  }
  spawnVehicle(t, p) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(t === "boat" ? 1.2 : 0.9, 0.4, t === "boat" ? 2 : 1.1), new THREE.MeshLambertMaterial({ color: t === "boat" ? 0x8b5b2f : 0x777777 }));
    mesh.castShadow = true; mesh.receiveShadow = true; mesh.position.copy(p); this.g.scene.add(mesh);
    const v = { t, p: p.clone(), vel: new THREE.Vector3(), mesh, rider: null }; this.v.push(v); return v;
  }
  spawnMob(t, p, o = {}) {
    const m = { t, p: p.clone(), v: new THREE.Vector3(), g: 0, h: 10, mh: 10, sp: 2, cd: 0, path: [], pt: 0, wt: 0, data: {}, dead: 0 };
    if (t === "cow" || t === "sheep") { m.h = 8; m.mh = 8; m.sp = 1.3; }
    if (t === "zombie") { m.h = 14; m.mh = 14; m.sp = 2.1; }
    if (t === "skeleton") { m.h = 12; m.mh = 12; m.sp = 1.9; }
    if (t === "trader") { m.h = 20; m.mh = 20; m.sp = 1.1; m.data.tr = [{ g: { emerald: 2 }, t: { bread: 1 } }, { g: { emerald: 5 }, t: { iron_pickaxe: 1 } }, { g: { emerald: 8 }, t: { sword: 1 } }]; }
    if (t === "golem") { m.h = 120; m.mh = 120; m.sp = 1.5; }
    if (o.h) m.h = o.h; if (o.data) m.data = o.data;
    let model = null;
    if (t === "cow") model = this.cowModel(m);
    else if (t === "sheep") model = this.sheepModel(m);
    if (model) {
      m.mesh = model.root;
      m.yOff = model.yOff || 0;
      m.tagY = model.tagY || 1.8;
    } else {
      const color = { zombie: 0x4f9662, skeleton: 0xd5d8e6, trader: 0x5f7ce2, golem: 0x888888 }[t] || 0xffffff;
      const h = t === "golem" ? 2.8 : 1.6;
      m.mesh = new THREE.Mesh(new THREE.BoxGeometry(t === "golem" ? 1.3 : 0.9, h, 0.9), new THREE.MeshLambertMaterial({ color }));
      m.mesh.castShadow = true; m.mesh.receiveShadow = true;
      m.yOff = h / 2;
      m.tagY = h / 2 + 0.35;
    }
    m.mesh.position.copy(p).add(new THREE.Vector3(0, m.yOff, 0));
    const tg = this.tag(t === "trader" ? "Trader" : t); tg.position.set(0, m.tagY, 0); m.mesh.add(tg);
    this.g.scene.add(m.mesh); this.m.push(m); return m;
  }
  near(x, y, z, r) { let c = 0; for (const m of this.m) if (!m.dead && m.p.distanceToSquared(new THREE.Vector3(x, y, z)) <= r * r) c++; return c; }
  attack(rayO, rayD) {
    if (this.g.p.at > 0) return 0;
    let best = null, bd = 3.1;
    for (const m of this.m) {
      if (m.dead) continue;
      const to = m.p.clone().sub(rayO), pr = to.dot(rayD); if (pr < 0 || pr > 3.1) continue;
      const c = rayO.clone().addScaledVector(rayD, pr), dist = c.distanceTo(m.p.clone().add(new THREE.Vector3(0, 0.8, 0)));
      if (dist < 0.9 && pr < bd) { bd = pr; best = m; }
    }
    if (!best) return 0;
    const s = this.g.inv.selSlot();
    let dmg = s.id && ITEM[s.id]?.weapon ? ITEM[s.id].weapon : 2;
    if (s.e?.sharpness) dmg += s.e.sharpness;
    best.h -= dmg; this.g.p.at = 0.45; this.g.audio.play("hit"); this.g.pfx.burst(best.p.clone().add(new THREE.Vector3(0, 1, 0)), 0xff4444, 7, 2.2, 0.35);
    if (s.id && ITEM[s.id]?.dur) { s.d -= 1; this.g.inv.cleanDur(); }
    if (best.h <= 0) { this.kill(best); this.g.xp(best.t === "golem" ? 25 : 6); }
    return 1;
  }
  kill(m) {
    m.dead = 1; this.g.scene.remove(m.mesh); this.g.pfx.burst(m.p.clone().add(new THREE.Vector3(0, 1, 0)), 0xffe0a8, 24, 3.8, 0.9);
    if (m.t === "cow" || m.t === "sheep") this.g.drop(m.p, "raw_meat", 1 + Math.floor(Math.random() * 2));
    if (m.t === "zombie") this.g.drop(m.p, "coal", 1);
    if (m.t === "skeleton") this.g.drop(m.p, "stick", 2);
    if (m.t === "golem") { this.g.drop(m.p, "emerald", 10); this.g.ach("boss_down", "Defeat the Stone Golem"); }
  }
  path(m, target) {
    const st = { x: Math.floor(m.p.x), z: Math.floor(m.p.z) }, go = { x: Math.floor(target.x), z: Math.floor(target.z) }, w = this.g.world;
    const open = new Map(), closed = new Set(), dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    open.set(`${st.x},${st.z}`, { ...st, g: 0, h: Math.abs(go.x - st.x) + Math.abs(go.z - st.z), p: null });
    let it = 0;
    while (open.size && it < 90) {
      it++;
      let bk = null, bn = null;
      for (const [k, n] of open) if (!bn || n.g + n.h < bn.g + bn.h) { bn = n; bk = k; }
      open.delete(bk); closed.add(bk);
      if (bn.x === go.x && bn.z === go.z) {
        const out = []; let cur = bn; while (cur) { out.push({ x: cur.x + 0.5, z: cur.z + 0.5 }); cur = cur.p; } out.reverse(); return out;
      }
      for (const d of dirs) {
        const nx = bn.x + d[0], nz = bn.z + d[1], nk = `${nx},${nz}`; if (closed.has(nk)) continue;
        const sy = w.surface(nx, nz), walk = !w.isSolid(nx, sy + 1, nz) && !w.isLiquid(nx, sy + 1, nz);
        if (!walk) continue;
        const g = bn.g + 1, h = Math.abs(go.x - nx) + Math.abs(go.z - nz), ex = open.get(nk);
        if (!ex || g < ex.g) open.set(nk, { x: nx, z: nz, g, h, p: bn });
      }
    }
    return [];
  }
  move(ent, dt, r = 0.35, h = 1.5) {
    const pos = ent.p.clone(), v = ent.v;
    pos.x += v.x * dt; if (this.col(pos, r, h)) { pos.x -= v.x * dt; v.x = 0; }
    pos.z += v.z * dt; if (this.col(pos, r, h)) { pos.z -= v.z * dt; v.z = 0; }
    pos.y += v.y * dt; if (this.col(pos, r, h)) { if (v.y < 0) ent.g = 1; pos.y -= v.y * dt; v.y = 0; } else ent.g = 0;
    ent.p.copy(pos);
  }
  col(pos, r, h) {
    const mnx = Math.floor(pos.x - r), mxx = Math.floor(pos.x + r), mny = Math.floor(pos.y), mxy = Math.floor(pos.y + h), mnz = Math.floor(pos.z - r), mxz = Math.floor(pos.z + r);
    for (let x = mnx; x <= mxx; x++) for (let y = mny; y <= mxy; y++) for (let z = mnz; z <= mxz; z++) {
      const id = this.g.world.get(x, y, z), d = DEF[id]; if (!d?.solid || d.liquid || d.trans) continue; if (id === BLOCK.DOOR && this.g.world.gd(x, y, z) > 0) continue; return 1;
    }
    return 0;
  }
  up(dt) {
    const p = this.g.p, w = this.g.world;
    this.spawn -= dt;
    if (this.spawn <= 0) {
      this.spawn = this.spawnInterval;
      const tn = (this.g.time % 24000) / 24000, night = Math.sin(tn * Math.PI * 2) < 0;
      for (let i = 0; i < 2; i++) {
        const a = Math.random() * Math.PI * 2, dist = 18 + Math.random() * 22;
        const x = Math.floor(p.pos.x + Math.cos(a) * dist), z = Math.floor(p.pos.z + Math.sin(a) * dist), y = w.surface(x, z) + 1;
        if (Math.abs(y - p.pos.y) > 18) continue;
        const l = w.lightAt(x, y, z, tn);
        if (night && l <= 6 && this.near(x, y, z, 24) < this.hostileCap) this.spawnMob(Math.random() < 0.6 ? "zombie" : "skeleton", new THREE.Vector3(x + 0.5, y, z + 0.5));
        else if (!night && w.get(x, y - 1, z) === BLOCK.GRASS && this.near(x, y, z, 24) < this.passiveCap) this.spawnMob(Math.random() < 0.5 ? "cow" : "sheep", new THREE.Vector3(x + 0.5, y, z + 0.5));
      }
      for (const k of w.loaded) { const c = w.ensure(...k.split(",").map(Number)); if (!c.mob) { c.mob = 1; if (c.village) this.spawnMob("trader", new THREE.Vector3(c.village.x + 0.5, c.village.y, c.village.z + 0.5)); } }
      if (!this.boss && this.g.p.lv >= 5 && night && Math.random() < 0.02) { this.boss = 1; const x = p.pos.x + 30, z = p.pos.z + 18, y = w.surface(Math.floor(x), Math.floor(z)) + 1; this.spawnMob("golem", new THREE.Vector3(x, y, z)); this.g.chat("Boss approaching: Stone Golem awakened."); }
    }
    for (let i = this.ar.length - 1; i >= 0; i--) {
      const a = this.ar[i]; a.l -= dt; a.v.y -= 12 * dt; a.p.addScaledVector(a.v, dt); a.mesh.position.copy(a.p); a.mesh.lookAt(a.p.clone().add(a.v));
      const id = w.get(Math.floor(a.p.x), Math.floor(a.p.y), Math.floor(a.p.z));
      if ((id !== BLOCK.AIR && id !== BLOCK.WATER) || a.l <= 0 || a.p.distanceTo(p.pos) < 1.0) {
        if (a.p.distanceTo(p.pos) < 1.0) this.g.damage(2 + Math.random() * 2, "arrow");
        this.g.scene.remove(a.mesh); this.ar.splice(i, 1);
      }
    }
    for (const v of this.v) if (v.rider === "player") {
      const mv = this.g.moveIn();
      const f = new THREE.Vector3(Math.sin(this.g.yaw), 0, Math.cos(this.g.yaw)), r = new THREE.Vector3(-f.z, 0, f.x);
      v.vel.x = (f.x * mv.z + r.x * mv.x) * 4; v.vel.z = (f.z * mv.z + r.z * mv.x) * 4;
      if (v.t === "boat") v.p.y = w.surface(Math.floor(v.p.x), Math.floor(v.p.z)) + 1.2;
      else if (w.get(Math.floor(v.p.x), Math.floor(v.p.y - 0.7), Math.floor(v.p.z)) !== BLOCK.RAIL) v.vel.multiplyScalar(0.2);
      v.p.addScaledVector(v.vel, dt); v.mesh.position.copy(v.p); p.pos.copy(v.p).add(new THREE.Vector3(0, 1.1, 0));
    }
    for (let i = this.m.length - 1; i >= 0; i--) {
      const m = this.m[i]; if (m.dead) { this.m.splice(i, 1); continue; }
      m.cd = Math.max(0, m.cd - dt); m.pt -= dt; m.wt -= dt;
      if (m.t === "cow" || m.t === "sheep") {
        if (m.wt <= 0) { m.wt = 1 + Math.random() * 3; m.data.dir = new THREE.Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize(); }
        m.v.x = (m.data.dir?.x || 0) * m.sp; m.v.z = (m.data.dir?.y || 0) * m.sp;
      } else if (m.t === "trader") m.v.set(0, 0, 0);
      else {
        const dist = m.p.distanceTo(p.pos);
        if (dist < 28) {
          if (m.pt <= 0) { m.pt = 1; m.path = this.path(m, p.pos); }
          if (m.path.length > 1) {
            const n = m.path[1], d = new THREE.Vector3(n.x - m.p.x, 0, n.z - m.p.z);
            if (d.lengthSq() < 0.2) m.path.shift(); else { d.normalize(); m.v.x = d.x * m.sp; m.v.z = d.z * m.sp; }
          } else {
            const d = p.pos.clone().sub(m.p); d.y = 0; if (d.lengthSq() > 0.001) { d.normalize(); m.v.x = d.x * m.sp; m.v.z = d.z * m.sp; }
          }
          if (m.t === "skeleton" && dist < 14 && dist > 4 && m.cd <= 0) {
            m.cd = 2.2;
            const d = p.pos.clone().add(new THREE.Vector3(0, 1.2, 0)).sub(m.p.clone().add(new THREE.Vector3(0, 1.2, 0))).normalize();
            const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), new THREE.MeshBasicMaterial({ color: 0xd5d8e6 })); mesh.rotation.z = Math.PI / 2; this.g.scene.add(mesh);
            this.ar.push({ p: m.p.clone().add(new THREE.Vector3(0, 1.2, 0)), v: d.multiplyScalar(14), l: 6, mesh });
          }
          if ((m.t === "zombie" || m.t === "golem") && dist < (m.t === "golem" ? 2.6 : 1.8) && m.cd <= 0) { m.cd = m.t === "golem" ? 1.8 : 1.1; this.g.damage(m.t === "golem" ? 8 : 3, m.t); }
        } else { m.v.x = 0; m.v.z = 0; }
      }
      m.v.y -= 18 * dt; this.move(m, dt, 0.35, m.t === "golem" ? 2.7 : 1.5);
      this.animateLegs(m, dt);
      m.mesh.position.set(m.p.x, m.p.y + (m.yOff ?? (m.t === "golem" ? 1.4 : 0.8)), m.p.z);
      const tr = Math.atan2(m.v.x, m.v.z); if (Math.abs(m.v.x) + Math.abs(m.v.z) > 0.05) m.mesh.rotation.y = lerp(m.mesh.rotation.y, tr, 0.15);
      if (m.p.y < -15) this.kill(m);
    }
  }
}

class Game {
  constructor() {
    this.perf = {
      low: LOW_END_DEVICE,
      antialias: !LOW_END_DEVICE,
      shadows: !LOW_END_DEVICE,
      pixelRatioMax: LOW_END_DEVICE ? 1 : 2,
      cloudCount: LOW_END_DEVICE ? 14 : 35,
      rainCount: LOW_END_DEVICE ? 300 : 1200,
      mapInterval: LOW_END_DEVICE ? 0.75 : 0.25,
      mapRadius: LOW_END_DEVICE ? 22 : 36,
      mapStep: LOW_END_DEVICE ? 2 : 1,
      world: LOW_END_DEVICE ? { rebuildBudget: 2, chunkLights: 0, fluidLimit: 120, decayLimit: 60, fireLimit: 60 } : { rebuildBudget: 5, chunkLights: 8, fluidLimit: 220, decayLimit: 100, fireLimit: 100 },
      particles: LOW_END_DEVICE ? { scale: 0.45, max: 180 } : { scale: 1, max: 420 },
      mobs: LOW_END_DEVICE ? { spawnInterval: 1.9, hostileCap: 6, passiveCap: 5 } : { spawnInterval: 1.2, hostileCap: 10, passiveCap: 8 },
    };
    this.canvas = document.getElementById("game");
    this.r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: this.perf.antialias, alpha: false });
    this.r.shadowMap.enabled = this.perf.shadows; this.r.shadowMap.type = THREE.PCFSoftShadowMap; this.r.setPixelRatio(Math.min(this.perf.pixelRatioMax, window.devicePixelRatio)); this.r.setSize(window.innerWidth, window.innerHeight);
    this.scene = new THREE.Scene(); this.scene.fog = new THREE.Fog(0xa7c8f9, 20, 170);
    this.cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 400);
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(240, 24, 24), new THREE.MeshBasicMaterial({ color: 0x9ec9ff, side: THREE.BackSide })); this.scene.add(this.sky);
    this.sun = new THREE.DirectionalLight(0xffffff, 1.0); this.sun.position.set(20, 40, 20); this.sun.castShadow = this.perf.shadows; this.sun.shadow.mapSize.set(this.perf.low ? 512 : 1024, this.perf.low ? 512 : 1024); this.sun.shadow.camera.left = -80; this.sun.shadow.camera.right = 80; this.sun.shadow.camera.top = 80; this.sun.shadow.camera.bottom = -80; this.sun.shadow.camera.near = 1; this.sun.shadow.camera.far = 180; this.scene.add(this.sun);
    this.amb = new THREE.AmbientLight(0x88aacc, 0.45); this.scene.add(this.amb);
    this.sunBall = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffeb99 })); this.moon = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), new THREE.MeshBasicMaterial({ color: 0xe5ecff })); this.scene.add(this.sunBall); this.scene.add(this.moon);
    this.clouds = new THREE.Group(); for (let i = 0; i < this.perf.cloudCount; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(8 + Math.random() * 12, 1 + Math.random() * 1.8, 4 + Math.random() * 7), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })); c.position.set((Math.random() - 0.5) * 240, 50 + Math.random() * 18, (Math.random() - 0.5) * 240); this.clouds.add(c); } this.scene.add(this.clouds);
    this.weatherSys(); this.scene.add(this.rain.points);
    this.world = new World(this.scene, Math.floor(Math.random() * 1e9));
    this.world.setPerf(this.perf.world);
    this.inv = new Inventory(); this.audio = new AudioSys(); this.pfx = new Particles(this.scene, this.perf.particles.scale, this.perf.particles.max); this.mobs = new MobSys(this); this.mobs.setPerf(this.perf.mobs);
    this.breakFx = this.mkBreakFx();
    this.p = { pos: new THREE.Vector3(8.5, 45, 8.5), vel: new THREE.Vector3(), g: 0, swim: 0, hp: 20, hu: 20, ox: 20, xp: 0, lv: 1, creative: 0, sprint: 0, at: 0, bt: null, bp: 0, fs: 0, mount: null, emo: 0, data: {} };
    this.pm = this.playerModel(); this.scene.add(this.pm);
    this.yaw = 0; this.pitch = 0; this.third = 0;
    this.keys = new Set(); this.md = { l: 0, r: 0 }; this.placeCd = 0; this.useCd = 0; this.foodCd = 0; this.step = 0; this.acc = 0; this.time = 6000; this.replay = []; this.replayGhost = null; this.replayOn = 0; this.achs = new Set(); this.chatOpen = 0; this.items = []; this.plugins = window.WebCraftPlugins || [];
    this.invCursor = mk(); this.invMouse = { x: -999, y: -999 };
    this.mapCd = 0; this.loadCd = 0;
    this.perfAnnounced = false;
    this.ui = this.bindUI(); this.events(); this.setTitleSplash(); this.newWorld(Math.floor(Math.random() * 1e9), "slot1");
    if (MOBILE) { document.getElementById("touch-controls").classList.remove("hidden"); this.touch(); }
    this.last = performance.now(); requestAnimationFrame(this.loop.bind(this));
  }
  mkCrackTex(stage) {
    const size = 64, c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = `rgba(0,0,0,${0.15 + stage * 0.07})`;
    ctx.lineCap = "square";
    const lines = 8 + stage * 5;
    for (let i = 0; i < lines; i++) {
      const seed = 9000 + stage * 131 + i * 17;
      const x0 = hc(i, 1, 1, seed) % size, y0 = hc(i, 2, 2, seed) % size;
      let x = x0, y = y0, seg = 3 + (hc(i, 3, 3, seed) % 4);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let s = 0; s < seg; s++) {
        x = clamp(x + (hc(i, s, 4, seed) % 19) - 9, 0, size - 1);
        y = clamp(y + (hc(i, s, 5, seed) % 19) - 9, 0, size - 1);
        ctx.lineTo(x, y);
      }
      ctx.lineWidth = 1 + ((hc(i, 6, 6, seed) % (stage >= 6 ? 2 : 1)));
      ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.needsUpdate = true;
    return t;
  }
  mkBreakFx() {
    const tex = Array.from({ length: 10 }, (_, i) => this.mkCrackTex(i));
    const mats = Array.from({ length: 6 }, () => new THREE.MeshBasicMaterial({ map: tex[0], transparent: true, opacity: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, toneMapped: false }));
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.01, 1.01, 1.01), mats);
    mesh.visible = false;
    mesh.renderOrder = 40;
    this.scene.add(mesh);
    return { mesh, mats, tex, key: null, stage: -1 };
  }
  showBreakFx(x, y, z, prog) {
    if (!this.breakFx) return;
    const key = `${x},${y},${z}`;
    const stage = clamp(Math.floor(prog * 10), 0, 9);
    if (this.breakFx.key !== key) {
      this.breakFx.key = key;
      this.breakFx.mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
    }
    if (stage !== this.breakFx.stage) {
      this.breakFx.stage = stage;
      const tex = this.breakFx.tex[stage];
      this.breakFx.mats.forEach((m) => { m.map = tex; m.needsUpdate = true; });
    }
    this.breakFx.mesh.visible = true;
  }
  clearBreakFx() {
    if (!this.breakFx) return;
    this.breakFx.mesh.visible = false;
    this.breakFx.key = null;
    this.breakFx.stage = -1;
  }
  weatherSys() {
    const n = this.perf?.rainCount || 1200, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 60; p[i * 3 + 1] = Math.random() * 40; p[i * 3 + 2] = (Math.random() - 0.5) * 60; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    this.rain = { points: new THREE.Points(g, new THREE.PointsMaterial({ color: 0x97bff8, size: 0.1, transparent: true, opacity: 0.6 })), n };
    this.rain.points.visible = false; this.weather = { t: "clear", timer: 24, i: 0 };
  }
  playerModel() {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.35), new THREE.MeshLambertMaterial({ color: 0xd5a07a }));
    m.castShadow = true; m.receiveShadow = true; const tg = this.mobs.tag("You"); tg.position.set(0, 1.35, 0); m.add(tg); return m;
  }
  bindUI() {
    const u = {
      healthFill: document.getElementById("health-fill"), hungerFill: document.getElementById("hunger-fill"), xpFill: document.getElementById("xp-fill"), oxygenFill: document.getElementById("oxygen-fill"), healthText: document.getElementById("health-text"), hungerText: document.getElementById("hunger-text"), xpText: document.getElementById("xp-text"), oxygenText: document.getElementById("oxygen-text"), modePill: document.getElementById("mode-pill"), coords: document.getElementById("coords"), clock: document.getElementById("clock"), hotbar: document.getElementById("hotbar"), hint: document.getElementById("interaction-hint"), map: document.getElementById("minimap"), menu: document.getElementById("menu-panel"), titleSplash: document.getElementById("title-splash"), invP: document.getElementById("inventory-panel"), craftP: document.getElementById("crafting-panel"), furP: document.getElementById("furnace-panel"), chestP: document.getElementById("chest-panel"), enchP: document.getElementById("enchant-panel"), setP: document.getElementById("settings-panel"), chatP: document.getElementById("chat-panel"), chatLog: document.getElementById("chat-log"), chatIn: document.getElementById("chat-input"), invG: document.getElementById("inventory-grid"), rec: document.getElementById("crafting-recipes"), chestG: document.getElementById("chest-grid"), enchO: document.getElementById("enchant-options"), fi: document.getElementById("furnace-input"), ff: document.getElementById("furnace-fuel"), fs: document.getElementById("furnace-start"), fst: document.getElementById("furnace-status"), rd: document.getElementById("render-distance"), pack: document.getElementById("texture-pack"), skin: document.getElementById("skin-color"), slot: document.getElementById("world-slot"), seed: document.getElementById("seed-input")
    };
    u.hotbar.innerHTML = ""; for (let i = 0; i < 9; i++) { const s = document.createElement("div"); s.className = "slot"; s.dataset.i = i; u.hotbar.append(s); }
    u.fs.addEventListener("click", () => this.startSmelt());
    document.querySelectorAll("[data-close]").forEach((e) => e.addEventListener("click", () => { document.getElementById(e.dataset.close).classList.add("hidden"); this.lockIf(); }));
    document.getElementById("start-new").addEventListener("click", () => { const t = u.seed.value.trim(), seed = t ? (Number(t) || hs(t)) : Math.floor(Math.random() * 1e9); this.newWorld(seed, u.slot.value); u.menu.classList.add("hidden"); this.lock(); });
    document.getElementById("load-world").addEventListener("click", () => { this.loadWorld(u.slot.value); u.menu.classList.add("hidden"); this.lock(); });
    document.getElementById("open-options")?.addEventListener("click", () => {
      this.ui.setP.classList.remove("hidden");
    });
    u.rd.addEventListener("input", () => this.world.setRD(Number(u.rd.value)));
    if (this.perf.low) {
      u.rd.max = "4";
      if (Number(u.rd.value) > 4) u.rd.value = "4";
    }
    u.pack.addEventListener("change", () => this.world.setPack(u.pack.value));
    u.skin.addEventListener("input", () => this.pm.material.color.set(u.skin.value));
    document.getElementById("toggle-third-person").addEventListener("click", () => { this.third = !this.third; });
    document.getElementById("toggle-creative").addEventListener("click", () => this.toggleCreative());
    document.getElementById("take-screenshot").addEventListener("click", () => this.shot());
    u.oxygenRow = document.getElementById("oxygen-fill").closest(".bar-row");
    u.invCursor = document.getElementById("inventory-cursor");
    if (!u.invCursor) {
      u.invCursor = document.createElement("div");
      u.invCursor.id = "inventory-cursor";
      u.invCursor.className = "hidden";
      document.body.append(u.invCursor);
    }
    return u;
  }
  setTitleSplash() {
    if (!this.ui?.titleSplash) return;
    this.ui.titleSplash.textContent = randomSplash();
  }
  touch() {
    const stick = document.getElementById("stick-left"), btns = document.querySelectorAll("#touch-buttons button");
    let aid = null; const c = { x: 0, y: 0 }; this.tmv = { x: 0, z: 0 };
    const up = (e) => { if (aid === null) return; const t = Array.from(e.touches).find((q) => q.identifier === aid); if (!t) return; this.tmv.x = clamp((t.clientX - c.x) / 38, -1, 1); this.tmv.z = -clamp((t.clientY - c.y) / 38, -1, 1); };
    stick.addEventListener("touchstart", (e) => { const r = stick.getBoundingClientRect(); c.x = r.left + r.width / 2; c.y = r.top + r.height / 2; aid = e.changedTouches[0].identifier; up(e); e.preventDefault(); }, { passive: false });
    stick.addEventListener("touchmove", (e) => { up(e); e.preventDefault(); }, { passive: false });
    stick.addEventListener("touchend", (e) => { if (Array.from(e.changedTouches).some((q) => q.identifier === aid)) { aid = null; this.tmv.x = 0; this.tmv.z = 0; } });
    btns.forEach((b) => {
      b.addEventListener("touchstart", (e) => { const a = b.dataset.touch; if (a === "jump") this.keys.add("Space"); if (a === "place") this.md.r = 1; if (a === "break") this.md.l = 1; if (a === "inventory") this.tPanel(this.ui.invP); e.preventDefault(); }, { passive: false });
      b.addEventListener("touchend", (e) => { const a = b.dataset.touch; if (a === "jump") this.keys.delete("Space"); if (a === "place") this.md.r = 0; if (a === "break") this.md.l = 0; e.preventDefault(); }, { passive: false });
    });
  }
  events() {
    window.addEventListener("resize", () => { this.cam.aspect = window.innerWidth / window.innerHeight; this.cam.updateProjectionMatrix(); this.r.setSize(window.innerWidth, window.innerHeight); });
    this.canvas.addEventListener("click", () => { if (!this.anyOpen()) this.lock(); this.audio.on(); });
    document.addEventListener("pointerlockchange", () => { if (document.pointerLockElement !== this.canvas) { this.md.l = 0; this.md.r = 0; this.p.bt = null; this.p.bp = 0; this.clearBreakFx(); } });
    document.addEventListener("mousemove", (e) => { this.invMouse.x = e.clientX; this.invMouse.y = e.clientY; this.rInvCursor(); if (document.pointerLockElement !== this.canvas) return; this.yaw -= e.movementX * 0.0024; this.pitch -= e.movementY * 0.0024; this.pitch = clamp(this.pitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01); });
    document.addEventListener("mousedown", (e) => { if (this.anyOpen()) return; if (e.button === 0) this.md.l = 1; if (e.button === 2) this.md.r = 1; if (document.pointerLockElement === this.canvas) e.preventDefault(); });
    document.addEventListener("mouseup", (e) => { if (e.button === 0) { this.md.l = 0; this.p.bt = null; this.p.bp = 0; this.clearBreakFx(); } if (e.button === 2) this.md.r = 0; });
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("wheel", (e) => { if (this.anyOpen()) return; this.inv.sel = (this.inv.sel + Math.sign(e.deltaY) + 9) % 9; this.rHot(); });
    document.addEventListener("keydown", (e) => {
      if (this.chatOpen && e.code !== "Escape") return;
      this.keys.add(e.code);
      if (e.code.startsWith("Digit")) { const n = Number(e.code.replace("Digit", "")); if (n >= 1 && n <= 9) { this.inv.sel = n - 1; this.rHot(); } }
      if (e.code === "KeyE") this.tPanel(this.ui.invP);
      if (e.code === "KeyC") this.tPanel(this.ui.craftP);
      if (e.code === "KeyO") this.tPanel(this.ui.setP);
      if (e.code === "KeyT") this.tChat();
      if (e.code === "F5") { e.preventDefault(); this.third = !this.third; }
      if (e.code === "KeyM") this.toggleCreative();
      if (e.code === "KeyR") this.tReplay();
      if (e.code === "KeyB") { this.p.data.brush = !this.p.data.brush; this.chat(`Terrain brush ${this.p.data.brush ? "enabled" : "disabled"}.`); }
      if (e.code === "KeyP") this.shot();
      if (e.code === "KeyL") this.portal();
      if (e.code === "KeyF") this.interact();
      if (e.code === "KeyQ") this.dropSel();
      if (e.code === "Escape") { this.ui.setP.classList.remove("hidden"); document.exitPointerLock(); }
    });
    document.addEventListener("keyup", (e) => this.keys.delete(e.code));
    this.ui.chatIn.addEventListener("keydown", (e) => { if (e.key !== "Enter") return; const t = this.ui.chatIn.value.trim(); this.ui.chatIn.value = ""; if (t) this.cmd(t); });
  }
  cmd(t) {
    if (t.startsWith("/")) {
      const [c, ...r] = t.slice(1).split(" ");
      if (c === "seed") this.chat(`Seed: ${this.world.seed}`);
      if (c === "time") { const n = Number(r[0]); if (!Number.isNaN(n)) this.time = ((n % 24000) + 24000) % 24000; }
      if (c === "gamemode") { if (r[0] === "creative") this.p.creative = 1; if (r[0] === "survival") this.p.creative = 0; }
      if (c === "give") { const id = r[0], ct = Number(r[1]) || 1; if (ITEM[id]) { this.inv.add(id, ct); this.chat(`Given ${ct} ${id}`); this.rHot(); } }
      if (c === "brush") { this.p.data.bBlock = r[0] || "stone"; this.p.data.bRadius = Number(r[1]) || 2; this.p.data.brush = 1; this.chat(`Brush set to ${this.p.data.bBlock} radius ${this.p.data.bRadius}`); }
      if (c === "emote") this.p.emo = 2.5;
      if (c === "save") { this.saveWorld(this.slot); this.chat("World saved."); }
      return;
    }
    this.chat(`You: ${t}`);
  }
  tChat() { this.chatOpen = !this.chatOpen; this.ui.chatP.classList.toggle("hidden", !this.chatOpen); if (this.chatOpen) { document.exitPointerLock(); this.ui.chatIn.focus(); } else this.lockIf(); }
  chat(m) { const d = document.createElement("div"); d.textContent = m; this.ui.chatLog.append(d); this.ui.chatLog.scrollTop = this.ui.chatLog.scrollHeight; }
  toggleCreative() { this.p.creative = !this.p.creative; this.chat(`Gamemode: ${this.p.creative ? "creative" : "survival"}`); }
  lock() { if (document.pointerLockElement !== this.canvas) this.canvas.requestPointerLock(); }
  lockIf() { if (!this.anyOpen() && !this.chatOpen) this.lock(); }
  anyOpen() { return [this.ui.menu, this.ui.invP, this.ui.craftP, this.ui.furP, this.ui.chestP, this.ui.enchP, this.ui.setP].some((p) => !p.classList.contains("hidden")); }
  isInventoryOpen() { return !this.ui.invP.classList.contains("hidden"); }
  stackMax(id) { return this.inv.max(id); }
  stackEqual(a, b) { return !!a?.id && !!b?.id && a.id === b.id && (a.d || 0) === (b.d || 0) && JSON.stringify(a.e || null) === JSON.stringify(b.e || null); }
  cloneStack(s, c = s.c) { return { id: s.id, c, d: s.d || 0, e: s.e ? JSON.parse(JSON.stringify(s.e)) : null }; }
  cleanSlot(i) { const s = this.inv.s[i]; if (!s?.id || s.c <= 0) this.inv.s[i] = mk(); }
  itemColor(id) {
    const it = ITEM[id];
    if (it?.block) {
      const k = COLOR_KEY[it.block] || "stone";
      return (PACKS[this.world.pack] || PACKS.classic)[k] || 0xffffff;
    }
    if (id.includes("pickaxe") || id.includes("axe") || id.includes("shovel")) return 0xb0b7c7;
    if (id.includes("ingot")) return 0xd9c16d;
    if (id.includes("meat") || id.includes("bread") || id.includes("wheat")) return 0xc98a55;
    if (id.includes("seed")) return 0x7ec864;
    if (id.includes("emerald")) return 0x4fe28f;
    return 0xd2d6de;
  }
  itemCode(id) {
    const p = id.split("_");
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return `${p[0][0] || ""}${p[p.length - 1][0] || ""}`.toUpperCase();
  }
  drawStack(el, sl, opts = {}) {
    if (!sl?.id) return;
    const icon = document.createElement("span");
    icon.className = "item-icon";
    icon.style.background = `#${this.itemColor(sl.id).toString(16).padStart(6, "0")}`;
    const code = document.createElement("span");
    code.className = "item-code";
    code.textContent = this.itemCode(sl.id);
    icon.append(code);
    el.append(icon);
    if (opts.showLabel) {
      const lbl = document.createElement("span");
      lbl.className = "item-label";
      lbl.textContent = sl.id.length > 11 ? `${sl.id.slice(0, 10)}.` : sl.id;
      el.append(lbl);
    }
    if (sl.c > 1) {
      const c = document.createElement("span");
      c.className = "count";
      c.textContent = String(sl.c);
      el.append(c);
    }
    if (ITEM[sl.id]?.dur) {
      const d = document.createElement("span");
      d.className = "dur";
      d.textContent = `${sl.d}`;
      el.append(d);
    }
  }
  invSlotAction(i, btn = 0) {
    const slot = this.inv.s[i];
    let cur = this.invCursor;
    if (btn === 2) {
      if (!cur.id) {
        if (slot.id) {
          const take = Math.ceil(slot.c / 2);
          this.invCursor = this.cloneStack(slot, take);
          slot.c -= take;
          this.cleanSlot(i);
        }
      } else if (!slot.id) {
        this.inv.s[i] = this.cloneStack(cur, 1);
        cur.c -= 1;
        if (cur.c <= 0) this.invCursor = mk();
      } else if (this.stackEqual(cur, slot)) {
        const m = this.stackMax(slot.id);
        if (slot.c < m) {
          slot.c += 1;
          cur.c -= 1;
          if (cur.c <= 0) this.invCursor = mk();
        }
      } else {
        this.inv.s[i] = cur;
        this.invCursor = slot.id ? slot : mk();
      }
    } else {
      if (!cur.id) {
        if (slot.id) {
          this.invCursor = this.cloneStack(slot);
          this.inv.s[i] = mk();
        } else if (i < 9) this.inv.sel = i;
      } else if (!slot.id) {
        this.inv.s[i] = this.cloneStack(cur);
        this.invCursor = mk();
      } else if (this.stackEqual(cur, slot)) {
        const m = this.stackMax(slot.id);
        const add = Math.min(cur.c, Math.max(0, m - slot.c));
        slot.c += add;
        cur.c -= add;
        if (cur.c <= 0) this.invCursor = mk();
      } else {
        this.inv.s[i] = cur;
        this.invCursor = slot.id ? slot : mk();
      }
    }
    this.cleanSlot(i);
    if (this.invCursor.id && this.invCursor.c <= 0) this.invCursor = mk();
    this.rInv();
    this.rHot();
    this.rInvCursor();
  }
  rInvCursor() {
    if (!this.ui.invCursor) return;
    const show = this.isInventoryOpen() && !!this.invCursor.id;
    this.ui.invCursor.classList.toggle("hidden", !show);
    if (!show) return;
    this.ui.invCursor.style.left = `${this.invMouse.x + 10}px`;
    this.ui.invCursor.style.top = `${this.invMouse.y + 8}px`;
    this.ui.invCursor.innerHTML = "";
    this.drawStack(this.ui.invCursor, this.invCursor, { showLabel: false });
  }
  // Slot interaction helpers are panel-agnostic so future 2x2/3x3 crafting grids can reuse them.
  tPanel(p) {
    const o = p.classList.contains("hidden");
    if (o) {
      p.classList.remove("hidden");
      this.md.l = 0; this.md.r = 0;
      document.exitPointerLock();
    } else {
      p.classList.add("hidden");
      this.lockIf();
    }
    if (p === this.ui.invP) { this.rInv(); this.rInvCursor(); }
    if (p === this.ui.craftP) this.rCraft();
  }
  moveIn() {
    if (this.anyOpen()) return { x: 0, z: 0 };
    const l = (this.keys.has("KeyA") || this.keys.has("ArrowLeft") ? -1 : 0) + (this.keys.has("KeyD") || this.keys.has("ArrowRight") ? 1 : 0) + (this.tmv?.x || 0);
    const z = (this.keys.has("KeyW") || this.keys.has("ArrowUp") ? 1 : 0) + (this.keys.has("KeyS") || this.keys.has("ArrowDown") ? -1 : 0) + (this.tmv?.z || 0);
    const n = Math.hypot(l, z) || 1;
    return { x: l / n, z: z / n };
  }
  newWorld(seed, slot) {
    if (this.world) {
      for (const k of Array.from(this.world.loaded)) this.world.dropMesh(k);
      if (this.world.atlas?.texture) this.world.atlas.texture.dispose();
    }
    this.slot = slot; this.world = new World(this.scene, seed, this.ui.pack.value || "classic"); this.world.setPerf(this.perf.world); this.world.setRD(Number(this.ui.rd.value) || 4);
    this.mobs.clear(); this.items.forEach((d) => this.scene.remove(d.mesh)); this.items = [];
    this.clearBreakFx();
    this.inv = new Inventory();
    this.p.pos.set(0.5, 40, 0.5); this.p.vel.set(0, 0, 0); this.p.hp = 20; this.p.hu = 20; this.p.ox = 20; this.p.xp = 0; this.p.lv = 1; this.p.creative = 0; this.p.mount = null;
    this.time = 6000; this.achs.clear(); this.replay = []; this.replayOn = 0;
    this.world.updateLoaded(this.p.pos);
    this.p.pos.copy(this.findSpawn(80, 0, 0));
    this.world.updateLoaded(this.p.pos);
    this.p.fs = this.p.pos.y;
    this.rHot(); this.rInv(); this.rCraft(); this.chat(`New world started. Seed ${seed}.`); ["Tutorial: Left click to break, right click to place.", "Tutorial: E inventory, C crafting, F interact with furnace/chest/table.", "Tutorial: Switch to creative with M. Use /brush stone 3 for terrain tools.", "Tutorial: Build portal blocks and press L while inside to change dimension."].forEach((x) => this.chat(x));
    if (this.perf.low && !this.perfAnnounced) { this.chat("Performance mode enabled for low-end devices: reduced shadows/lights/effects and chunk batching."); this.perfAnnounced = true; }
  }
  saveWorld(slot) {
    const v = { world: this.world.save(), player: { pos: this.p.pos.toArray(), vel: this.p.vel.toArray(), hp: this.p.hp, hu: this.p.hu, ox: this.p.ox, xp: this.p.xp, lv: this.p.lv, creative: this.p.creative, yaw: this.yaw, pitch: this.pitch }, inv: this.inv.json(), time: this.time, ach: Array.from(this.achs), mobs: this.mobs.save(), weather: this.weather, replay: this.replay.slice(-300), ver: 1 };
    localStorage.setItem(`webcraft:${slot}`, JSON.stringify(v));
  }
  loadWorld(slot) {
    const raw = localStorage.getItem(`webcraft:${slot}`); if (!raw) { this.chat(`No save found in ${slot}.`); this.newWorld(Math.floor(Math.random() * 1e9), slot); return; }
    const v = JSON.parse(raw); this.slot = slot;
    const savedPack = typeof v?.world?.pack === "string" ? v.world.pack : "classic";
    const packName = PACKS[savedPack] ? savedPack : "classic";
    this.ui.pack.value = packName;
    if (this.world) {
      for (const k of Array.from(this.world.loaded)) this.world.dropMesh(k);
      if (this.world.atlas?.texture) this.world.atlas.texture.dispose();
    }
    this.world = new World(this.scene, v.world.seed, packName); this.world.setPerf(this.perf.world); this.world.setRD(Number(this.ui.rd.value) || 4); this.world.load(v.world); this.world.updateLoaded(new THREE.Vector3(...v.player.pos));
    this.clearBreakFx();
    this.p.pos.fromArray(v.player.pos); this.p.vel.fromArray(v.player.vel || [0, 0, 0]); this.p.hp = v.player.hp; this.p.hu = v.player.hu; this.p.ox = v.player.ox; this.p.xp = v.player.xp; this.p.lv = v.player.lv; this.p.creative = v.player.creative; this.yaw = v.player.yaw || 0; this.pitch = v.player.pitch || 0;
    this.inv = new Inventory(); this.inv.load(v.inv); this.time = v.time || 6000; this.achs = new Set(v.ach || []); this.weather = v.weather || { t: "clear", timer: 20, i: 0 }; this.replay = v.replay || [];
    this.mobs.load(v.mobs); this.items.forEach((d) => this.scene.remove(d.mesh)); this.items = [];
    this.rHot(); this.rInv(); this.rCraft(); this.chat(`Loaded world from ${slot}.`);
  }
  findSpawn(radius = 64, cx = 0, cz = 0) {
    for (let r = 0; r <= radius; r += 2) {
      for (let dx = -r; dx <= r; dx += 2) for (let dz = -r; dz <= r; dz += 2) {
        if (r > 0 && Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
        const x = cx + dx, z = cz + dz;
        const sy = this.world.surface(x, z);
        const under = this.world.get(x, sy, z);
        const feet = this.world.get(x, sy + 1, z);
        const head = this.world.get(x, sy + 2, z);
        const safeBase = under !== BLOCK.AIR && under !== BLOCK.LEAF && !DEF[under]?.liquid;
        const openFeet = !(DEF[feet]?.solid) && !DEF[feet]?.liquid;
        const openHead = !(DEF[head]?.solid) && !DEF[head]?.liquid;
        if (safeBase && openFeet && openHead) return new THREE.Vector3(x + 0.5, sy + 1.02, z + 0.5);
      }
    }
    const sy = this.world.surface(cx, cz);
    return new THREE.Vector3(cx + 0.5, sy + 1.02, cz + 0.5);
  }
  snap() { const x = Math.floor(this.p.pos.x), z = Math.floor(this.p.pos.z); this.p.pos.y = this.world.surface(x, z) + 1.02; }
  pMove(dt) {
    if (this.replayOn || this.p.mount) return;
    if (this.anyOpen()) { this.p.vel.set(0, 0, 0); return; }
    const mv = this.moveIn(), f = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)), r = new THREE.Vector3(-f.z, 0, f.x);
    const sp = (this.keys.has("ShiftLeft") || this.keys.has("ShiftRight")) && this.p.hu > 0 && mv.z > 0.2; this.p.sprint = sp;
    const base = this.p.creative ? 7.2 : sp ? 6.4 : 4.3;
    const water = this.world.isLiquid(Math.floor(this.p.pos.x), Math.floor(this.p.pos.y + 0.6), Math.floor(this.p.pos.z)); this.p.swim = water;
    const a = new THREE.Vector3().addScaledVector(f, mv.z * base).addScaledVector(r, mv.x * base);
    this.p.vel.x = lerp(this.p.vel.x, a.x, water ? 0.08 : 0.18); this.p.vel.z = lerp(this.p.vel.z, a.z, water ? 0.08 : 0.18);
    if (water) { this.p.vel.y -= 6.4 * dt; if (this.keys.has("Space")) this.p.vel.y = 3.5; }
    else {
      if (!this.p.creative) this.p.vel.y -= 20 * dt;
      if (this.keys.has("Space") && this.p.g) { this.p.vel.y = this.p.creative ? 7 : 7.2; this.p.g = 0; }
      if (this.p.creative && this.keys.has("Space")) this.p.vel.y = 5;
    }
    const old = this.p.pos.y; this.moveCol(dt);
    if (!this.p.g && this.p.vel.y < -0.1 && this.p.fs < this.p.pos.y) this.p.fs = this.p.pos.y;
    if (this.p.g && old > this.p.pos.y + 0.01) { const fall = this.p.fs - this.p.pos.y; if (!this.p.creative && fall > 3.2) this.damage((fall - 3.2) * 1.45, "fall"); this.p.fs = this.p.pos.y; }
    const abs = Math.hypot(this.p.vel.x, this.p.vel.z); this.step -= dt; if (this.p.g && abs > 1.5) { this.step -= dt * (sp ? 2 : 1.4); if (this.step <= 0) { this.step = 0.33; this.audio.play("step"); } }
    const h = this.world.get(Math.floor(this.p.pos.x), Math.floor(this.p.pos.y + 1.55), Math.floor(this.p.pos.z));
    if (h === BLOCK.WATER || h === BLOCK.LAVA) { this.p.ox = Math.max(0, this.p.ox - dt * 4.5); if (this.p.ox <= 0) this.damage(dt * 2.7, "drown"); }
    else this.p.ox = Math.min(20, this.p.ox + dt * 3.5);
    if (!this.p.creative) {
      const dr = 0.015 + abs * 0.0025 + (sp ? 0.02 : 0); this.p.hu = Math.max(0, this.p.hu - dr * dt * 10);
      if (this.p.hu > 14 && this.p.hp < 20) this.p.hp = Math.min(20, this.p.hp + dt * 0.35);
      if (this.p.hu <= 0) this.damage(dt * 0.7, "starve");
    }
    if (this.p.pos.y < -20) { this.p.pos.set(8.5, 60, 8.5); this.p.vel.set(0, 0, 0); this.damage(4, "void"); }
  }
  moveCol(dt) {
    const p = this.p.pos, v = this.p.vel; p.x += v.x * dt; if (this.col(p.x, p.y, p.z)) { p.x -= v.x * dt; v.x = 0; } p.z += v.z * dt; if (this.col(p.x, p.y, p.z)) { p.z -= v.z * dt; v.z = 0; } p.y += v.y * dt; if (this.col(p.x, p.y, p.z)) { if (v.y < 0) this.p.g = 1; p.y -= v.y * dt; v.y = 0; } else this.p.g = 0;
  }
  col(x, y, z) {
    const mnx = Math.floor(x - 0.3), mxx = Math.floor(x + 0.3), mny = Math.floor(y), mxy = Math.floor(y + 1.8), mnz = Math.floor(z - 0.3), mxz = Math.floor(z + 0.3);
    for (let bx = mnx; bx <= mxx; bx++) for (let by = mny; by <= mxy; by++) for (let bz = mnz; bz <= mxz; bz++) { const id = this.world.get(bx, by, bz), d = DEF[id]; if (!d?.solid || d.liquid) continue; if (id === BLOCK.DOOR && this.world.gd(bx, by, bz) > 0) continue; return 1; }
    return 0;
  }
  camUp() {
    const e = this.p.pos.clone().add(new THREE.Vector3(0, 1.62, 0)), d = new THREE.Vector3(Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), Math.cos(this.yaw) * Math.cos(this.pitch));
    if (!this.third) { this.cam.position.copy(e); this.cam.lookAt(e.clone().add(d)); this.pm.visible = false; }
    else { const b = e.clone().addScaledVector(d, -4).add(new THREE.Vector3(0, 1.4, 0)); this.cam.position.lerp(b, 0.22); this.cam.lookAt(e); this.pm.visible = true; this.pm.position.copy(this.p.pos).add(new THREE.Vector3(0, 0.9, 0)); this.pm.rotation.y = this.yaw; this.pm.rotation.z = this.p.emo > 0 ? Math.sin(performance.now() * 0.01) * 0.35 : 0; }
  }
  skyUp(dt) {
    this.time = (this.time + dt * 16) % 24000; const t = this.time / 24000, a = t * Math.PI * 2, sy = Math.sin(a), day = clamp((sy + 0.2) * 0.95, 0.08, 1);
    const col = new THREE.Color().setHSL(0.58, 0.6, lerp(0.08, 0.68, day)); this.sky.material.color.copy(col); this.scene.fog.color.copy(col.clone().multiplyScalar(0.82));
    const r = 100; this.sun.position.set(Math.cos(a) * r, sy * r, Math.sin(a) * r); this.sun.intensity = day * (this.weather.t === "storm" ? 0.45 : 0.95); this.amb.intensity = 0.18 + day * 0.55;
    this.sunBall.position.copy(this.sun.position.clone().multiplyScalar(0.9)); this.moon.position.copy(this.sun.position.clone().multiplyScalar(-0.88));
    this.clouds.position.x += dt * 1.3; if (this.clouds.position.x > 120) this.clouds.position.x = -120;
    const mins = Math.floor((this.time / 24000) * 24 * 60), hh = String(Math.floor(mins / 60) % 24).padStart(2, "0"), mm = String(mins % 60).padStart(2, "0"); this.ui.clock.textContent = `${hh}:${mm}`;
  }
  weatherUp(dt) {
    this.weather.timer -= dt;
    if (this.weather.timer <= 0) { const r = Math.random(); this.weather.t = r < 0.55 ? "clear" : r < 0.85 ? "rain" : "storm"; this.weather.timer = 35 + Math.random() * 45; this.chat(`Weather: ${this.weather.t}`); if (this.weather.t === "storm") this.audio.play("thunder"); }
    this.weather.i = this.weather.t === "clear" ? 0 : this.weather.t === "rain" ? 0.6 : 1;
    if (this.weather.t === "storm" && Math.random() < dt * 0.02) { this.audio.play("thunder"); this.sun.intensity += 0.3; }
    if (this.weather.t === "clear") { this.rain.points.visible = false; return; }
    this.rain.points.visible = true;
    const p = this.rain.points.geometry.attributes.position;
    for (let i = 0; i < this.rain.n; i++) {
      let x = p.array[i * 3], y = p.array[i * 3 + 1], z = p.array[i * 3 + 2];
      x += (this.p.pos.x - x) * 0.01; z += (this.p.pos.z - z) * 0.01; y -= (this.weather.t === "storm" ? 35 : 24) * dt; if (y < this.p.pos.y - 4) y = this.p.pos.y + 25 + Math.random() * 12;
      p.array[i * 3] = x; p.array[i * 3 + 1] = y; p.array[i * 3 + 2] = z;
    }
    p.needsUpdate = true;
  }
  interactUp(dt) {
    this.p.at = Math.max(0, this.p.at - dt); this.placeCd = Math.max(0, this.placeCd - dt); this.useCd = Math.max(0, this.useCd - dt); this.foodCd = Math.max(0, this.foodCd - dt);
    const eye = this.p.pos.clone().add(new THREE.Vector3(0, 1.62, 0)), dir = new THREE.Vector3(Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), Math.cos(this.yaw) * Math.cos(this.pitch));
    const hit = this.world.ray(eye, dir, 6);
    if (hit.hit) {
      this.ui.hint.textContent = `${NAME[hit.b.id]} | F interact`;
      if (this.md.l && !this.anyOpen()) {
        if (!this.mobs.attack(eye, dir)) this.breakDo(hit.b, dt);
      } else { this.p.bt = null; this.p.bp = 0; this.clearBreakFx(); }
      if (this.md.r && this.placeCd <= 0 && !this.anyOpen()) { this.placeCd = 0.16; if (!this.eatSel()) this.placeDo(hit.p, hit.b); }
    } else {
      this.ui.hint.textContent = ""; this.p.bt = null; this.p.bp = 0; this.clearBreakFx();
      if (this.md.r && this.placeCd <= 0 && !this.anyOpen()) { this.placeCd = 0.2; this.eatSel(); }
    }
    if (this.p.data.brush && this.md.l && hit.hit) this.brush(hit.b.x, hit.b.y, hit.b.z, 0);
    if (this.p.data.brush && this.md.r && hit.hit) this.brush(hit.p.x, hit.p.y, hit.p.z, 1);
  }
  brush(x, y, z, add) {
    const r = clamp(this.p.data.bRadius || 2, 1, 8), nm = this.p.data.bBlock || "stone", id = ITEM[nm]?.block || BLOCK.STONE;
    for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) for (let dz = -r; dz <= r; dz++) if (dx * dx + dy * dy + dz * dz <= r * r) this.world.set(x + dx, y + dy, z + dz, add ? id : BLOCK.AIR, { mod: 1 });
  }
  eatSel() {
    if (this.foodCd > 0) return 0;
    const s = this.inv.selSlot(), it = ITEM[s.id]; if (!s.id || !it?.food || this.p.hu >= 20) return 0;
    this.p.hu = Math.min(20, this.p.hu + it.food); if (!this.p.creative) this.inv.useSel(); this.foodCd = 0.45; this.audio.play("eat"); this.rHot(); this.ach("snack", "Eat food to restore hunger"); return 1;
  }
  breakDo(b, dt) {
    const k = `${b.x},${b.y},${b.z}`; if (this.p.bt !== k) { this.p.bt = k; this.p.bp *= 0.35; }
    const d = DEF[b.id] || {}, s = this.inv.selSlot(), it = ITEM[s.id];
    let sp = this.p.creative ? 999 : 1 / Math.max(0.05, d.hard || 1);
    if (!this.p.creative && it?.tool) { if (d.tool === it.tool) sp *= TOOL[it.tier] || 1.2; else sp *= 0.45; if (s.e?.eff) sp *= 1 + s.e.eff * 0.2; }
    else if (!this.p.creative && d.tool) sp *= 0.6;
    this.p.bp += dt * sp;
    this.showBreakFx(b.x, b.y, b.z, this.p.bp);
    if (this.p.bp >= 1) {
      this.world.set(b.x, b.y, b.z, BLOCK.AIR, { mod: 1 });
      const hex = (PACKS[this.world.pack] || PACKS.classic)[COLOR_KEY[b.id] || "stone"] || 0xffffff;
      this.pfx.burst(new THREE.Vector3(b.x + 0.5, b.y + 0.5, b.z + 0.5), hex, 12, 2.5, 0.52); this.audio.play("break");
      if (b.id === BLOCK.TNT) this.explode(b.x + 0.5, b.y + 0.5, b.z + 0.5, 4.5);
      else if (b.id === BLOCK.CROP) { const st = this.world.gd(b.x, b.y, b.z); this.drop(new THREE.Vector3(b.x + 0.5, b.y + 0.4, b.z + 0.5), "seed", 1 + Math.floor(Math.random() * 2)); if (st >= 3) this.drop(new THREE.Vector3(b.x + 0.5, b.y + 0.4, b.z + 0.5), "wheat", 1 + Math.floor(Math.random() * 2)); }
      else {
        const dr = d.drop || NAME[b.id] || "cobble"; let ct = 1; if (s.e?.fort && [BLOCK.COAL, BLOCK.IRON, BLOCK.GOLD].includes(b.id)) ct += Math.floor(Math.random() * (s.e.fort + 1));
        this.drop(new THREE.Vector3(b.x + 0.5, b.y + 0.5, b.z + 0.5), dr, ct);
      }
      if ([BLOCK.COAL, BLOCK.IRON, BLOCK.GOLD].includes(b.id)) { this.xp(3); this.ach("miner", "Mine your first ore"); }
      if (b.id === BLOCK.LOG) this.ach("lumber", "Punch wood");
      if (!this.p.creative && s.id && ITEM[s.id]?.dur) { s.d -= 1; this.inv.cleanDur(); }
      this.p.bt = null; this.p.bp = 0; this.clearBreakFx();
    }
  }
  placeDo(p, hit) {
    const s = this.inv.selSlot(), it = ITEM[s.id]; if (!s.id || !it) return;
    const x = p.x, y = p.y, z = p.z;
    if (Math.abs(x + 0.5 - this.p.pos.x) < 0.6 && Math.abs(y - this.p.pos.y) < 2 && Math.abs(z + 0.5 - this.p.pos.z) < 0.6) return;
    const ex = this.world.get(x, y, z); if (ex !== BLOCK.AIR && !DEF[ex]?.repl) return;
    if (it.block) { this.world.set(x, y, z, it.block, { mod: 1 }); if (!this.p.creative) this.inv.useSel(); this.rHot(); this.audio.play("place"); if (it.block === BLOCK.PORTAL) this.ach("portal_builder", "Build a portal block"); return; }
    if (it.crop) { const b = this.world.get(x, y - 1, z); if ([BLOCK.DIRT, BLOCK.GRASS, BLOCK.FARM].includes(b)) { this.world.set(x, y - 1, z, BLOCK.FARM, { mod: 1 }); this.world.set(x, y, z, BLOCK.CROP, { mod: 1, data: 0 }); if (!this.p.creative) this.inv.useSel(); this.rHot(); } return; }
    if (it.vehicle) { const u = this.world.get(x, y - 1, z); if (it.vehicle === "boat" && u !== BLOCK.WATER && u !== BLOCK.GLASS) return; if (it.vehicle === "cart" && u !== BLOCK.RAIL) return; this.mobs.spawnVehicle(it.vehicle === "cart" ? "cart" : "boat", new THREE.Vector3(x + 0.5, y + 0.3, z + 0.5)); if (!this.p.creative) this.inv.useSel(); this.rHot(); }
  }
  interact() {
    if (this.useCd > 0) return; this.useCd = 0.2;
    const eye = this.p.pos.clone().add(new THREE.Vector3(0, 1.62, 0)), dir = new THREE.Vector3(Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), Math.cos(this.yaw) * Math.cos(this.pitch)), h = this.world.ray(eye, dir, 6);
    if (!h.hit) return this.mount();
    const { x, y, z, id } = h.b, u = DEF[id]?.use;
    if (!u) { if (id === BLOCK.PORTAL) this.portal(); return; }
    if (u === "craft") { this.tPanel(this.ui.craftP); this.rCraft(); return; }
    if (u === "furnace") return this.openF(x, y, z);
    if (u === "chest") return this.openC(x, y, z);
    if (u === "enchant") return this.openE();
    if (u === "door") { const o = this.world.gd(x, y, z) > 0; this.world.sd(x, y, z, o ? 0 : 1); this.world.rebuildNear(x, y, z); return; }
    if (u === "switch") { const o = this.world.gd(x, y, z) > 0; this.world.togglePower(x, y, z, !o); }
  }
  openC(x, y, z) {
    this.ui.chestP.classList.remove("hidden"); document.exitPointerLock(); const k = this.world.bk(x, y, z), c = this.world.tile.get(k) || { t: "chest", i: Array.from({ length: 27 }, () => mk()) }; this.world.tile.set(k, c);
    this.ui.chestG.innerHTML = "";
    c.i.forEach((s, idx) => { const b = document.createElement("button"); b.className = "grid-slot"; b.textContent = s.id ? s.id : "Empty"; if (s.c > 1) { const c1 = document.createElement("span"); c1.className = "count"; c1.textContent = String(s.c); b.append(c1); } b.addEventListener("click", () => { if (s.id) { const l = this.inv.add(s.id, s.c); if (l === 0) c.i[idx] = mk(); else c.i[idx].c = l; } else { const sel = this.inv.selSlot(); if (sel.id) { c.i[idx] = { ...sel }; this.inv.s[this.inv.sel] = mk(); } } this.openC(x, y, z); this.rHot(); this.rInv(); }); this.ui.chestG.append(b); });
  }
  openF(x, y, z) {
    this.ui.furP.classList.remove("hidden"); document.exitPointerLock(); this.fKey = this.world.bk(x, y, z); if (!this.world.tile.has(this.fKey)) this.world.tile.set(this.fKey, { t: "furnace", in: null, fuel: null, left: 0, p: 0, out: null }); this.rF();
  }
  rF() {
    const f = this.world.tile.get(this.fKey); if (!f) return;
    const sm = Object.keys(SMELT).filter((id) => this.inv.count(id) > 0), fu = Object.keys(ITEM).filter((id) => ITEM[id].fuel && this.inv.count(id) > 0);
    this.ui.fi.innerHTML = sm.map((id) => `<option value="${id}">${id}</option>`).join("") || "<option value=''>No smeltables</option>";
    this.ui.ff.innerHTML = fu.map((id) => `<option value="${id}">${id}</option>`).join("") || "<option value=''>No fuel</option>";
    const out = f.out ? `${f.out.id} x${f.out.c}` : "none"; this.ui.fst.textContent = `Fuel: ${f.left.toFixed(1)}s | Progress: ${Math.floor(f.p * 100)}% | Output: ${out}`;
  }
  startSmelt() {
    const f = this.world.tile.get(this.fKey), i = this.ui.fi.value, fu = this.ui.ff.value; if (!f || !i || !fu || !SMELT[i] || this.inv.count(i) <= 0 || this.inv.count(fu) <= 0) return;
    if (!f.in) { this.inv.take(i, 1); f.in = i; }
    if (f.left <= 0 && ITEM[fu]?.fuel) { this.inv.take(fu, 1); f.fuel = fu; f.left += ITEM[fu].fuel; }
    this.rF(); this.rInv(); this.rHot();
  }
  openE() {
    this.ui.enchP.classList.remove("hidden"); document.exitPointerLock(); this.ui.enchO.innerHTML = "";
    const s = this.inv.selSlot(); if (!s.id || !ITEM[s.id]?.dur) { this.ui.enchO.textContent = "Hold a tool in selected slot."; return; }
    [{ id: "eff", lb: "Efficiency I", xp: 2, c: { emerald: 1 } }, { id: "fort", lb: "Fortune I", xp: 3, c: { emerald: 2 } }, { id: "sharpness", lb: "Sharpness I", xp: 2, c: { emerald: 2 } }].forEach((o) => { const b = document.createElement("button"); b.textContent = `${o.lb} (XP ${o.xp})`; b.addEventListener("click", () => { if (this.p.lv < o.xp) return this.chat("Not enough XP level."); if (!this.inv.has(o.c)) return this.chat("Need emeralds for enchanting."); this.inv.consume(o.c); this.p.lv -= o.xp; s.e = s.e || {}; s.e[o.id] = (s.e[o.id] || 0) + 1; this.rHot(); this.hud(); this.ach("enchant", "Enchant a tool"); this.chat(`Applied ${o.lb} to ${s.id}`); }); this.ui.enchO.append(b); });
  }
  dropSel() { const s = this.inv.selSlot(); if (!s.id) return; const id = this.inv.useSel(); if (!id) return; const d = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)); const p = this.p.pos.clone().add(new THREE.Vector3(0, 1.3, 0)).addScaledVector(d, 0.8); this.drop(p, id, 1, d.multiplyScalar(2.8).add(new THREE.Vector3(0, 2, 0))); this.rHot(); }
  drop(pos, id, c = 1, vel = null) {
    const blk = ITEM[id]?.block, hex = blk ? (PACKS[this.world.pack] || PACKS.classic)[COLOR_KEY[blk] || "stone"] || 0xffffff : id.includes("ingot") ? 0xe1d37d : (id.includes("pickaxe") || id.includes("axe") || id.includes("shovel")) ? 0xb7bbc9 : id.includes("bread") || id.includes("meat") ? 0xcc7a4a : 0xffffff;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), new THREE.MeshLambertMaterial({ color: hex })); mesh.castShadow = true; mesh.position.copy(pos); this.scene.add(mesh);
    this.items.push({ mesh, id, c, vel: vel ? vel.clone() : new THREE.Vector3((Math.random() - 0.5) * 1.2, 2 + Math.random() * 1.3, (Math.random() - 0.5) * 1.2), life: 80 });
  }
  itemsUp(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const d = this.items[i]; d.life -= dt; d.vel.y -= 16 * dt; d.mesh.position.addScaledVector(d.vel, dt); d.mesh.rotation.y += dt * 2.5;
      const x = Math.floor(d.mesh.position.x), y = Math.floor(d.mesh.position.y), z = Math.floor(d.mesh.position.z), u = this.world.get(x, y - 1, z);
      if (u !== BLOCK.AIR && !DEF[u]?.liquid && d.vel.y < 0) { d.mesh.position.y = y + 0.02; d.vel.y *= -0.2; d.vel.x *= 0.6; d.vel.z *= 0.6; }
      if (d.mesh.position.distanceTo(this.p.pos.clone().add(new THREE.Vector3(0, 1.2, 0))) < 1.5) { const l = this.inv.add(d.id, d.c); if (l <= 0) { this.scene.remove(d.mesh); this.items.splice(i, 1); this.rHot(); this.rInv(); continue; } d.c = l; }
      if (d.life <= 0) { this.scene.remove(d.mesh); this.items.splice(i, 1); }
    }
  }
  explode(x, y, z, pow = 4) {
    const c = new THREE.Vector3(x, y, z), mn = Math.floor(-pow), mx = Math.ceil(pow);
    for (let dx = mn; dx <= mx; dx++) for (let dy = mn; dy <= mx; dy++) for (let dz = mn; dz <= mx; dz++) {
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz); if (dist > pow) continue;
      const bx = Math.floor(x + dx), by = Math.floor(y + dy), bz = Math.floor(z + dz), id = this.world.get(bx, by, bz);
      if (id === BLOCK.AIR || id === BLOCK.OBS || id === BLOCK.PORTAL) continue;
      this.world.set(bx, by, bz, BLOCK.AIR, { mod: 1 }); if (Math.random() < 0.2) this.world.set(bx, by, bz, BLOCK.LAVA, { mod: 1, data: 2 }); if (id === BLOCK.TNT && Math.random() < 0.45) setTimeout(() => this.explode(bx + 0.5, by + 0.5, bz + 0.5, 3.5), 120);
    }
    this.pfx.burst(c, 0xff9233, 90, 6.8, 1.3); this.audio.play("thunder");
    const pd = this.p.pos.distanceTo(c); if (pd < pow * 2) { const dmg = (pow * 2 - pd) * 2.2; this.damage(dmg, "explosion"); this.p.vel.add(this.p.pos.clone().sub(c).normalize().multiplyScalar(5)); }
    for (const m of this.mobs.m) if (!m.dead) { const d = m.p.distanceTo(c); if (d < pow * 2) { m.h -= (pow * 2 - d) * 2; if (m.h <= 0) this.mobs.kill(m); } }
  }
  damage(a, s = "") {
    if (this.p.creative) return;
    this.p.hp = Math.max(0, this.p.hp - a);
    this.audio.play("hurt");
    if (s) this.hint(`-${a.toFixed(1)} HP (${s})`);
    if (this.p.hp <= 0) {
      this.p.hp = 20; this.p.hu = 20; this.p.ox = 20;
      const sx = Math.floor(this.p.pos.x), sz = Math.floor(this.p.pos.z);
      this.p.pos.copy(this.findSpawn(56, sx, sz));
      this.p.vel.set(0, 0, 0);
      this.world.updateLoaded(this.p.pos);
      this.p.fs = this.p.pos.y;
      this.chat("You died. Respawned.");
    }
  }
  hint(t) { this.ui.hint.textContent = t; clearTimeout(this.hT); this.hT = setTimeout(() => { this.ui.hint.textContent = ""; }, 1200); }
  xp(v) { this.p.xp += v; this.audio.play("xp"); while (this.p.xp >= this.p.lv * 10) { this.p.xp -= this.p.lv * 10; this.p.lv++; this.audio.play("ach"); this.chat(`Level up! ${this.p.lv}`); if (this.p.lv === 3) this.ach("lvl3", "Reach level 3"); } }
  ach(id, t) { if (this.achs.has(id)) return; this.achs.add(id); this.chat(`Achievement: ${t}`); this.audio.play("ach"); }
  farmTick() { for (const k of this.world.loaded) { const [cx, cz] = k.split(",").map(Number); for (let lx = 0; lx < CHUNK; lx++) for (let lz = 0; lz < CHUNK; lz++) for (let y = 1; y < WORLD_H - 1; y++) { const wx = cx * CHUNK + lx, wz = cz * CHUNK + lz; if (this.world.get(wx, y, wz) !== BLOCK.CROP) continue; const st = this.world.gd(wx, y, wz), wet = this.world.get(wx, y - 1, wz) === BLOCK.FARM; if (!wet) this.world.set(wx, y, wz, BLOCK.AIR, { mod: 1 }); else if (Math.random() < 0.02) this.world.sd(wx, y, wz, clamp(st + 1, 0, 3)); } } }
  hud() {
    const set = (e, v, m = 20) => e.style.width = `${clamp((v / m) * 100, 0, 100)}%`;
    set(this.ui.healthFill, this.p.hp);
    set(this.ui.hungerFill, this.p.hu);
    set(this.ui.xpFill, this.p.xp, this.p.lv * 10);
    set(this.ui.oxygenFill, this.p.ox);
    this.ui.healthText.textContent = `${Math.ceil(this.p.hp)}/20`;
    this.ui.hungerText.textContent = `${Math.ceil(this.p.hu)}/20`;
    this.ui.xpText.textContent = `L${this.p.lv}`;
    this.ui.oxygenText.textContent = `${Math.ceil(this.p.ox)}`;
    if (this.ui.oxygenRow) this.ui.oxygenRow.style.display = (this.p.ox < 19.9 || this.p.swim) ? "grid" : "none";
    this.ui.modePill.textContent = this.p.creative ? "Creative" : "Survival";
    this.ui.coords.textContent = `x:${Math.floor(this.p.pos.x)} y:${Math.floor(this.p.pos.y)} z:${Math.floor(this.p.pos.z)} ${this.world.dimension}`;
  }
  rHot() {
    const slots = this.ui.hotbar.querySelectorAll(".slot");
    for (let i = 0; i < 9; i++) {
      const el = slots[i], sl = this.inv.s[i];
      el.classList.toggle("selected", i === this.inv.sel);
      el.innerHTML = "";
      if (!sl.id) continue;
      this.drawStack(el, sl, { showLabel: false });
    }
  }
  rInv() {
    this.ui.invG.innerHTML = "";
    for (let i = 0; i < this.inv.s.length; i++) {
      const sl = this.inv.s[i];
      const b = document.createElement("button");
      b.type = "button";
      b.className = "grid-slot";
      if (i < 9) b.classList.add("hotbar-slot");
      b.dataset.slot = String(i);
      if (i < 9) b.title = `Hotbar ${i + 1}`;
      this.drawStack(b, sl, { showLabel: false });
      b.addEventListener("pointerdown", (e) => {
        if (!this.isInventoryOpen()) return;
        if (e.button !== 0 && e.button !== 2) return;
        e.preventDefault();
        this.invSlotAction(i, e.button);
      });
      b.addEventListener("contextmenu", (e) => e.preventDefault());
      this.ui.invG.append(b);
    }
  }
  rCraft() { this.ui.rec.innerHTML = ""; RECIPES.forEach((r) => { const d = document.createElement("div"); d.className = "recipe"; d.innerHTML = `<strong>${r.out.id} x${r.out.c}</strong><span>${Object.entries(r.in).map(([k, v]) => `${k}x${v}`).join(", ")}</span>`; const b = document.createElement("button"); b.textContent = "Craft"; b.addEventListener("click", () => { if (!this.inv.has(r.in)) return this.chat("Missing ingredients."); this.inv.consume(r.in); this.inv.add(r.out.id, r.out.c); this.rCraft(); this.rInv(); this.rHot(); this.ach("craft", "Craft your first item"); }); d.append(b); this.ui.rec.append(d); }); }
  map() {
    const c = this.ui.map.getContext("2d"), s = this.ui.map.width, r = this.perf.mapRadius, step = this.perf.mapStep, px = Math.floor(this.p.pos.x), pz = Math.floor(this.p.pos.z);
    c.clearRect(0, 0, s, s);
    c.fillStyle = "rgba(8,12,20,0.75)";
    c.fillRect(0, 0, s, s);
    const dot = Math.max(2, step * 2);
    for (let dz = -r; dz <= r; dz += step) for (let dx = -r; dx <= r; dx += step) {
      const wx = px + dx, wz = pz + dz, y = this.world.surface(wx, wz), id = this.world.get(wx, y, wz), k = COLOR_KEY[id] || "stone", hex = (PACKS[this.world.pack] || PACKS.classic)[k] || 0xffffff;
      c.fillStyle = `#${hex.toString(16).padStart(6, "0")}`;
      const sx = Math.floor(((dx + r) / (r * 2)) * s), sz = Math.floor(((dz + r) / (r * 2)) * s);
      c.fillRect(sx, sz, dot, dot);
    }
    c.fillStyle = "#ff2222"; c.beginPath(); c.arc(s / 2, s / 2, 3, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#ffffff"; c.beginPath(); c.moveTo(s / 2, s / 2); c.lineTo(s / 2 + Math.sin(this.yaw) * 12, s / 2 + Math.cos(this.yaw) * 12); c.stroke();
  }
  mount() { if (this.p.mount) { this.p.mount.rider = null; this.p.mount = null; this.chat("Unmounted."); return; } let n = null, d = 2; for (const v of this.mobs.v) { const dist = v.p.distanceTo(this.p.pos); if (dist < d && !v.rider) { d = dist; n = v; } } if (n) { n.rider = "player"; this.p.mount = n; this.chat(`Mounted ${n.t}.`); } }
  portal() { const x = Math.floor(this.p.pos.x), y = Math.floor(this.p.pos.y + 1), z = Math.floor(this.p.pos.z); if (this.world.get(x, y, z) !== BLOCK.PORTAL) return this.chat("Stand inside a portal block to teleport."); this.world.dimension = this.world.dimension === "overworld" ? "nether" : "overworld"; this.p.pos.y = this.world.dimension === "nether" ? 38 : 52; this.world.cd.clear(); for (const k of Array.from(this.world.loaded)) this.world.dropMesh(k); this.world.loaded.clear(); this.world.updateLoaded(this.p.pos); this.chat(`Dimension: ${this.world.dimension}`); this.ach("dimension", "Travel to another dimension"); }
  shot() { ["hud", "hotbar", "interaction-hint", "crosshair"].forEach((i) => document.getElementById(i).classList.add("hidden")); this.r.render(this.scene, this.cam); const a = document.createElement("a"); a.href = this.canvas.toDataURL("image/png"); a.download = `webcraft-shot-${Date.now()}.png`; a.click(); ["hud", "hotbar", "interaction-hint", "crosshair"].forEach((i) => document.getElementById(i).classList.remove("hidden")); }
  tReplay() { if (this.replayOn) { this.replayOn = 0; if (this.replayGhost) { this.scene.remove(this.replayGhost); this.replayGhost = null; } return this.chat("Replay stopped."); } if (this.replay.length < 10) return this.chat("Not enough replay data."); this.replayOn = 1; this.replayGhost = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.35), new THREE.MeshBasicMaterial({ color: 0x7fd0ff, transparent: true, opacity: 0.45 })); this.scene.add(this.replayGhost); this.rIdx = 0; this.chat("Replay playing."); }
  replayUp(dt) { this.rRec = (this.rRec || 0) - dt; if (this.rRec <= 0) { this.rRec = 0.16; this.replay.push({ p: this.p.pos.toArray(), y: this.yaw }); if (this.replay.length > 1200) this.replay.shift(); } if (!this.replayOn || !this.replayGhost) return; this.rIdx += dt * 8; const i = Math.floor(this.rIdx); if (i >= this.replay.length - 1) return this.tReplay(); const f = this.replay[i]; this.replayGhost.position.fromArray(f.p).add(new THREE.Vector3(0, 0.9, 0)); this.replayGhost.rotation.y = f.y; }
  furnUp(dt) { for (const [k, f] of this.world.tile) { if (f.t !== "furnace" || !f.in || !SMELT[f.in] || f.left <= 0) continue; f.left -= dt; f.p += dt / 8; if (f.p >= 1) { f.p = 0; const o = SMELT[f.in]; if (!f.out) f.out = { id: o, c: 0 }; f.out.c += 1; f.in = null; const rem = this.inv.add(f.out.id, f.out.c); f.out.c = rem; if (f.out.c <= 0) f.out = null; } if (this.fKey === k && !this.ui.furP.classList.contains("hidden")) this.rF(); } }
  tick() { this.world.tickPhysics(); this.farmTick(); if (Math.random() < 0.03) { const x = Math.floor(this.p.pos.x), z = Math.floor(this.p.pos.z), y = this.world.surface(x, z) + 1, id = this.world.get(x, y, z); if (id === BLOCK.LAVA) this.damage(1, "burn"); } if (Math.random() < 0.01) this.saveWorld(this.slot); }
  pluginsUp(dt) { for (const p of this.plugins) if (typeof p.onFrame === "function") try { p.onFrame({ dt, game: this }, this); } catch (e) { console.error("Plugin error", e); } }
  loop(now) {
    const dt = clamp((now - this.last) / 1000, 0, 0.05); this.last = now; this.acc += dt;
    this.loadCd -= dt; if (this.loadCd <= 0) { this.loadCd = this.perf.low ? 0.08 : 0.02; this.world.updateLoaded(this.p.pos); }
    this.skyUp(dt); this.weatherUp(dt); this.pMove(dt); this.interactUp(dt); this.itemsUp(dt); this.furnUp(dt); this.mobs.up(dt); this.pfx.up(dt); this.camUp(); this.hud();
    this.mapCd -= dt; if (this.mapCd <= 0) { this.mapCd = this.perf.mapInterval; this.map(); }
    this.replayUp(dt); this.audio.up(dt);
    this.audio.setOccl(clamp((SEA - this.p.pos.y) / 25, 0, 1));
    while (this.acc >= 1 / 20) { this.tick(); this.acc -= 1 / 20; }
    this.pluginsUp(dt);
    this.r.render(this.scene, this.cam); requestAnimationFrame(this.loop.bind(this));
  }
}

window.WebCraftPlugins = window.WebCraftPlugins || [];
window.__webcraft = new Game();
