const moment = require('moment'),
   TurndownService = require('turndown'),
//   turndownService = new TurndownService(),
   fetch = require('node-fetch');

class internalRequests {
  constructor(anime, req, res) {
    this.req = req;
    this.res = res;
    this.anime = anime;
    this.isMarkdown = true;
  }

  searchAnime() {
    const variables = {
      anime: this.anime.searchTerm
    }

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
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    };

    let self = this;

    fetch(url, options)
      .then(this.handleResponse)
      .then((data) => {
        self.handleData(data, self);
      }).catch(this.handleError);
  }

  handleResponse(response) {
    return response.json().then((json) => {
      return response.ok ? json : Promise.reject(json);
    });
  }

  handleData(data, self) {
    const response = data.data.Media;

    if (self.req.body.response_url.indexOf('slack') > -1) {
      self.isMarkdown = false;
    }

    self.anime.jsonResponse.text = self.buildAnime(response);

    self.res.send(self.anime.jsonResponse);
  }

  handleError(error) {
    process.stdout.write(String(error));
    this.anime.jsonResponse.text = 'Anime not found!';

    this.res.send(this.anime.jsonResponse);
  }

  buildAnime(anime) {
    let responseText = '';

    responseText += this.getBannerImage(anime);
    responseText += this.getTitle(anime);
    //responseText += `> ${turndownService.turndown(anime.description).replace(/\n/g, " ")}\n\n`;
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
      return `# ${title} - ${anime.status}\n`
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

  getGenres(anime) {
    let genres = [];

    genres.push(...anime.genres);

    if (this.isMarkdown) {
      return `* *Genres:* ${genres.join(', ').replace(/,\s*$/, "")}\n`;
    } else {
      return `• *Genres:* ${genres.join(', ').replace(/,\s*$/, "")}\n`;
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
        return `* **External Links:** ${externalLinks.replace(/,\s*$/, "")}\n`;
      } else {
        return `• *External Links:* ${externalLinks.replace(/,\s*$/, "")}\n`;
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

module.exports = internalRequests;
