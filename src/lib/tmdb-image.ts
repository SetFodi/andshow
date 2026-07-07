const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export type PosterSize = 'w342' | 'w500' | 'w780'
export type BackdropSize = 'w780' | 'w1280' | 'original'

export function posterUrl(path: string, size: PosterSize = 'w500'): string {
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function backdropUrl(path: string, size: BackdropSize = 'w1280'): string {
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}
