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

      try {
        const response = await fetch(API_URL, {
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          console.warn(`Product API returned ${response.status}; using client fallback.`);
          return [];
        }

        const products: unknown = await response.json();

        if (!Array.isArray(products)) {
          console.warn('Product API returned an invalid response.');
          return [];
        }

        const activeProducts = products.filter(
          (product: any) => product?.isActive === true && product?.productId != null,
        );

        console.log(`Found ${activeProducts.length} active products for prerendering.`);

        return activeProducts.map((product: any) => ({
          id: String(product.productId),
        }));
      } catch (error) {
        console.warn('Product prerender fetch failed; using client fallback.', error);
        return [];
      }
    },

    fallback: PrerenderFallback.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
