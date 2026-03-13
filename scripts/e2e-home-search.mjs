import { chromium } from 'playwright';

function fail(message) {
  // eslint-disable-next-line no-console
  console.error(message);
  process.exitCode = 1;
}

async function main() {
  const baseUrl = 'http://localhost:5173/';

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const requests = [];
  const responses = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(String(err));
  });
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/car/by-location')) {
      requests.push({ method: req.method(), url });
    }
  });
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/car/by-location')) {
      responses.push({ status: res.status(), url });
    }
  });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Carros Disponíveis', { timeout: 15000 });

  const pickupSelect = page.locator('#pickup-location');
  await pickupSelect.waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForFunction(() => {
    const el = document.querySelector('#pickup-location');
    if (!el || !(el instanceof HTMLSelectElement)) return false;
    return el.options.length >= 2;
  });

  const pickupValue = await page.evaluate(() => {
    const el = document.querySelector('#pickup-location');
    if (!el || !(el instanceof HTMLSelectElement)) return null;
    const option = Array.from(el.options).find((o) => o.value && o.value.trim().length > 0);
    return option?.value ?? null;
  });

  if (!pickupValue) {
    fail('Nenhuma opção de local de retirada encontrada para selecionar.');
    await browser.close();
    return;
  }

  await pickupSelect.selectOption(pickupValue);
  await page.getByRole('button', { name: 'Buscar' }).click();

  await page.waitForURL(/\/search\?locationId=\d+/, { timeout: 15000 });
  const finalUrl = page.url();

  // Verifica que renderizou ao menos um card de carro (em home ou na search page)
  await page.waitForSelector('article.bg-neutral-white', { timeout: 15000 });
  const carCardsCount = await page.locator('article.bg-neutral-white').count();

  if (carCardsCount < 1) {
    fail('Nenhum card de carro encontrado após a busca.');
  }

  const matchingRequest = requests.find((r) => r.method === 'GET' && r.url.includes(`locationId=${pickupValue}`));
  const matchingResponse = responses.find((r) => r.url.includes(`locationId=${pickupValue}`));

  if (!matchingRequest) {
    fail(`Não foi observado request GET /car/by-location?locationId=${pickupValue}.`);
  }
  if (!matchingResponse) {
    fail(`Não foi observada response para /car/by-location?locationId=${pickupValue}.`);
  } else if (matchingResponse.status !== 200) {
    fail(`Response para /car/by-location?locationId=${pickupValue} não retornou 200 (status=${matchingResponse.status}).`);
  }

  if (consoleErrors.length > 0) {
    fail(`Erros no console (type=error):\n- ${consoleErrors.join('\n- ')}`);
  }
  if (pageErrors.length > 0) {
    fail(`Erros de página (pageerror):\n- ${pageErrors.join('\n- ')}`);
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: process.exitCode !== 1,
        finalUrl,
        pickupValue,
        carCardsCount,
        carByLocation: { request: matchingRequest, response: matchingResponse }
      },
      null,
      2
    )
  );

  await browser.close();
}

await main();
