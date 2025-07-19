import puppeteer from 'puppeteer';
import { mkdir, existsSync } from 'fs';
import { promisify } from 'util';

const mkdirAsync = promisify(mkdir);

const pages = [
  { url: 'http://localhost:8080/', name: 'Index' },
  { url: 'http://localhost:8080/admin-dashboard', name: 'AdminDashboard' },
  { url: 'http://localhost:8080/auth', name: 'Auth' },
  { url: 'http://localhost:8080/client-dashboard', name: 'ClientDashboard' },
  { url: 'http://localhost:8080/dashboard', name: 'Dashboard' },
  { url: 'http://localhost:8080/delivery-dashboard', name: 'DeliveryDashboard' },
  { url: 'http://localhost:8080/promotions', name: 'PromotionsPage' },
  { url: 'http://localhost:8080/reset-password', name: 'ResetPassword' },
  { url: 'http://localhost:8080/restaurant-dashboard', name: 'RestaurantDashboard' },
  { url: 'http://localhost:8080/restaurants', name: 'RestaurantsPage' },
  { url: 'http://localhost:8080/404', name: 'NotFound' }
];

(async () => {
  // Cria a pasta de screenshots se não existir
  if (!existsSync('docs/screenshots')) {
    await mkdirAsync('docs/screenshots', { recursive: true });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: `docs/screenshots/${p.name}.png`, fullPage: true });
    console.log(`Screenshot salvo: ${p.name}.png`);
  }

  await browser.close();
})();
