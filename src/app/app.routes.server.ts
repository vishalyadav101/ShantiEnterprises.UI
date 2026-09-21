import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

const API_URL = 'https://shantienterprisesapi.onrender.com/api/Product';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'home',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'products',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,

    async getPrerenderParams() {
      console.log('Fetching products for prerendering...');

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const products = await response.json();

      if (!Array.isArray(products)) {
        throw new Error('Invalid product response from API.');
      }

      const activeProducts = products.filter((product) => product.isActive === true);

      console.log(`Found ${activeProducts.length} active products for prerendering.`);

      return activeProducts.map((product) => ({
        id: String(product.productId),
      }));
    },

    fallback: PrerenderFallback.Client,
  },

  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
