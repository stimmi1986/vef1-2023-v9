/**
 * API föll.
 * @see https://lldev.thespacedevs.com/2.2.0/swagger/
 */

/**
 * Sækjum týpurnar okkar.
 * @typedef {import('./api.types.js').Launch} Launch
 * @typedef {import('./api.types.js').LaunchDetail} LaunchDetail
 * @typedef {import('./api.types.js').LaunchSearchResults} LaunchSearchResults
 */

/** Grunnslóð á API (DEV útgáfa) */
const API_URL = 'https://lldev.thespacedevs.com/2.2.0/';

/**
 * Skilar Promise sem bíður í gefnar millisekúndur.
 * Gott til að prófa loading state, en einnig hægt að nota `throttle` í
 * DevTools.
 * @param {number} ms Tími til að sofa í millisekúndum.
 * @returns {Promise<void>}
 */
export async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), ms);
  });
}

/**
 * Leita í geimskota API eftir leitarstreng.
 * @param {string} query Leitarstrengur.
 * @returns {Promise<Launch[] | null>} Fylki af geimskotum eða `null` ef villa
 *  kom upp.
 */
export async function searchLaunches(query) {
  const url = new URL('launch', API_URL);
  url.searchParams.set('search', query);
  url.searchParams.set('mode', 'list');

  let response;

  try {
    response = await fetch(url);
  } catch (e) {
    console.error('Villa kom upp við að sækja gögn:', e);
    return null;
  }

  if (!response.ok) {
    console.error(
      'Villa við að sækja gögn, ekki 200 staða',
      response.status,
      response.statusText,
    );
    return null;
  }

  let json;
  try {
    json = await response.json();
  } catch (e) {
    console.error('Villa við að vinna úr JSON', e);
    return null;
  }

  if (!json.results) {
    console.error('Gögn í svari frá API eru tóm', json);
    return null;
  }

  return json.results;
}

/**
 * Skilar stöku geimskoti eftir auðkenni eða `null` ef ekkert fannst.
 * @param {string} id Auðkenni geimskots.
 * @returns {Promise<LaunchDetail | null>} Geimskot.
 */
export async function getLaunch(id) {
  const url = new URL('launch', API_URL);
  url.searchParams.set('id', id);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Fékk ekki 200 status frá API fyrir geimskot: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.results[0];
  } catch (e) {
    console.error('Villa við að sækja gögn um geimskot', e);
    return null;
  }
}
