import Anime from '../anime/anime.entity';

// const moment = require('moment');
import moment from 'moment';
import { stripHtml } from "string-strip-html";

export const getBannerImage = (anime: Anime, isMarkdown: boolean): string => {
  const title = anime.title.english || anime.title.romaji || anime.title.native;

  if (isMarkdown) {
    return `[${title}](${anime.bannerImage})\n\n`;
  } else {
    return `${anime.bannerImage}\n\n`;
  }
};

export const getTitle = (anime: Anime, isMarkdown: boolean): string => {
  const title = anime.title.english || anime.title.romaji || anime.title.native;

  if (isMarkdown) {
    return `# ${title} - ${anime.status}\n`;
  } else {
    return `*${title}* - ${anime.status}\n\n`;
  }
};

export const getDescription = (anime: Anime): string => {
  return `> ${stripHtml(anime.description).result.replace(/\n/g, ' ')}\n\n`;
};

export const getNextEpisode = (anime: Anime, isMarkdown: boolean): string => {
  if (anime.status !== 'FINISHED') {
    let nextEpisodeInSeconds = anime.nextAiringEpisode.timeUntilAiring,
      nextEpisode = anime.nextAiringEpisode.episode,
      currentDate = moment(new Date()),
      duration = currentDate.add(nextEpisodeInSeconds, 'seconds'),
      nextEpisodeDate = `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m`;

    if (isMarkdown) {
      return `* **Next Episode:** ${nextEpisode} will air in ${nextEpisodeDate}\n`;
    } else {
      return `• *Next Episode:* ${nextEpisode} will air in ${nextEpisodeDate}\n`;
    }
  } else {
    if (isMarkdown) {
      return `* **Total Episodes:** ${anime.episodes}\n`;
    } else {
      return `• *Total Episodes:* ${anime.episodes}\n`;
    }
  }
};

export const getGenres = (anime: Anime, isMarkdown: boolean): string => {
  let genres: Array<string> = [...anime.genres];

  if (isMarkdown) {
    return `* *Genres:* ${genres.join(', ').replace(/,\s*$/, '')}\n`;
  } else {
    return `• *Genres:* ${genres.join(', ').replace(/,\s*$/, '')}\n`;
  }
};

export const getExternalLinks = (anime: Anime, isMarkdown: boolean): string => {
  let externalLinks = '';

  if (anime.externalLinks.length > 0) {
    anime.externalLinks.map((link) => {
      if (isMarkdown) {
        externalLinks += `[${link.site}](${link.url}), `;
      } else {
        externalLinks += `${link.site}, `;
      }
    });

    if (isMarkdown) {
      return `* **External Links:** ${externalLinks.replace(/,\s*$/, '')}\n`;
    } else {
      return `• *External Links:* ${externalLinks.replace(/,\s*$/, '')}\n`;
    }
  }

  return '';
};

export const getSource = (isMarkdown: boolean): string => {
  if (isMarkdown) {
    return '* **Source:** [Anilist](https://anilist.co) \n\n';
  } else {
    return '• *Source:* Anilist\n\n';
  }
};
