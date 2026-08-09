import { Item } from '../types';

export interface AttributeMatchDetail {
  attribute: 'Name' | 'Category' | 'Color' | 'Brand' | 'Location' | 'Date';
  score: number; // Max points for this attribute
  maxScore: number;
  matchedValue?: string;
  isMatch: boolean;
  reason: string;
}

export interface SmartMatchResult {
  foundItem: Item;
  similarityScore: number; // 0 to 100 percentage
  attributes: AttributeMatchDetail[];
  matchReasons: string[];
}

// Common color keywords for auto-extraction fallback
const COMMON_COLORS = [
  'black', 'white', 'blue', 'navy', 'red', 'silver', 'grey', 'gray', 'gold',
  'pink', 'purple', 'green', 'brown', 'yellow', 'orange', 'beige', 'rose gold',
  'space gray', 'matte black', 'clear'
];

// Common brand keywords for auto-extraction fallback
const COMMON_BRANDS = [
  'apple', 'samsung', 'sony', 'bose', 'nike', 'adidas', 'hydro flask', 'hydroflask',
  'yeti', 'dell', 'hp', 'lenovo', 'asus', 'casio', 'north face', 'patagonia',
  'jansport', 'herschel', 'anker', 'beats', 'logitech', 'ray-ban', 'oakley',
  'stanley', 'kindle', 'nintendo'
];

/**
 * Extracts color keyword from an item if color field is missing.
 */
