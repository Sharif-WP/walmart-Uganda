// core/utils.js - small helpers
export function $id(id){ return document.getElementById(id); }
export function el(tag, cls){ const e = document.createElement(tag); if (cls) e.className = cls; return e; }
