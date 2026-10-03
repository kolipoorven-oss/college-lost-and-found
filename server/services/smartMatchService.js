/**
 * Smart Lost & Found Matching Engine
 * 
 * Rule-based weighted scoring system with natural language text analysis.
 * Modular architecture designed to allow pluggable ML/LLM embeddings in future versions.
 */

// Common campus stop words to ignore during tokenization
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
  'from', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'lost', 'found', 'my', 'our', 'item', 'near', 'beside', 'around', 'please', 'help',
  'someone', 'anyone', 'has', 'have', 'had', 'was', 'were', 'is', 'are'
]);

// Color synonyms / affinities
const COLOR_FAMILIES = {
  black: ['black', 'dark', 'charcoal', 'jet black'],
  white: ['white', 'off-white', 'cream', 'ivory', 'silver'],
  blue: ['blue', 'navy', 'dark blue', 'light blue', 'cyan', 'sky blue'],
  red: ['red', 'maroon', 'crimson', 'burgundy'],
  gray: ['gray', 'grey', 'silver', 'slate', 'charcoal'],
  green: ['green', 'olive', 'lime', 'forest green', 'mint'],
  yellow: ['yellow', 'gold', 'mustard'],
  brown: ['brown', 'tan', 'beige', 'khaki'],
  purple: ['purple', 'violet', 'lavender']
};

// Known college campus location clusters
const LOCATION_CLUSTERS = [
  ['library', 'central library', 'library block', 'reading room', 'study room', 'reference section'],
  ['canteen', 'cafeteria', 'food court', 'mess', 'dining hall', 'snack bar'],
  ['gym', 'sports complex', 'gymnasium', 'badminton court', 'indoor stadium', 'football ground', 'cricket ground'],
  ['auditorium', 'main hall', 'open air theatre', 'seminar hall', 'oat'],
  ['computer lab', 'cs lab', 'software lab', 'it block', 'computer centre', 'server room'],
  ['science block', 'chemistry lab', 'physics lab', 'bio lab', 'research centre'],
  ['admin block', 'dean office', 'registrar', 'accounts office', 'main office', 'reception'],
  ['hostel', 'dorm', 'hall of residence', 'block a', 'block b', 'block c']
];

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function calculateTokenSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return { score: 0, matches: [] };
  const setB = new Set(tokensB);
  const common = tokensA.filter(token => setB.has(token));
  const uniqueCommon = [...new Set(common)];
  
  const union = new Set([...tokensA, ...tokensB]);
  const jaccard = union.size > 0 ? uniqueCommon.length / union.size : 0;
  
  return {
    score: Math.min(1, jaccard * 1.8), // Boost slight overlaps
    matches: uniqueCommon
  };
}

function compareColors(colorA, colorB) {
  if (!colorA || !colorB) return { match: false, partial: false };
  const a = colorA.toLowerCase().trim();
  const b = colorB.toLowerCase().trim();

  if (a === b || a.includes(b) || b.includes(a)) {
    return { match: true, partial: false };
  }

  for (const family of Object.values(COLOR_FAMILIES)) {
    const hasA = family.some(c => a.includes(c));
    const hasB = family.some(c => b.includes(c));
    if (hasA && hasB) {
      return { match: false, partial: true };
    }
  }

  return { match: false, partial: false };
}

function compareBrands(brandA, brandB, textA, textB) {
  const bA = (brandA || '').toLowerCase().trim();
  const bB = (brandB || '').toLowerCase().trim();

  if (bA && bB && (bA === bB || bA.includes(bB) || bB.includes(bA))) {
    return { match: true, brand: brandA };
  }

  // Cross check brand in text
  if (bA && (textB || '').toLowerCase().includes(bA)) {
    return { match: true, brand: brandA };
  }
  if (bB && (textA || '').toLowerCase().includes(bB)) {
    return { match: true, brand: brandB };
  }

  return { match: false };
}

function compareLocations(locA, locB) {
  if (!locA || !locB) return { score: 0, reason: null };
  const a = locA.toLowerCase().trim();
  const b = locB.toLowerCase().trim();

  if (a === b) {
    return { score: 1.0, reason: `Exact location: ${locA}` };
  }

  // Cluster match
  for (const cluster of LOCATION_CLUSTERS) {
    const hasA = cluster.some(item => a.includes(item));
    const hasB = cluster.some(item => b.includes(item));
    if (hasA && hasB) {
      return { score: 0.85, reason: `Campus zone match: '${locA}' & '${locB}'` };
    }
  }

  // Token similarity
  const tokensA = tokenize(locA);
  const tokensB = tokenize(locB);
  const sim = calculateTokenSimilarity(tokensA, tokensB);

  if (sim.score > 0.3) {
    return { score: 0.7, reason: `Similar location area: ${sim.matches.join(', ')}` };
  }

  return { score: 0, reason: null };
}

function compareDates(dateLostStr, dateFoundStr) {
  if (!dateLostStr || !dateFoundStr) return { score: 0.5, reason: 'Dates within reasonable timeline' };

  try {
    const dLost = new Date(dateLostStr);
    const dFound = new Date(dateFoundStr);
    const diffTime = Math.abs(dFound - dLost);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { score: 1.0, reason: 'Reported on the exact same date' };
    } else if (diffDays <= 2) {
      return { score: 0.9, reason: `Reported within ${diffDays} day(s) apart` };
    } else if (diffDays <= 7) {
      return { score: 0.7, reason: `Reported within 1 week (${diffDays} days)` };
    } else if (diffDays <= 14) {
      return { score: 0.4, reason: `Reported within 2 weeks (${diffDays} days)` };
    } else {
      return { score: 0.1, reason: `Reported ${diffDays} days apart` };
    }
  } catch (err) {
    return { score: 0.5, reason: 'Date check inconclusive' };
  }
}

