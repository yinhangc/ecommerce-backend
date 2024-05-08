export class ListDataDto {
  skip: number;
  take: number;
  filter: { [key: string]: string | number };
  orderBy: { [key: string]: 'asc' | 'desc' }[];
}
