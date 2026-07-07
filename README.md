# Andshow

A cinematic Next.js UI shell for browsing mock TMDB-backed movies and series, with watch routes, player diagnostics, and a source selector.

## Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Custom Sources

Andshow ships with Vidking as the iframe source and Cineby as a top-level external fallback. You can add one local iframe provider through environment variables for a provider you are allowed to embed.

Copy `.env.example` to `.env.local`, edit the templates, then restart `bun dev`.

```bash
cp .env.example .env.local
```

Supported placeholders:

- `{tmdbId}` or `{id}`
- `{mediaType}`
- `{season}`
- `{episode}`

Example:

```bash
NEXT_PUBLIC_ANDSHOW_CUSTOM_EMBED_LABEL="House"
NEXT_PUBLIC_ANDSHOW_CUSTOM_MOVIE_EMBED_TEMPLATE="https://watch.example.test/movie/{tmdbId}"
NEXT_PUBLIC_ANDSHOW_CUSTOM_TV_EMBED_TEMPLATE="https://watch.example.test/tv/{tmdbId}/{season}/{episode}"
```

Only `http` and `https` templates are accepted.
