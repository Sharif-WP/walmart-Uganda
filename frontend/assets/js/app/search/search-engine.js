// app/search/search-engine.js - placeholder
export function search(products, q){ return products.filter(p=> (p.name||'').toLowerCase().includes(q.toLowerCase())); }
