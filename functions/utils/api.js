require('es6-promise').polyfill();
const fetch = require('isomorphic-fetch');

const moment = require('moment');

import { animeQuery } from './queries';
import stripHtml from 'string-strip-html';

export default class internalRequests {
  constructor(anime, req, res) {
    this.req = req;
    this.res = res;
    this.anime = anime;
    this.isMarkdown = req.body.response_url.indexOf('slack') > -1 ? false : true;
  }

  /**
   * Look up an anime
   *
   * @returns {string} The description about the anime
   */
  async searchAnime() {
    const variables = {
      anime: this.anime.searchTerm,
    };

    const url = 'https://graphql.anilist.co',
      options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: animeQuery,
          variables: variables,
        }),
      };

    return await fetch(url, options)
      .then(this.handleResponse)
      .then((data) => {
        return this.handleData(data, this, true);
      })
      .catch((e) => this.handleError(e));
  }

  /**
   * Takes the response and converts it to json or rejects the promise
   *
   * @param {object} response Response object from fetch
   * @returns {object}
   */
  handleResponse(response) {
    return response.json().then((json) => {
      return response.ok ? json : Promise.reject(json);
    });
  }

  /**
   * Grabs the return data and calls the function to build response
   *
   * @param {object} data Json response from fetch
   * @returns {string}
   */
  handleData(data) {
    const response = data.data.Media;

    return this.buildAnime(response);
  }

  /**
   * When there is a problem, this will log the error and return an error in the API
   *
   * @param {object} error
   */
  handleError(error) {
    console.log('ERROR: ', error);

    return 'Anime not found!';
  }

  /**
   * Take the response from the API call and format it to look nice
   *
   * @param {object} anime
   * @returns {string}
   */
  buildAnime(anime) {
    let responseText = '';

    responseText += this.getBannerImage(anime);
    responseText += this.getTitle(anime);
    responseText += `> ${stripHtml(anime.description).replace(/\n/g, ' ')}\n\n`;
    responseText += this.getNextEpisode(anime);
    responseText += this.getGenres(anime);
    responseText += this.getExternalLinks(anime);
    responseText += this.getSource();

    return responseText;
  }

  /**
   * Creates the text for a link to a cover image for the anime
   *
   * @param {object} anime
   * @returns {string}
   */
  getBannerImage(anime) {
    const title = anime.title.english || anime.title.romaji || anime.native;

    if (this.isMarkdown) {
      return `[${title}](${anime.bannerImage})\n\n`;
    } else {
      return `${anime.bannerImage}\n\n`;
    }
  }

  /**
   * Creates the text for the title and the status of the anime
   *
   * @param {object} anime
   * @returns {string}
   */
  getTitle(anime) {
    const title = anime.title.english || anime.title.romaji || anime.native;

    if (this.isMarkdown) {
      return `# ${title} - ${anime.status}\n`;
    } else {
      return `*${title}* - ${anime.status}\n\n`;
    }
  }

  /**
   * Creates the text for when the next episode is airing
   *
   * @param {object} anime
   * @returns {string}
   */
  getNextEpisode(anime) {
    if (anime.status !== 'FINISHED') {
      let nextEpisodeInSeconds = anime.nextAiringEpisode.timeUntilAiring,
        nextEpisode = anime.nextAiringEpisode.episode,
        currentDate = moment(new Date()),
        duration = currentDate.add(nextEpisodeInSeconds, 'seconds'),
        nextEpisodeDate = `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m`;

      if (this.isMarkdown) {
        return `* **Next Episode:** ${nextEpisode} will air in ${nextEpisodeDate}\n`;
      } else {
        return `• *Next Episode:* ${nextEpisode} will air in ${nextEpisodeDate}\n`;
      }
    } else {
      if (this.isMarkdown) {
        return `* **Total Episodes:** ${anime.episodes}\n`;
      } else {
        return `• *Total Episodes:* ${anime.episodes}\n`;
      }
    }
  }

  /**
   * Creates the text for the status of the manga
   *
   * @param {object} manga
   * @returns {string}
   */
  getRunningStatus(manga) {
    if (this.isMarkdown) {
      return `* **Status:** ${manga.status}\n`;
    } else {
      return `• *Status:* ${manga.status}\n`;
    }
  }

  /**
   * Creates the text for the list genres for the given anime
   *
   * @param {object} anime
   * @returns {string}
   */
  getGenres(anime) {
    let genres = [];

    genres.push(...anime.genres);

    if (this.isMarkdown) {
      return `* *Genres:* ${genres.join(', ').replace(/,\s*$/, '')}\n`;
    } else {
      return `• *Genres:* ${genres.join(', ').replace(/,\s*$/, '')}\n`;
    }
  }

  /**
   * Creates the text for the links for the given anime
   *
   * @param {object} anime
   * @returns {string}
   */
  getExternalLinks(anime) {
    let externalLinks = '';

    if (anime.externalLinks.length > 0) {
      anime.externalLinks.map((link) => {
        if (this.isMarkdown) {
          externalLinks += `[${link.site}](${link.url}), `;
        } else {
          externalLinks += `${link.site}, `;
        }
      });

      if (this.isMarkdown) {
        return `* **External Links:** ${externalLinks.replace(/,\s*$/, '')}\n`;
      } else {
        return `• *External Links:* ${externalLinks.replace(/,\s*$/, '')}\n`;
      }
    }

    return '';
  }

  /**
   * Creates the text for the source of where the information is coming from
   *
   * @returns {string}
   */
  getSource() {
    if (this.isMarkdown) {
      return '* **Source:** [Anilist](https://anilist.co) \n\n';
    } else {
      return '• *Source:* Anilist\n\n';
    }
  }
}