export function extractColor(item: Partial<Item>): string {
  if (item.color && item.color.trim()) return item.color.trim().toLowerCase();
  const text = `${item.title || ''} ${item.description || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
  for (const color of COMMON_COLORS) {
    if (text.includes(color)) return color;
  }
  return '';
}

/**
 * Extracts brand keyword from an item if brand field is missing.
 */
export function extractBrand(item: Partial<Item>): string {
  if (item.brand && item.brand.trim()) return item.brand.trim().toLowerCase();
  const text = `${item.title || ''} ${item.description || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
  for (const brand of COMMON_BRANDS) {
    if (text.includes(brand)) return brand;
  }
  return '';
}

/**
 * Modular Smart Matching Engine.
 * Compares a Lost Item against active Found Items across 6 key attributes:
 * 1. Item Name (Title & Keywords)
 * 2. Category
 * 3. Color
 * 4. Brand
 * 5. Location
 * 6. Date
 */
export function calculateSmartMatchScore(lostItem: Partial<Item>, foundItem: Item): SmartMatchResult {
  const attributes: AttributeMatchDetail[] = [];
  const matchReasons: string[] = [];

  // 1. Item Name Comparison (Max 25 pts)
  let nameScore = 0;
  const lostTitle = (lostItem.title || '').toLowerCase().trim();
  const foundTitle = (foundItem.title || '').toLowerCase().trim();
  const foundDesc = (foundItem.description || '').toLowerCase();

  if (lostTitle && foundTitle) {
    if (lostTitle === foundTitle) {
      nameScore = 25;
      matchReasons.push('Exact item title match');
    } else {
      const lostWords = lostTitle.split(/\s+/).filter(w => w.length > 2);
      const matchedWords = lostWords.filter(w => foundTitle.includes(w) || foundDesc.includes(w));
      if (matchedWords.length > 0) {
        nameScore = Math.min(25, Math.round((matchedWords.length / Math.max(1, lostWords.length)) * 25));
        matchReasons.push(`Title keywords matched: "${matchedWords.join(', ')}"`);
      }
    }
  }

  attributes.push({
    attribute: 'Name',
    score: nameScore,
    maxScore: 25,
    matchedValue: foundItem.title,
    isMatch: nameScore > 5,
    reason: nameScore > 5 ? `Name similarity (${nameScore}/25 pts)` : 'Different item names'
  });

  // 2. Category Comparison (Max 20 pts)
  let categoryScore = 0;
  if (lostItem.category && foundItem.category) {
    if (lostItem.category === foundItem.category) {
      categoryScore = 20;
      matchReasons.push(`Category match: ${foundItem.category}`);
    } else {
      categoryScore = 0;
    }
  }

  attributes.push({
    attribute: 'Category',
    score: categoryScore,
    maxScore: 20,
    matchedValue: foundItem.category,
    isMatch: categoryScore > 0,
    reason: categoryScore > 0 ? `Same category (${foundItem.category})` : 'Category mismatch'
  });

  // 3. Color Comparison (Max 15 pts)
  let colorScore = 0;
  const lostColor = extractColor(lostItem);
  const foundColor = extractColor(foundItem);

  if (lostColor && foundColor) {
    if (lostColor === foundColor) {
      colorScore = 15;
      matchReasons.push(`Matching color: ${foundColor}`);
    } else if (lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
      colorScore = 10;
      matchReasons.push(`Similar color shade: ${foundColor}`);
    }
  } else {
    // Neutral fallback if color is unspecified
    colorScore = 5;
  }

  attributes.push({
    attribute: 'Color',
    score: colorScore,
    maxScore: 15,
    matchedValue: foundColor || 'Unspecified',
    isMatch: colorScore >= 10,
    reason: colorScore >= 10 ? `Color match (${foundColor})` : (lostColor ? `Colors differ (${lostColor} vs ${foundColor || 'unspecified'})` : 'Color not specified')
  });

  // 4. Brand Comparison (Max 15 pts)
  let brandScore = 0;
  const lostBrand = extractBrand(lostItem);
  const foundBrand = extractBrand(foundItem);

  if (lostBrand && foundBrand) {
    if (lostBrand === foundBrand) {
      brandScore = 15;
      matchReasons.push(`Matching brand: ${foundBrand.toUpperCase()}`);
    } else if (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
      brandScore = 10;
      matchReasons.push(`Brand variant match: ${foundBrand.toUpperCase()}`);
    }
  } else {
    // Neutral score if brand isn't applicable or unspecified
    brandScore = 5;
  }

  attributes.push({
    attribute: 'Brand',
    score: brandScore,
    maxScore: 15,
    matchedValue: foundBrand ? foundBrand.toUpperCase() : 'Generic / Unspecified',
    isMatch: brandScore >= 10,
    reason: brandScore >= 10 ? `Brand match (${foundBrand.toUpperCase()})` : 'Brand mismatch or unspecified'
  });

  // 5. Location Comparison (Max 15 pts)
  let locationScore = 0;
  const lostLoc = (lostItem.location || '').toLowerCase();
  const foundLoc = (foundItem.location || '').toLowerCase();
  const lostBuilding = (lostItem.building || '').toLowerCase();
  const foundBuilding = (foundItem.building || '').toLowerCase();

  if (lostLoc && foundLoc) {
    if (lostLoc === foundLoc) {
      locationScore = 15;
      matchReasons.push(`Exact location match: ${foundItem.location}`);
    } else if ((lostBuilding && foundBuilding && lostBuilding === foundBuilding) || lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) {
      locationScore = 10;
      matchReasons.push(`Building proximity match: ${foundItem.location}`);
    } else {
      locationScore = 3;
    }
  }

  attributes.push({
    attribute: 'Location',
    score: locationScore,
    maxScore: 15,
    matchedValue: foundItem.location,
    isMatch: locationScore >= 10,
    reason: locationScore >= 10 ? `Location proximity (${foundItem.location})` : 'Different campus areas'
  });

  // 6. Date Comparison (Max 10 pts)
  let dateScore = 0;
  if (lostItem.date && foundItem.date) {
    const lostTime = new Date(lostItem.date).getTime();
    const foundTime = new Date(foundItem.date).getTime();
    const diffDays = Math.round((foundTime - lostTime) / (1000 * 3600 * 24));

    if (diffDays >= 0 && diffDays <= 2) {
      dateScore = 10;
      matchReasons.push(`Found within 48h of loss (${foundItem.date})`);
    } else if (diffDays >= 0 && diffDays <= 7) {
      dateScore = 8;
      matchReasons.push(`Found within 1 week of loss (${foundItem.date})`);
    } else if (diffDays >= 0 && diffDays <= 14) {
      dateScore = 5;
    } else if (diffDays < 0 && Math.abs(diffDays) <= 2) {
      // Reported found slightly before lost report date (common if report made later)
      dateScore = 7;
      matchReasons.push('Report date timestamp alignment');
    } else {
      dateScore = 2;
    }
  }

  attributes.push({
    attribute: 'Date',
    score: dateScore,
    maxScore: 10,
    matchedValue: foundItem.date,
    isMatch: dateScore >= 7,
    reason: dateScore >= 7 ? `Date alignment (${foundItem.date})` : 'Date gap > 2 weeks'
  });

  // Calculate total similarity percentage
  const totalRawScore = nameScore + categoryScore + colorScore + brandScore + locationScore + dateScore;
  const finalPercentage = Math.min(99, Math.max(15, totalRawScore));

  return {
    foundItem,
    similarityScore: finalPercentage,
    attributes,
    matchReasons
  };
}

/**
 * Searches all active found items in the database and returns sorted Smart Match results.
 */
export function findSmartMatchesForLostItem(
  lostItem: Partial<Item>,
  allFoundItems: Item[]
): SmartMatchResult[] {
  const activeFoundItems = allFoundItems.filter(
    (item) => item.type === 'found' && item.status === 'active'
  );

  const results = activeFoundItems.map((foundItem) =>
    calculateSmartMatchScore(lostItem, foundItem)
  );

  // Sort descending by highest similarity percentage
  results.sort((a, b) => b.similarityScore - a.similarityScore);
  return results;
}
