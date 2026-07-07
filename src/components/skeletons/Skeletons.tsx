// Loading fallbacks rendered by route-level loading.tsx files. Pure markup
// (server components) using the shared `.skeleton` shimmer utility, so a
// navigation shows structure instantly while the server component streams.

function PosterSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[2/3] w-full rounded-xl" />
      <div className="mt-3 space-y-2">
        <div className="skeleton h-3.5 w-4/5 rounded" />
        <div className="skeleton h-2.5 w-2/5 rounded" />
      </div>
    </div>
  );
}

function CatalogHeaderSkeleton() {
  return (
    <div className="px-5 pt-28 md:px-10 md:pt-32 lg:px-12">
      <div className="skeleton h-3 w-32 rounded" />
      <div className="skeleton mt-4 h-14 w-72 rounded-lg md:h-20 md:w-96" />
      <div className="skeleton mt-5 h-4 w-full max-w-xl rounded" />
      <div className="skeleton mt-2 h-4 w-4/5 max-w-md rounded" />
    </div>
  );
}

function ChipRowSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden px-5 py-3 md:px-10 lg:px-12">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="skeleton h-9 w-24 shrink-0 rounded-full" />
      ))}
    </div>
  );
}

export function CatalogGridSkeleton() {
  return (
    <div aria-hidden="true">
      <CatalogHeaderSkeleton />
      <div className="mt-8 border-y border-white/[0.06]">
        <ChipRowSkeleton />
      </div>
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-8 px-5 py-9 sm:grid-cols-3 md:grid-cols-4 md:px-10 lg:grid-cols-5 lg:px-12 xl:grid-cols-6">
        {Array.from({ length: 18 }).map((_, index) => (
          <PosterSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function SpotlightSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-3xl px-5 pt-32 md:px-10">
      <div className="skeleton mx-auto h-4 w-40 rounded" />
      <div className="skeleton mx-auto mt-5 h-16 w-full rounded-2xl" />
      <div className="mt-6 flex justify-center gap-2">
        <div className="skeleton h-9 w-20 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-16 rounded-full" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-3.5 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <PosterSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div aria-hidden="true" className="px-5 pt-28 md:px-10 md:pt-32 lg:px-12">
      <div className="flex items-center gap-6">
        <div className="skeleton h-24 w-24 rounded-full md:h-28 md:w-28" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-8 w-56 rounded-lg" />
          <div className="skeleton h-3.5 w-40 rounded" />
        </div>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
      <div className="mt-12 grid grid-cols-2 gap-x-3.5 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <PosterSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
