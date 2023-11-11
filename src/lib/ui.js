import { getLaunch, searchLaunches } from './api.js';
import { el } from './elements.js';

/**
 * Býr til leitarform.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarstrengur.
 * @returns {HTMLElement} Leitarform.
 */
export function renderSearchForm(searchHandler, query = undefined) {
  const form = el(
    'form',
    {},
    el('input', { value: query ?? '', name: 'query', id: 'searchInput' }),
    el('button', {}, 'Leita'),
  );

  form.addEventListener('submit', searchHandler);
  return form;
}

/**
 * Setur „loading state“ skilabað meðan gögn eru sótt.
 * @param {HTMLElement} parentElement Element sem á að birta skilbaoð í.
 * @param {Element | undefined} searchForm Leitarform sem á að gera óvirkt.
 */
function setLoading(parentElement, searchForm = undefined) {
  let loadingMessage = parentElement.querySelector('.loading');

  if (!loadingMessage) {
    loadingMessage = el('div', { class: 'loading' }, 'Sæki gögn...');
    parentElement.appendChild(loadingMessage);
  }

  if (!searchForm) {
    return;
  }

  const button = searchForm.querySelector('button');

  if (button) {
    button.setAttribute('disabled', 'true');
  }
}

/**
 * Fjarlægir „loading state“.
 * @param {HTMLElement} parentElement Element sem inniheldur skilaboð.
 * @param {Element | undefined} searchForm Leitarform sem á að gera virkt.
 */
function setNotLoading(parentElement, searchForm = undefined) {
  const loadingMessage = parentElement.querySelector('.loading');

  if (loadingMessage) {
    loadingMessage.remove();
  }

  const disabledButton = searchForm.querySelector('button[disabled]');

  if (disabledButton) {
    disabledButton.removeAttribute('disabled');
  }
}

/**
 * Birta niðurstöður úr leit.
 * @param {import('./api.types.js').Launch[] | null} results Niðurstöður úr leit
 * @param {string} query Leitarstrengur.
 */
function createSearchResults(results, query) {
  const list = el('ul', { class: 'results' });

  if (!results) {
    const noResultList = el('li', {}, `Villa við leit að ${query}`);
    list.appendChild(noResultList);
    return list;
  }

  if (results.length === 0) {
    const noResultList = el(
      'li',
      {},
      `Engar niðurstöður fyrir leit að ${query}`,
    );
    list.appendChild(noResultList);
    return list;
  }

  const searchWord = el('span', {}, `Leitarniðurstöður fyrir '${query}'`);
  list.appendChild(searchWord);

  for (const result of results) {
    const resultElement = el(
      'li',
      { class: 'result' },
      el('a', { href: `?id=${result.id}`, class: 'name' }, result.name),
      el('span', { class: 'name' }, '🚀 ', result.status.name),
      el('span', { class: 'mission' }, 'Geimferð: ', result.mission),
    );
    list.appendChild(resultElement);
  }

  return list;
}

/**
 *
 * @param {HTMLElement} parentElement Element sem á að birta niðurstöður í.
 * @param {Element} searchForm Form sem á að gera óvirkt.
 * @param {string} query Leitarstrengur.
 */
export async function searchAndRender(parentElement, searchForm, query, id) {
  const mainElement = parentElement.querySelector('main');

  if (!mainElement) {
    console.warn('fann ekki <main> element');
    return;
  }

  const resultElement = mainElement.querySelector('.results');

  if (resultElement) {
    resultElement.remove();
  }

  setLoading(mainElement, searchForm);
  const results = await searchLaunches(query, id);
  setNotLoading(mainElement, searchForm);

  const resultEl = createSearchResults(results, query);

  mainElement.appendChild(resultEl);
}

/**
 * Sýna forsíðu, hugsanlega með leitarniðurstöðum.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export function renderFrontpage(
  parentElement,
  searchHandler,
  query = undefined,
) {
  const heading = el(
    'h1',
    { class: 'heading', 'data-foo': 'bar' },
    'Geimskotaleitin 🚀',
  );

  const searchForm = renderSearchForm(searchHandler, query);
  const container = el('main', {}, heading, searchForm);
  parentElement.appendChild(container);

  if (!query) {
    return;
  }

  searchAndRender(parentElement, searchForm, query);

  searchForm.addEventListener('submit', searchHandler);
}

/**
 * Sýna geimskot.
 * @param {HTMLElement} parentElement Element sem á að innihalda geimskot.
 * @param {string} id Auðkenni geimskots.
 */
export async function renderDetails(parentElement, id) {
  const container = el('main', {});
  const loadingId = el('div', { class: 'loading' }, 'Sæki gögn...');
  const backElement = el(
    'div',
    { class: 'back' },
    el('a', { href: '/' }, 'Til baka'),
  );

  let launchNameElement;
  let launchStartElement;
  let launchEndElement;
  let statusNameElement;
  let statusDescriptionElement;
  let missionNameElement;
  let missionDescriptionElement;
  let launchImageElement;

  try {
    parentElement.appendChild(loadingId);
    const result = await getLaunch(id);
    parentElement.appendChild(loadingId).remove();

    if (result) {
      launchNameElement = el('h1', {}, result.name);
      launchStartElement = el(
        'span',
        {},
        'Gluggi opnast: ',
        result.window_start,
      );
      launchEndElement = el('span', {}, 'Gluggi lokast: ', result.window_end);
      statusNameElement = el('h2', {}, `Staða: ${result.status.name}`);
      statusDescriptionElement = el('p', {}, `${result.status.description}`);
      missionNameElement = el('h2', {}, `Geimferð: ${result.mission.name}`);
      missionDescriptionElement = el('p', {}, `${result.mission.description}`);
      launchImageElement = el('img', {
        src: `${result.image}`,
        alt: `${result.name}`,
      });
    } else {
      throw new Error('Enginn gögn fundust.');
    }
  } catch (error) {
    console.error('Villa við að sækja upplýsingar:', error);
  }

  container.appendChild(launchNameElement);
  container.appendChild(launchStartElement);
  container.appendChild(launchEndElement);
  container.appendChild(statusNameElement);
  container.appendChild(statusDescriptionElement);
  container.appendChild(missionNameElement);
  container.appendChild(missionDescriptionElement);
  container.appendChild(launchImageElement);
  container.appendChild(backElement);
  parentElement.appendChild(container);
}
