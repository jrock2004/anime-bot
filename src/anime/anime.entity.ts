import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class Anime {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  bannerImage: string;

  @Column()
  title: Title;

  @Column()
  status: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  nextAiringEpisode: NextAiringEpisode;

  @Column()
  episodes: number;

  @Column()
  genres: Array<string>;

  @Column()
  externalLinks: Array<ExternalLink>;
}

interface Title {
  romaji: string;
  english: string;
  native: string;
}

interface NextAiringEpisode {
  timeUntilAiring?: number;
  episode?: number;
}

interface ExternalLink {
  url: string;
  site: string;
}
