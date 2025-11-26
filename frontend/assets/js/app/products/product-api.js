// app/products/product-api.js - placeholder
export async function fetchProducts(){
  const res = await fetch('/walmart-uganda/backend/public/api/v1/products');
  return res.json();
}
