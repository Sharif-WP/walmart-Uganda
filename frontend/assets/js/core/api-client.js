// core/api-client.js - wrapper over fetch
export async function get(path){ const r=await fetch(path); return r.json(); }
export async function post(path, body){ const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); return r.json(); }
