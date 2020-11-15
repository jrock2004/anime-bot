export const animeQuery = `
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