/**
 * Calculates match score and reasons between a lost item and a found item
 */
function calculateMatch(lostItem, foundItem) {
  const reasons = [];
  const breakdown = {
    category: 0,
    keywords: 0,
    location: 0,
    color: 0,
    brand: 0,
    date: 0
  };

  // 1. Category Similarity (Weight: 25%)
  const catLost = (lostItem.category || '').toLowerCase().trim();
  const catFound = (foundItem.category || '').toLowerCase().trim();

  if (catLost && catFound && catLost === catFound) {
    breakdown.category = 25;
    reasons.push(`Same category: ${lostItem.category} (+25%)`);
  } else if (catLost && catFound) {
    // Check compatible categories
    const compatible = [
      ['electronics', 'accessories'],
      ['bags & wallets', 'clothing & accessories'],
      ['ids & cards', 'keys'],
      ['books & stationery', 'other']
    ];
    const isCompat = compatible.some(pair => 
      (pair.includes(catLost) && pair.includes(catFound))
    );
    if (isCompat) {
      breakdown.category = 10;
      reasons.push(`Compatible category: ${lostItem.category} & ${foundItem.category} (+10%)`);
    }
  }

  // 2. Keyword / Item Name Similarity (Weight: 25%)
  const textLost = `${lostItem.title || ''} ${lostItem.description || ''} ${lostItem.identifying_details || ''}`;
  const textFound = `${foundItem.title || ''} ${foundItem.description || ''} ${foundItem.identifying_details || ''}`;

  const tokensLost = tokenize(textLost);
  const tokensFound = tokenize(textFound);
  const titleTokensLost = tokenize(lostItem.title);
  const titleTokensFound = tokenize(foundItem.title);

  // Check title direct token match
  const titleSim = calculateTokenSimilarity(titleTokensLost, titleTokensFound);
  const textSim = calculateTokenSimilarity(tokensLost, tokensFound);

  const combinedKwScore = Math.min(1.0, titleSim.score * 0.65 + textSim.score * 0.35);
  breakdown.keywords = Math.round(combinedKwScore * 25);

  const matchedKeywords = [...new Set([...titleSim.matches, ...textSim.matches])];
  if (matchedKeywords.length > 0 && breakdown.keywords > 0) {
    reasons.push(`Matching keywords: "${matchedKeywords.slice(0, 4).join('", "')}" (+${breakdown.keywords}%)`);
  }

  // 3. Location Similarity (Weight: 20%)
  const locResult = compareLocations(lostItem.location, foundItem.location);
  breakdown.location = Math.round(locResult.score * 20);
  if (breakdown.location > 0 && locResult.reason) {
    reasons.push(`${locResult.reason} (+${breakdown.location}%)`);
  }

  // 4. Color Similarity (Weight: 10%)
  const colorRes = compareColors(
    lostItem.color || '', 
    foundItem.color || ''
  );
  if (colorRes.match) {
    breakdown.color = 10;
    reasons.push(`Same color: ${lostItem.color} (+10%)`);
  } else if (colorRes.partial) {
    breakdown.color = 6;
    reasons.push(`Similar color shade: ${lostItem.color} & ${foundItem.color} (+6%)`);
  }

  // 5. Brand Similarity (Weight: 10%)
  const brandRes = compareBrands(
    lostItem.brand,
    foundItem.brand,
    textLost,
    textFound
  );
  if (brandRes.match) {
    breakdown.brand = 10;
    reasons.push(`Matching brand: ${brandRes.brand || lostItem.brand || foundItem.brand} (+10%)`);
  }

  // 6. Date Proximity (Weight: 10%)
  const dateRes = compareDates(lostItem.date, foundItem.date);
  breakdown.date = Math.round(dateRes.score * 10);
  if (breakdown.date > 0 && dateRes.reason) {
    reasons.push(`${dateRes.reason} (+${breakdown.date}%)`);
  }

  // Total score calculation
  const totalScore = Math.min(100, Math.round(
    breakdown.category +
    breakdown.keywords +
    breakdown.location +
    breakdown.color +
    breakdown.brand +
    breakdown.date
  ));

  return {
    score: totalScore,
    reasons,
    breakdown
  };
}

/**
 * Find potential matches for an item against an array of candidate items.
 * Configurable threshold defaults to 55% to be inclusive of good matches.
 */
function findMatchesForItem(targetItem, candidateItems, threshold = 55) {
  const matches = [];

  for (const candidate of candidateItems) {
    // Match only if one is lost and other is found
    if (targetItem.type === candidate.type) continue;
    // Don't match the same user's item with itself if IDs are identical
    if (targetItem.id === candidate.id) continue;
    // Ignore items that are already recovered/returned/rejected
    if (['recovered', 'returned', 'rejected'].includes(candidate.status)) continue;

    const lostItem = targetItem.type === 'lost' ? targetItem : candidate;
    const foundItem = targetItem.type === 'found' ? targetItem : candidate;

    const result = calculateMatch(lostItem, foundItem);

    if (result.score >= threshold) {
      matches.push({
        lostItemId: lostItem.id,
        foundItemId: foundItem.id,
        matchedItem: candidate,
        score: result.score,
        reasons: result.reasons,
        breakdown: result.breakdown
      });
    }
  }

  // Sort descending by score
  return matches.sort((a, b) => b.score - a.score);
}

module.exports = {
  calculateMatch,
  findMatchesForItem,
  tokenize
};
