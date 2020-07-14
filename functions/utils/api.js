require('es6-promise').polyfill();
require('isomorphic-fetch');

const moment = require('moment');

import { animeQuery } from './queries';

export default class internalRequests {
  constructor(anime, req, res) {
    this.req = req;
    this.res = res;
    this.anime = anime;
    this.isMarkdown = req.body.response_url.indexOf('slack') > -1 ? false : true;
  }

  async searchAnime() {
    const variables = {
      anime: this.anime.searchTerm,
    };

    const url = 'https://graphql.anilist.co';
    const options = {
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

  handleResponse(response) {
    return response.json().then((json) => {
      return response.ok ? json : Promise.reject(json);
    });
  }

  handleData(data) {
    const response = data.data.Media;

    return this.buildAnime(response);
  }

  handleError(error) {
    console.log('ERROR: ', error);

    return 'Anime not found!';
  }

  buildAnime(anime) {
    let responseText = '';

    responseText += this.getBannerImage(anime);
    responseText += this.getTitle(anime);
    responseText += `> ${anime.description.replace(/\n/g, ' ')}\n\n`;
    responseText += this.getNextEpisode(anime);
    responseText += this.getGenres(anime);
    responseText += this.getExternalLinks(anime);
    responseText += this.getSource();

    return responseText;
  }

  getBannerImage(anime) {
    const title = anime.title.english || anime.title.romaji || anime.native;

    if (this.isMarkdown) {
      return `[${title}](${anime.bannerImage})\n\n`;
    } else {
      return `${anime.bannerImage}\n\n`;
    }
  }

  getTitle(anime) {
    const title = anime.title.english || anime.title.romaji || anime.native;

    if (this.isMarkdown) {
      return `# ${title} - ${anime.status}\n`;
    } else {
      return `*${title}* - ${anime.status}\n\n`;
    }
  }

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

  getRunningStatus(manga) {
    if (this.isMarkdown) {
      return `* **Status:** ${manga.status}\n`;
    } else {
      return `• *Status:* ${manga.status}\n`;
    }
  }

  getGenres(anime) {
    let genres = [];

    genres.push(...anime.genres);

    if (this.isMarkdown) {
      return `* *Genres:* ${genres.join(', ').replace(/,\s*$/, '')}\n`;
    } else {
      return `• *Genres:* ${genres.join(', ').replace(/,\s*$/, '')}\n`;
    }
  }

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

  getSource() {
    if (this.isMarkdown) {
      return '* **Source:** [Anilist](https://anilist.co) \n\n';
    } else {
      return '• *Source:* Anilist\n\n';
    }
  }
}
