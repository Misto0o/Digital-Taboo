import { supabase } from './supabase';

export function track(event, payload = {}) {
  try {
    supabase
      .from('events')
      .insert({ event, payload })
      .then(() => {})
      .catch(() => {});
  } catch {
    // swallow
  }
}