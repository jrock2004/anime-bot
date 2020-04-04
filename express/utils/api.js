const moment = require('moment'),
  TurndownService = require('turndown').default,
  turndownService = new TurndownService(),
  fetch = require('node-fetch').default;

module.exports = class internalRequests {
  constructor(anime, req, res) {
    this.req = req;
    this.res = res;
    this.anime = anime;
    this.isMarkdown = true;
  }

  searchManga() {
    const variables = {
      anime: this.anime.searchTerm,
    };

    const query = `
      query ($anime: String) {
        Media (search: $anime, type: MANGA) {
          id,
          bannerImage,
          title {
            romaji
            english
            native
          },
          status,
          description,
          genres,
          externalLinks {
            url,
            site
          },  
        }
      }
    `;

    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    };

    fetch(url, options)
      .then(this.handleResponse)
      .then((data) => {
        this.handleData(data, this, false);
      })
      .catch((e) => this.handleError(e, this));
  }

  searchAnime() {
    const variables = {
      anime: this.anime.searchTerm,
    };

    const query = `
      query ($anime: String) {
        Media (search: $anime, type: ANIME) {
          id
          bannerImage
          title {
            romaji
            english
            native
          },
          status
          description
          nextAiringEpisode {
            timeUntilAiring
            episode
          }
          episodes
          genres
          externalLinks {
            url
            site
          }
        }
      }
    `;

    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    };

    fetch(url, options)
      .then(this.handleResponse)
      .then((data) => {
        this.handleData(data, this, true);
      })
      .catch((e) => this.handleError(e, this));
  }

  handleResponse(response) {
    return response.json().then((json) => {
      return response.ok ? json : Promise.reject(json);
    });
  }

  handleData(data, self, isAnime) {
    const response = data.data.Media;

    if (self.req.body.response_url.indexOf('slack') > -1) {
      self.isMarkdown = false;
    }

    if (isAnime) {
      self.anime.jsonResponse.text = self.buildAnime(response);
    } else {
      self.anime.jsonResponse.text = self.buildManga(response);
    }

    self.res.send(self.anime.jsonResponse);
  }

  handleError(error, self) {
    console.log(error);

    self.anime.jsonResponse.text = 'Anime not found!';

    self.res.send(self.anime.jsonResponse);
  }

  buildAnime(anime) {
    let responseText = '';

    responseText += this.getBannerImage(anime);
    responseText += this.getTitle(anime);
    responseText += `> ${turndownService.turndown(anime.description).replace(/\n/g, ' ')}\n\n`;
    responseText += this.getNextEpisode(anime);
    responseText += this.getGenres(anime);
    responseText += this.getExternalLinks(anime);
    responseText += this.getSource();

    return responseText;
  }

  buildManga(manga) {
    let responseText = '';

    responseText += this.getBannerImage(manga);
    responseText += this.getTitle(manga);
    responseText += `> ${turndownService.turndown(manga.description).replace(/\n/g, ' ')}\n\n`;
    responseText += this.getRunningStatus(manga);
    responseText += this.getGenres(manga);
    responseText += this.getExternalLinks(manga);
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
};
