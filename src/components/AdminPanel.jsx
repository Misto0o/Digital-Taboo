import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const EMPTY_FORM = {
  id: null,
  category: '',
  difficulty: 'Beginner',
  safe_word: '',
  cant_say: ['', '', '', '', ''],
};

export default function AdminPanel({ onSignOut }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await supabase
      .from('cards')
      .select('id, category, difficulty, safe_word, cant_say, active')
      .order('category', { ascending: true })
      .order('safe_word', { ascending: true });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setCards(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const categories = useMemo(
    () => [...new Set(cards.map((c) => c.category))].sort(),
    [cards]
  );

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const matchesSearch =
        !search ||
        c.safe_word.toLowerCase().includes(search.toLowerCase()) ||
        (c.cant_say ?? []).some((w) => w.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !categoryFilter || c.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [cards, search, categoryFilter]);

  const openNewForm = () => {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditForm = (card) => {
    const cantSay = [...(card.cant_say ?? [])];
    while (cantSay.length < 5) cantSay.push('');
    setForm({
      id: card.id,
      category: card.category,
      difficulty: card.difficulty,
      safe_word: card.safe_word,
      cant_say: cantSay,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const updateCantSay = (index, value) => {
    setForm((f) => {
      const updated = [...f.cant_say];
      updated[index] = value;
      return { ...f, cant_say: updated };
    });
  };

  const handleSave = async () => {
    if (!form.category.trim() || !form.safe_word.trim()) {
      setErrorMsg('Category and Safe Word are required.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      category: form.category.trim(),
      difficulty: form.difficulty,
      safe_word: form.safe_word.trim(),
      cant_say: form.cant_say.map((w) => w.trim()).filter((w) => w.length > 0),
    };

    const { error } = form.id
      ? await supabase.from('cards').update(payload).eq('id', form.id)
      : await supabase.from('cards').insert(payload);

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    closeForm();
    fetchCards();
  };

  const handleDelete = async (card) => {
    if (!window.confirm(`Delete "${card.safe_word}"? This can't be undone.`)) return;
    const { error } = await supabase.from('cards').delete().eq('id', card.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    fetchCards();
  };

  const handleToggleActive = async (card) => {
    const { error } = await supabase
      .from('cards')
      .update({ active: !card.active })
      .eq('id', card.id);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    fetchCards();
  };

  return (
    <div className="screen admin-screen">
      <div className="admin-header">
        <h2>Card Manager</h2>
        <button className="btn btn-ghost btn-sm" onClick={onSignOut}>
          Sign Out
        </button>
      </div>

      <p className="setup-label">
        {cards.length} card{cards.length === 1 ? '' : 's'} total · {categories.length} categor
        {categories.length === 1 ? 'y' : 'ies'}
      </p>

      {errorMsg && <p className="admin-error">{errorMsg}</p>}

      <div className="admin-toolbar">
        <input
          className="text-input"
          placeholder="Search safe word or can't-say word…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" onClick={openNewForm}>
          + Add Card
        </button>
      </div>

      {formOpen && (
        <div className="admin-form">
          <label className="setup-label">{form.id ? 'Edit Card' : 'New Card'}</label>
          <div className="admin-form-row">
            <input
              className="text-input"
              placeholder="Category (e.g. PPE, Lockout/Tagout)"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <select
              className="admin-select"
              value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <input
            className="text-input"
            placeholder="Safe Word (the word teams guess)"
            value={form.safe_word}
            onChange={(e) => setForm((f) => ({ ...f, safe_word: e.target.value }))}
          />

          <label className="setup-label">Can't-Say Words (up to 5)</label>
          <div className="cant-say-inputs">
            {form.cant_say.map((word, i) => (
              <input
                key={i}
                className="text-input"
                placeholder={`Word ${i + 1}`}
                value={word}
                onChange={(e) => updateCantSay(i, e.target.value)}
              />
            ))}
          </div>

          <div className="admin-form-actions">
            <button className="btn btn-ghost btn-sm" onClick={closeForm} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Card'}
            </button>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        {loading ? (
          <p className="admin-empty">Loading cards…</p>
        ) : filteredCards.length === 0 ? (
          <p className="admin-empty">No cards match your search.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Safe Word</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Can't Say</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id}>
                  <td>{card.safe_word}</td>
                  <td>{card.category}</td>
                  <td>{card.difficulty}</td>
                  <td className="admin-cant-say-cell">{(card.cant_say ?? []).join(', ')}</td>
                  <td>
                    <span className="admin-pill">{card.active ? 'Active' : 'Hidden'}</span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button onClick={() => openEditForm(card)}>Edit</button>
                      <button onClick={() => handleToggleActive(card)}>
                        {card.active ? 'Hide' : 'Show'}
                      </button>
                      <button className="danger" onClick={() => handleDelete(card)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
