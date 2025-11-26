// app/search/autocomplete.js - placeholder
export function suggest(items, q){ return items.filter(i=> i.name && i.name.toLowerCase().includes(q.toLowerCase())); }
