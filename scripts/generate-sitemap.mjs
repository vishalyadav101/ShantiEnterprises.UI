import { writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const sitemapPath = path.join(projectRoot, 'public', 'sitemap.xml');

const API_URL = 'https://shantienterprisesapi.onrender.com/api/Product';

const SITE_URL = 'https://shanti-enterprises-ui-qf9v.vercel.app';

async function generateSitemap() {
  try {
    console.log('Fetching products from API...');

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const products = await response.json();

    if (!Array.isArray(products)) {
      throw new Error('Invalid product response from API.');
    }

    // Only active products should be included in sitemap
    const activeProducts = products.filter((product) => product.isActive === true);

    console.log(`Found ${activeProducts.length} active products.`);

    const urls = [
      {
        loc: `${SITE_URL}/`,
        changefreq: 'daily',
        priority: '1.0',
      },
      {
        loc: `${SITE_URL}/home`,
        changefreq: 'daily',
        priority: '1.0',
      },
      {
        loc: `${SITE_URL}/products`,
        changefreq: 'daily',
        priority: '0.9',
      },
      ...activeProducts.map((product) => ({
        loc: `${SITE_URL}/products/${product.productId}`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: product.createdDate ? new Date(product.createdDate).toISOString() : undefined,
      })),
    ];

    const urlEntries = urls
      .map((url) => {
        const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';

        return `  <url>
    <loc>${escapeXml(url.loc)}</loc>${lastmod}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
      })
      .join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urlEntries}

</urlset>
`;

    await writeFile(sitemapPath, sitemap, 'utf8');

    console.log(`Sitemap generated successfully: ${sitemapPath}`);
    console.log(`Total URLs: ${urls.length}`);
  } catch (error) {
    console.error('Failed to generate sitemap:', error.message);

    // Keep the existing sitemap if API is temporarily unavailable.
    try {
      await access(sitemapPath);

      console.warn('Existing sitemap.xml was preserved.');
    } catch {
      console.error('No existing sitemap.xml found.');

      process.exitCode = 1;
    }
  }
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

generateSitemap();
