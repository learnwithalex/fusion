import Image from "next/image";

type Creator = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  earnings: string;
};

export default function TrendingCreators({ creators }: { creators: Creator[] }) {
  return (
    <section id="creators" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold">Trending Creators</h2>
        <a href="#" className="text-sm text-black/70 hover:text-black" aria-label="View all creators">
          View all
        </a>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((c) => (
          <a
            key={c.id}
            href="#"
            aria-label={`Open ${c.name} profile`}
            className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 shadow-card transition duration-200 ease-spring hover:-translate-y-0.5"
          >
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-tr from-pink-400/30 via-violet-400/30 to-blue-400/30 blur-3xl" />
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full ring-1 ring-black/10">
                <Image src={c.avatar} alt={`${c.name} avatar`} fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-black/60">{c.handle}</p>
                  </div>
                  <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white">{c.earnings}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-xs font-medium text-black/80 hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 active:scale-95"
                    aria-label={`Explore ${c.name}`}
                  >
                    Explore
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-black/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 active:scale-95"
                    aria-label={`Follow ${c.name}`}
                  >
                    Follow
                  </button>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}