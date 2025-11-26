// core/localStorage-manager.js - placeholder
export function lsGet(k){ return JSON.parse(localStorage.getItem(k)||'null'); }
export function lsSet(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
