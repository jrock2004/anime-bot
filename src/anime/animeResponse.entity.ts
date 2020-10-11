import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class AnimeResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  searchTerm: string;

  @Column({ unique: true })
  searchText: string;

  @Column()
  jsonResponse: object;
}
