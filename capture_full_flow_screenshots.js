import puppeteer from 'puppeteer';
import { mkdir, existsSync } from 'fs';
import { promisify } from 'util';

const mkdirAsync = promisify(mkdir);

const users = [
  {
    type: 'restaurante',
    email: 'dapaw87051@jeanssi.com',
    password: 'A*mW4YXq2rj-([YD',
    dashboard: '/restaurant-dashboard',
  },
  {
    type: 'entregador',
    email: 'xicocas626@linacit.com',
    password: 'Wb8233580',
    dashboard: '/delivery-dashboard',
  },
  {
    type: 'admin',
    email: 'romeuwb@yahoo.com.br',
    password: '#Wb8233580',
    dashboard: '/admin-dashboard',
  },
  {
    type: 'cliente',
    email: 'maucolabpython@gmail.com',
    password: 'teste1234@',
    dashboard: '/client-dashboard',
  }
];

const loginUrl = 'http://localhost:8080/auth';
const baseUrl = 'http://localhost:8080';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  if (!existsSync('docs/screenshots')) {
    await mkdirAsync('docs/screenshots', { recursive: true });
  }

  for (const user of users) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.waitForSelector('#password', { timeout: 10000 });

    // Limpa os campos antes de digitar
    await page.evaluate(() => { document.querySelector('#email').value = ''; });
    await page.evaluate(() => { document.querySelector('#password').value = ''; });

    await page.type('#email', user.email, { delay: 50 });
    await page.type('#password', user.password, { delay: 50 });
    await page.click('button[type="submit"]');

    // Aguarda redirecionamento para o painel correto
    const dashboardUrl = baseUrl + user.dashboard;
    let dashboardOk = false;
    for (let i = 0; i < 20; i++) {
      if (page.url().startsWith(dashboardUrl)) {
        dashboardOk = true;
        break;
      }
      await delay(1000);
    }
    // Captura screenshot intermediário para diagnóstico
    await delay(1000);
    await page.screenshot({ path: `docs/screenshots/${user.type}_after_login.png`, fullPage: true });
    if (!dashboardOk) {
      console.log(`NÃO FOI PARA O PAINEL DE ${user.type.toUpperCase()}: ${page.url()}`);
      await browser.close();
      continue;
    }

    // Captura screenshot do painel inicial
    await delay(1000);
    await page.screenshot({ path: `docs/screenshots/${user.type}_dashboard.png`, fullPage: true });
    console.log(`Screenshot salvo: ${user.type}_dashboard.png`);

    // Busca por mais tipos de elementos clicáveis no menu
    const menuSelectors = [
      'nav button', 'nav a', 'aside button', 'aside a', '.sidebar button', '.sidebar a', '.menu button', '.menu a',
      'nav [role="button"]', 'aside [role="button"]', '.sidebar [role="button"]', '.menu [role="button"]',
      'nav div[tabindex]', 'aside div[tabindex]', '.sidebar div[tabindex]', '.menu div[tabindex]'
    ];
    let menuButtons = [];
    for (const sel of menuSelectors) {
      const handles = await page.$$(sel);
      for (const handle of handles) {
        const text = await page.evaluate(el => el.textContent.trim(), handle);
        if (text && !menuButtons.some(b => b.text === text)) {
          menuButtons.push({ handle, text });
        }
      }
    }
    console.log(`[${user.type}] Botões/abas encontrados no menu:`, menuButtons.map(b => b.text));

    // Clica em cada botão/aba do menu e captura screenshot
    for (let i = 0; i < menuButtons.length; i++) {
      const { text } = menuButtons[i];
      // Rebusca o botão pelo texto a cada iteração (SPA pode re-renderizar)
      let btn = null;
      for (const sel of menuSelectors) {
        const btns = await page.$$(sel);
        for (const b of btns) {
          const t = await page.evaluate(el => el.textContent.trim(), b);
          if (t === text) {
            btn = b;
            break;
          }
        }
        if (btn) break;
      }
      if (!btn) continue;
      try {
        await btn.click();
        await delay(2000); // Aguarda mais tempo para garantir carregamento
        await page.screenshot({ path: `docs/screenshots/${user.type}_${i}_${text.replace(/[^a-zA-Z0-9]/g,'_')}.png`, fullPage: true });
        console.log(`Screenshot salvo: ${user.type}_${i}_${text}.png`);
        // Procura por tabs internas e clica nelas
        const tabSelectors = ['.tabs button', '.tabs a', '.ant-tabs-tab', '.MuiTab-root', '.tab', '.tab-item', '[role="tab"]', 'div[role="tab"]'];
        let tabButtons = [];
        for (const tsel of tabSelectors) {
          const thandles = await page.$$(tsel);
          for (const th of thandles) {
            const ttext = await page.evaluate(el => el.textContent.trim(), th);
            if (ttext && !tabButtons.some(tb => tb.text === ttext)) {
              tabButtons.push({ handle: th, text: ttext });
            }
          }
        }
        console.log(`[${user.type}] Tabs internas encontradas:`, tabButtons.map(tb => tb.text));
        for (let j = 0; j < tabButtons.length; j++) {
          const { text: tabText } = tabButtons[j];
          let tabBtn = null;
          for (const tsel of tabSelectors) {
            const tbtns = await page.$$(tsel);
            for (const tb of tbtns) {
              const tbt = await page.evaluate(el => el.textContent.trim(), tb);
              if (tbt === tabText) {
                tabBtn = tb;
                break;
              }
            }
            if (tabBtn) break;
          }
          if (!tabBtn) continue;
          try {
            await tabBtn.click();
            await delay(1200);
            await page.screenshot({ path: `docs/screenshots/${user.type}_${i}_tab${j}_${tabText.replace(/[^a-zA-Z0-9]/g,'_')}.png`, fullPage: true });
            console.log(`Screenshot salvo: ${user.type}_${i}_tab${j}_${tabText}.png`);
          } catch (e) {
            console.log(`Erro ao clicar/capturar tab ${tabText}:`, e.message);
          }
        }
      } catch (e) {
        console.log(`Erro ao clicar/capturar ${text}:`, e.message);
      }
    }
    await browser.close();
  }
})();
