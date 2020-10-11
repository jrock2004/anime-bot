import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class Anime {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  bannerImage: string;

  @Column()
  title: object;

  @Column()
  status: string;

  @Column()
  description: string;

  @Column({nullable: true})
  nextAiringEpisode: object;

  @Column()
  episodes: number;

  @Column()
  genres: [];

  @Column()
  externalLinks: [];
}
