export type MediaType = 'movie' | 'tv'

export interface Title {
  /** TMDB id — kept stable so the mock catalog can swap for the real API. */
  id: number
  mediaType: MediaType
  name: string
  /** First release year, used for sorting and "new" checks. */
  year: number
  /** Display form: "2010" for films, "2022–" or "2018–2023" for series. */
  yearLabel: string
  /** "2h 28m" for films, "4 Seasons" / "Miniseries" for series. */
  runtimeLabel: string
  /** 0–10, one decimal. */
  rating: number
  genres: readonly string[]
  overview: string
  cast: readonly string[]
  /** TMDB image paths like "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg". */
  posterPath: string
  backdropPath: string
}

export type RailLayout = 'poster' | 'wide'

/** How mock data declares a rail: title ids resolved by the catalog layer. */
export interface RailDefinition {
  id: string
  heading: string
  layout: RailLayout
  ids: readonly number[]
}

export interface ContinueWatchingEntry {
  titleId: number
  /** 0–1 fraction watched. */
  progress: number
  /** e.g. "1h 48m left" or "S2 · E7". */
  remainingLabel: string
}

/** A rail resolved for rendering. */
export interface RailItem {
  title: Title
  progress?: number
  remainingLabel?: string
  season?: number
  episode?: number
}

export interface Rail {
  id: string
  heading: string
  layout: RailLayout
  items: readonly RailItem[]
}
