import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Shuffle helper (unchanged from your original cards.js)
export function shuffleCards(cardArray) {
  return [...cardArray].sort(() => Math.random() - 0.5);
}

// Enrich a card's cantSay list with words pulled out of the safe word itself,
// so players can't just say a piece of the answer. Mirrors the logic that
// used to live inline in useGameState's startGame/initGuestGame.
//
// IMPORTANT: dedup is done case-INsensitively. The source data already
// includes Title Case versions of the safe word's own components in its
// curated cantSay list (e.g. "Authorized Employee" -> cantSay includes
// "Authorized", "Employee"). A naive `new Set([...cantSay, ...wordParts])`
// is case-SENSITIVE, so "Authorized" and "authorized" both survive the Set
// and then collide visually once the UI calls .toUpperCase() — showing the
// same word twice on the card. We dedup on a lowercased key but keep the
// original casing of whichever version we saw first (the curated one).
export function enrichCard(card) {
  const wordParts = card.safeWord
    .toLowerCase()
    .split(' ')
    .filter((w) => w.length > 2);

  const seen = new Set();
  const allForbidden = [];
  for (const word of [...card.cantSay, ...wordParts]) {
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    allForbidden.push(word);
  }

  return { ...card, cantSay: allForbidden };
}

/**
 * Fetches active cards from Supabase and exposes them in the same shape
 * the game already expects: { id, safeWord, cantSay }.
 *
 * Also derives the full list of distinct categories present in the data,
 * so adding a new category in the admin page (e.g. a future "Environmental"
 * edition) shows up in the game's filter automatically — no code changes.
 */
export function useCards() {
  const [allCards, setAllCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('cards')
      .select('id, category, difficulty, safe_word, cant_say')
      .eq('active', true);

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const mapped = (data ?? []).map((row) => ({
      id: row.id,
      category: row.category,
      difficulty: row.difficulty,
      safeWord: row.safe_word,
      cantSay: row.cant_say ?? [],
    }));

    setAllCards(mapped);
    setCategories([...new Set(mapped.map((c) => c.category))].sort());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  /**
   * Build a shuffled, enriched deck.
   * @param {string[]} selectedCategories - empty array or omitted = all categories
   */
  const buildDeck = useCallback(
    (selectedCategories = []) => {
      const pool =
        selectedCategories.length === 0
          ? allCards
          : allCards.filter((c) => selectedCategories.includes(c.category));

      return shuffleCards(pool.map(enrichCard));
    },
    [allCards]
  );

  return {
    allCards,
    categories,
    loading,
    error,
    buildDeck,
    refetch: fetchCards,
  };
}
