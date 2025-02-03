import { cn } from '@/lib/utils';
import { Marquee } from '@/components/ui/marquee';

const reviews = [
  {
    name: 'Alice',
    username: '@alice',
    body: "DataXpert makes data analysis effortless. The visualizations are clean, and the UI is intuitive!",
    img: 'https://avatar.vercel.sh/alice',
  },
  {
    name: 'Bob',
    username: '@bob',
    body: "I've tried many tools, but DataXpert stands out with its simplicity and powerful features. Highly recommended!",
    img: 'https://avatar.vercel.sh/bob',
  },
  {
    name: 'Charlie',
    username: '@charlie',
    body: "The ability to quickly upload and analyze data is a game-changer for me. Saved me so much time!",
    img: 'https://avatar.vercel.sh/charlie',
  },
  {
    name: 'Diana',
    username: '@diana',
    body: "Being open-source is a huge plus! I love how customizable DataXpert is for my needs.",
    img: 'https://avatar.vercel.sh/diana',
  },
  {
    name: 'Ethan',
    username: '@ethan',
    body: "Finally, a data tool that doesn’t overcomplicate things. Simple, fast, and effective!",
    img: 'https://avatar.vercel.sh/ethan',
  },
  {
    name: 'Fiona',
    username: '@fiona',
    body: "The API access is fantastic! I integrated it into my workflow within minutes. Great job!",
    img: 'https://avatar.vercel.sh/fiona',
  }
];


const quarterLength = Math.ceil(reviews.length / 4); // Each quarter's length (round up if necessary)

const firstColumn = reviews.slice(0, quarterLength);
const secondColumn = reviews.slice(quarterLength, quarterLength * 2);
const thirdColumn = reviews.slice(quarterLength * 2, quarterLength * 3);
const fourthColumn = reviews.slice(quarterLength * 3);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        'relative w-full cursor-pointer overflow-hidden rounded-xl border p-4 mb-4',
        'border-gray-50/[.1] bg-gray-50/[.10] hover:bg-gray-50/[.15]',
      )}>
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-white">{name}</figcaption>
          <p className="text-xs font-medium text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-gray-300">{body}</blockquote>
    </figure>
  );
};

export function ReviewMarquee() {
  return (
    <section className="py-24 bg-gradient-to-t from-black via-black to-black overflow-hidden">
      <div className="container mx-auto">
      <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600 mb-12 text-center">
          What people are saying
        </h2>
        <div className="relative grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 overflow-hidden rounded-lg h-[500px]">
          <Marquee pauseOnHover className="[--duration:20s]" vertical={true}>
            {firstColumn.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:20s]" vertical={true}>
            {secondColumn.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee pauseOnHover className="[--duration:20s] hidden md:block" vertical={true}>
            {thirdColumn.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee pauseOnHover className="[--duration:20s] hidden lg:block" vertical={true}>
            {thirdColumn.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black"></div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black"></div>
        </div>
      </div>
    </section>
  );
}

