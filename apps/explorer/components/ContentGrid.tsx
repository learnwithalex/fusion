import ContentCard from "./ContentCard";

type Item = {
  id: string;
  title: string;
  description: string;
  image: string;
  price?: string;
};

export default function ContentGrid({ items }: { items: Item[] }) {
  return (
    <section id="explore" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Explore</h2>
        <a href="#" className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-black hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800" aria-label="View all content">
          View all
        </a>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <ContentCard key={item.id} title={item.title} description={item.description} image={item.image} price={item.price} />
        ))}
      </div>
    </section>
  );
}