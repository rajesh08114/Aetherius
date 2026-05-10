'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const A = '/aetherius/assets';

const navItems = ['Home', 'Pages', 'Tour List', 'Tour Search', 'Blog'];

const features = [
  {
    title: '15 Years of Experiences',
    text: 'Host our community of good-natured campers, glampers, and RV travelers on your land or at your cabin.',
    icon: `${A}/icon1.png`,
  },
  {
    title: '200+ Camps To Visit',
    text: 'Host our community of good-natured campers, glampers, and RV travelers on your land or at your cabin.',
    icon: `${A}/icon2.png`,
  },
  {
    title: 'Big Community',
    text: 'Host our community of good-natured campers, glampers, and RV travelers on your land or at your cabin.',
    icon: `${A}/icon3.png`,
  },
];

const activities = [
  ['Backpacking Trips', '5 tours', 'kevin-ianeselli-ebnlHkqfUHY-unsplash-600x800.jpg'],
  ['Basecamp Tours', '6 tours', 'tommy-lisbin-xr-y6Ruw7K8-unsplash-600x800.jpg'],
  ['Family Camping', '8 tours', 'dominik-jirovsky-re2LZOB2XvY-unsplash-1-600x800.jpg'],
  ['Glamping', '6 tours', 'aldeen-li-jH2vyek3t8Q-unsplash-600x800.jpg'],
  ['Trekking', '6 tours', 'alexander-milo-GuEu9Y0AkBQ-unsplash-600x800.jpg'],
  ['Winter Camping', '5 tours', 'aaron-benson-200753-unsplash-600x800.jpg'],
];

const popularTours = [
  {
    title: 'Munich Springfest Camping',
    duration: '3 days',
    location: 'Munich, Germany',
    reviews: '1 Review',
    price: '$3,800',
    oldPrice: '$3,900',
    image: 'nicole-giampietro-jZ5FymUZBqQ-unsplash-900x500.jpg',
  },
  {
    title: '9 Days Tour du Mont Blanc Camping Trek',
    duration: '9 days 8 night',
    location: 'Chamonix, France',
    reviews: '2 Reviews',
    price: '$5,800',
    oldPrice: '$6,300',
    image: 'jace-afsoon-K4XHqPZq66c-unsplash-900x500.jpg',
  },
  {
    title: '3 Days Camping Tour du Mont Blanc',
    duration: '3 days',
    location: 'Laon, France',
    reviews: '1 Review',
    price: '$5,500',
    image: 'daniel-j-schwarz-Hhe9c31780A-unsplash-900x500.jpg',
  },
  {
    title: 'Roughing it in Style: Luxury Camping Tours',
    duration: '7 days 6 Night',
    location: 'Ansen, Netherlands',
    reviews: '1 Review',
    price: '$4,500',
    image: 'abiwin-krisna-6eI51hKNDfM-unsplash-900x500.jpg',
  },
];

const newTours = [
  {
    title: 'Courmayeur - Rifugio Giorgio Bertone 7 Days 6 Night',
    duration: '7 days 6 night',
    location: 'Courmayeur, Aosta Valley, Italy',
    reviews: '1 Review',
    price: '$4,900',
    oldPrice: '$5,100',
    image: 'laurine-bailly-qkMQ5N2d9aY-unsplash-900x500.jpg',
  },
  {
    title: '5 Days Vivonne Bay Campground, Kangaroo Island, South Australia',
    duration: '5 days 4 night',
    location: 'Vivonne Bay SA, Australia',
    reviews: '1 Review',
    price: '$3,900',
    image: 'dominik-jirovsky-re2LZOB2XvY-unsplash-900x500.jpg',
  },
  {
    title: 'Walker Creek Campground, Litchfield, Northern Territory',
    duration: '3 days 2 night',
    location: 'California, USA',
    reviews: '1 Review',
    price: '$3,200',
    image: 'dino-reichmuth-pl1mhwMctJc-unsplash-900x500.jpg',
  },
  {
    title: 'Camping Tour Mount Rainier National Park, Washington',
    duration: '4 days 3 night',
    location: 'Washington, USA',
    reviews: '1 Review',
    price: '$3,500',
    image: 'samuel-girven-nw-kHaHI9fs-unsplash-900x500.jpg',
  },
  {
    title: 'Waterfront Campground, Cockatoo Island, New South Wales',
    duration: '7 days 6 night',
    location: 'New South Wales, Australia',
    reviews: '1 Review',
    price: '$4,000',
    image: 'pexels-photo-442559-900x500.jpeg',
  },
  {
    title: 'Adventure Camping Tour Package, Himachal Pradesh',
    duration: '7 days',
    location: 'Rampur Bushahar, India',
    reviews: '1 Review',
    price: '$4,500',
    image: 'iStock-904172104-900x500.jpg',
  },
];

const posts = [
  {
    title: 'Tips for a Safe and Enjoyable Tour',
    image: 'lucija-ros-538672-unsplash-700x500.jpg',
  },
  {
    title: 'A Tour of the Best High Altitude Campsites',
    image: 'pexels-photo-739365-700x500.jpeg',
  },
  {
    title: 'How to Pack for Comfort and Convenience',
    image: 'anastasia-petrova-193818-unsplash-700x500.jpg',
  },
];

const testimonials = [
  ['Jennth Norz', 'San Francisco', 'p02-150x150.jpg'],
  ['David Doe', 'Traveler', 'po05-150x150.jpg'],
  ['Jane Smith', 'New York City', 'p01-150x150.jpg'],
];

function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Header() {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 h-[96px] bg-aetherius-nav text-white shadow-[0_1px_0_rgba(255,255,255,0.05)]">
      <div className="grid h-full grid-cols-[190px_1fr_auto_auto] max-lg:grid-cols-[170px_1fr_auto]">
        <Link href="/" className="flex items-center justify-center bg-black px-6" aria-label="Aetherius home">
          <Image src={`${A}/logo-aetherius.png`} alt="Aetherius" width={112} height={72} priority className="h-auto w-[106px]" />
        </Link>
        <nav className="hidden items-center justify-center gap-[50px] text-[20px] font-bold leading-none lg:flex">
          {navItems.map((item) => (
            <Link key={item} href={item === 'Home' ? '/' : '/trips'} className="group relative py-9 hover:text-white">
              {item}
              <span className="absolute bottom-[18px] left-0 h-[3px] w-0 bg-aetherius-gold transition-all group-hover:w-7" />
              {item === 'Home' && <span className="absolute bottom-[18px] left-0 h-[3px] w-7 bg-aetherius-gold" />}
            </Link>
          ))}
        </nav>
        <button
          className="hidden min-w-[146px] items-center justify-center gap-2 bg-aetherius-charcoal px-9 text-[15px] font-bold uppercase tracking-[0.28em] lg:flex"
          aria-label="Select currency"
        >
          USD <ChevronDown className="h-4 w-4" />
        </button>
        {isAuthenticated ? (
          <Link
            href="/trips"
            className="hidden min-w-[160px] items-center justify-center bg-aetherius-gold px-9 text-[19px] font-semibold text-black transition-colors hover:bg-aetherius-gold-2 sm:flex"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="hidden min-w-[124px] items-center justify-center bg-aetherius-gold px-9 text-[19px] font-semibold text-black transition-colors hover:bg-aetherius-gold-2 sm:flex"
          >
            Login
          </Link>
        )}
        <button className="mr-5 place-self-center text-white lg:hidden" aria-label="Open menu">
          <Menu className="h-8 w-8" />
        </button>
      </div>
    </header>
  );
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mx-auto mb-[44px] flex max-w-[1536px] items-center justify-between px-[20px] md:px-[80px] xl:px-[182px]">
      <h2 className="text-[34px] font-semibold leading-tight text-black">{title}</h2>
      {action && (
        <Link href="/trips" className="text-[19px] font-normal text-aetherius-gold hover:text-black">
          {action}
        </Link>
      )}
    </div>
  );
}

function SearchBar() {
  return (
    <section className="relative z-30 -mt-[50px] px-5">
      <form
        action="/explore/cities"
        className="mx-auto grid max-w-[1536px] overflow-hidden rounded-[20px] bg-aetherius-field shadow-[0_20px_35px_rgba(20,20,20,0.08)] md:grid-cols-[1fr_1fr_1fr_205px]"
        aria-label="Search tours"
      >
        {[
          ['Keywords', 'Type Your Keywords', false],
          ['Destination', 'Any', true],
          ['Duration', 'Any', true],
        ].map(([label, value, dropdown]) => (
          <label key={label as string} className="block px-[38px] py-[36px] text-[21px] font-semibold text-black">
            {label}
            <span className="mt-[19px] flex items-center justify-between text-[19px] font-normal text-aetherius-muted">
              <span>{value}</span>
              {dropdown && <ChevronDown className="h-5 w-5 text-black" />}
            </span>
          </label>
        ))}
        <button
          type="submit"
          className="flex min-h-[148px] flex-col items-center justify-center gap-[16px] bg-aetherius-gold text-[19px] font-semibold text-black transition-colors hover:bg-aetherius-gold-2"
        >
          <Search className="h-8 w-8" strokeWidth={3} />
          Search Now
        </button>
      </form>
    </section>
  );
}

function Rating({ reviews }: { reviews: string }) {
  return (
    <div className="mb-[12px] flex items-center gap-1 text-black">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-[17px] w-[17px] fill-current" strokeWidth={0} />
      ))}
      <span className="ml-2 text-[18px] font-semibold text-aetherius-muted">({reviews})</span>
    </div>
  );
}

function TourCard({ tour, badge = false }: { tour: (typeof popularTours)[number]; badge?: boolean }) {
  return (
    <article className="group">
      <Link href="/trips" className="block">
        <div className="relative aspect-[1.8] overflow-hidden rounded-[10px] bg-aetherius-line">
          <Image
            src={`${A}/${tour.image}`}
            alt={tour.title}
            fill
            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
            loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {badge && (
            <span className="absolute bottom-[15px] left-[15px] rounded-[5px] bg-black px-[14px] py-[8px] text-[16px] font-bold text-white">
              Popular Tour
            </span>
          )}
        </div>
        <div className="pt-[36px]">
          <Rating reviews={tour.reviews} />
          <h3 className="min-h-[58px] text-[28px] font-semibold leading-[1.2] tracking-[-0.5px] text-aetherius-heading transition-colors group-hover:text-aetherius-gold">
            {tour.title}
          </h3>
          <div className="mt-[22px] space-y-[10px] text-[22px] font-semibold text-aetherius-muted">
            <p className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-aetherius-muted" />
              {tour.duration}
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-aetherius-muted" />
              {tour.location}
            </p>
          </div>
          <p className="mt-[14px] text-[22px] font-semibold text-aetherius-muted">
            From{' '}
            {tour.oldPrice && <span className="mr-2 text-aetherius-muted line-through">{tour.oldPrice}</span>}
            <span className="text-aetherius-gold">{tour.price}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}

function BlogCard({ post }: { post: (typeof posts)[number] }) {
  return (
    <article className="group overflow-hidden rounded-[10px] bg-white shadow-[0_30px_35px_rgba(10,10,10,0.09)]">
      <Link href="/community" className="block">
        <div className="relative aspect-[1.4] overflow-hidden">
          <Image
            src={`${A}/${post.image}`}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
            loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="p-[30px] pb-5">
          <p className="mb-[18px] text-[18px] font-normal text-black">March 10, 2023 <span className="mx-4">•</span> Jane Smith</p>
          <h3 className="flex min-h-[62px] items-start justify-between gap-4 text-[27px] font-semibold leading-[1.18] text-black">
            <span>{post.title}</span>
            <ArrowUpRight className="mt-1 h-5 w-5 shrink-0" />
          </h3>
          <div className="mt-[26px] flex gap-3">
            {['Camping', 'Travel'].map((tag) => (
              <span key={tag} className="rounded-[7px] border border-aetherius-line px-[18px] py-[7px] text-[16px]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-josefin text-aetherius-heading">
      <Header />

      <section className="relative min-h-[780px] bg-black text-white">
        <Image src={`${A}/hero-campger-bg.jpg`} alt="Aetherius view at sunset" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/25" />
        <FadeIn className="relative z-10 mx-auto flex min-h-[780px] max-w-[1180px] flex-col items-center justify-center px-5 pb-[52px] text-center">
          <p className="mb-[28px] text-[43px] font-medium uppercase leading-none tracking-[5px]">Explore</p>
          <h1 className="text-[58px] font-bold uppercase leading-[1.02] tracking-[8px] md:text-[83px]">The New World</h1>
          <p className="mt-[30px] text-[20px] font-normal text-white">Discover and book tent camping, RV parks, cabins, treehouses, and glamping.</p>
          <Link
            href="/trips"
            className="mt-[42px] bg-aetherius-gold px-[38px] py-[18px] text-[15px] font-bold text-black transition-colors hover:bg-aetherius-gold-2"
          >
            Discover Tours
          </Link>
        </FadeIn>
      </section>

      <SearchBar />

      <section className="relative bg-white pb-[78px] pt-[190px]">
        <Image src={`${A}/top-bg.jpg`} alt="" fill sizes="100vw" className="pointer-events-none object-cover object-center opacity-100" />
        <div className="relative mx-auto grid max-w-[1180px] gap-12 px-5 md:grid-cols-3">
          {features.map((feature) => (
            <FadeIn key={feature.title} className="text-center">
              <Image src={feature.icon} alt="" width={125} height={125} loading="lazy" className="mx-auto h-[125px] w-[125px]" />
              <h2 className="mb-[23px] mt-[37px] text-[22px] font-semibold text-black">{feature.title}</h2>
              <p className="mx-auto max-w-[360px] text-[19px] font-normal leading-[1.95] text-aetherius-muted">{feature.text}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-white pb-[30px]">
        <SectionTitle title="By Activities" action="View All Activities" />
        <div className="mx-auto grid max-w-[1536px] gap-[30px] px-5 md:grid-cols-2 xl:grid-cols-4">
          {activities.slice(0, 4).map(([name, tours, image]) => (
            <Link key={name} href="/explore/cities" className="group relative block aspect-[0.76] overflow-hidden rounded-[10px] bg-black">
              <Image
                src={`${A}/${image}`}
                alt={name}
                fill
                sizes="(min-width: 1280px) 24vw, (min-width: 768px) 48vw, 100vw"
                loading="lazy"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-[25px] font-semibold">{name}</h3>
                <p className="mt-2 text-[17px]">{tours}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative bg-white pb-[74px] pt-[96px]">
        <Image src={`${A}/Group-5825.jpg`} alt="" fill sizes="100vw" className="pointer-events-none object-cover object-center" />
        <SectionTitle title="Our Popular Tours" action="View All Tours" />
        <div className="relative mx-auto max-w-[1536px] px-5 md:px-[80px] xl:px-[182px]">
          <button className="absolute left-[92px] top-[255px] hidden text-aetherius-arrow xl:block" aria-label="Previous popular tours">
            <ChevronLeft className="h-12 w-12" strokeWidth={1.6} />
          </button>
          <button className="absolute right-[92px] top-[255px] hidden text-aetherius-arrow xl:block" aria-label="Next popular tours">
            <ChevronRight className="h-12 w-12" strokeWidth={1.6} />
          </button>
          <div className="grid gap-[50px] md:grid-cols-3">
            {popularTours.slice(0, 3).map((tour) => (
              <TourCard key={tour.title} tour={tour} badge />
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-white pb-[106px]">
        <Image src={`${A}/hp-tour-bg-2-n.jpg`} alt="" fill sizes="100vw" className="pointer-events-none object-cover object-center opacity-[0.72]" />
        <SectionTitle title="New Tours" action="View All Tours" />
        <div className="relative mx-auto max-w-[1536px] px-5 md:px-[80px] xl:px-[182px]">
          <button className="absolute left-[92px] top-[258px] hidden text-aetherius-arrow xl:block" aria-label="Previous new tours">
            <ChevronLeft className="h-12 w-12" strokeWidth={1.6} />
          </button>
          <button className="absolute right-[92px] top-[258px] hidden text-aetherius-arrow xl:block" aria-label="Next new tours">
            <ChevronRight className="h-12 w-12" strokeWidth={1.6} />
          </button>
          <div className="grid gap-[50px] md:grid-cols-3">
            {newTours.slice(0, 3).map((tour) => (
              <TourCard key={tour.title} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[802px] bg-white py-[30px]">
        <Image src={`${A}/wave-bg.jpg`} alt="" fill sizes="100vw" className="pointer-events-none object-cover object-center" />
        <div className="relative mx-auto grid max-w-[1180px] gap-12 px-5 lg:grid-cols-2">
          <div className="min-h-[610px]" aria-hidden="true" />
          <FadeIn className="pt-[16px]">
            <h2 className="text-[43px] font-bold leading-[1.22] tracking-[-0.3px] text-[#262626]">
              Aetherius is the best way to find camping tours. Let&apos;s make the most memorable adventures.
            </h2>
            <p className="mt-[42px] max-w-[690px] text-[22px] font-normal leading-[1.72] text-[#444444]">
              Aetherius Tour is an incredible way to have an adventurous outdoor experience of world renowned national parks and wilderness destinations while hiking with only a light daypack and sleeping soundly in comfortable, vehicle-accessible camps.
            </p>
            <div className="mt-[70px] grid gap-14 md:grid-cols-2">
              <div>
                <Image src={`${A}/w1.jpg`} alt="" width={64} height={64} loading="lazy" className="h-16 w-16" />
                <p className="mt-[30px] text-[58px] font-bold leading-none text-aetherius-gold">1980</p>
                <h3 className="mt-[36px] text-[23px] font-bold text-black">The First Trip We Operated</h3>
                <p className="mt-[20px] text-[20px] leading-[1.7] text-[#777777]">We are in this industries for more than 40 year!</p>
              </div>
              <div>
                <Image src={`${A}/map.png`} alt="" width={64} height={64} loading="lazy" className="h-16 w-16" />
                <p className="mt-[30px] text-[58px] font-bold leading-none text-aetherius-gold">1000+</p>
                <h3 className="mt-[36px] text-[23px] font-bold text-black">Locations Worldwide</h3>
                <p className="mt-[20px] text-[20px] leading-[1.7] text-[#777777]">With more than 1000 locations for your choices</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-white pb-[20px] pt-[84px]">
        <div className="mx-auto grid max-w-[1360px] grid-cols-2 gap-[30px] px-5 md:grid-cols-5">
          {['g1.png', 'g2.png', 'g3.png', 'g4.png', 'g5.png'].map((image) => (
            <Image key={image} src={`${A}/${image}`} alt="" width={234} height={160} loading="lazy" className="mx-auto h-auto w-[190px] opacity-40 md:w-[234px]" />
          ))}
        </div>
      </section>

      <section className="relative bg-white pb-[110px] pt-[120px]">
        <Image src={`${A}/hp-blog-bg.jpg`} alt="" fill sizes="100vw" className="pointer-events-none object-cover object-center" />
        <SectionTitle title="Get the Latest News" action="View All Tours" />
        <div className="relative mx-auto grid max-w-[1536px] gap-[50px] px-5 md:grid-cols-3 md:px-[80px] xl:px-[182px]">
          {posts.map((post) => (
            <BlogCard key={post.title} post={post} />
          ))}
        </div>
      </section>

      <section className="relative bg-white py-[60px]">
        <Image src={`${A}/hp-cta-bg-1.png`} alt="" fill sizes="100vw" className="pointer-events-none object-contain object-center" />
        <FadeIn className="relative mx-auto max-w-[920px] px-5 text-center">
          <h2 className="text-[34px] font-bold text-black">We offer tours in a range of locations</h2>
          <p className="mx-auto mt-[24px] max-w-[820px] text-[18px] leading-[1.75] text-[#444444]">
            Our mountain tours take you to the highest peaks, where you can witness stunning vistas and enjoy the crisp mountain air. Our beach tours, on the other hand, offer a chance to relax and unwind on the sandy shores.
          </p>
          <Link href="/trips" className="mt-[34px] inline-flex bg-aetherius-gold px-[30px] py-[16px] text-[15px] font-semibold text-black hover:bg-aetherius-gold-2">
            Discover Tours
          </Link>
        </FadeIn>
      </section>

      <section className="bg-white pb-[50px] pt-[60px]">
        <h2 className="mb-[50px] text-center text-[34px] font-bold text-black">What Customers Said</h2>
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 md:grid-cols-3">
          {testimonials.map(([name, place, image]) => (
            <article key={name} className="rounded-[20px] bg-[#f7f7f7] p-[40px] shadow-[0_4px_40px_rgba(0,0,0,0.025)]">
              <div className="flex items-center gap-5">
                <Image src={`${A}/${image}`} alt={name} width={82} height={82} loading="lazy" className="h-[82px] w-[82px] rounded-full" />
                <div>
                  <h3 className="text-[16px] font-bold text-[#12022f]">{name}</h3>
                  <p className="text-[16px] text-[#898989]">{place}</p>
                </div>
              </div>
              <div className="mt-6 flex text-aetherius-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-5 text-[18px] leading-[1.65] text-[#565656]">
                The tours in this website are great. I had been really enjoy with my family! The team is very professional and taking care of the customers.
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="bg-aetherius-footer text-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-[70px] md:grid-cols-[1.15fr_0.85fr_0.85fr_1fr]">
          <div>
            <Image src={`${A}/logo-aetherius.png`} alt="Aetherius" width={126} height={81} loading="lazy" className="h-auto w-[126px]" />
            <p className="mt-8 max-w-sm text-[17px] leading-[1.8] text-white/62">
              Discover and book tent camping, RV parks, cabins, treehouses, and glamping with TravelLoop.
            </p>
          </div>
          <div>
            <h3 className="mb-6 text-[20px] font-bold">Useful Links</h3>
            <ul className="space-y-3 text-[17px] text-white/62">
              <li>Customer Support</li>
              <li>Privacy &amp; Policy</li>
              <li>Our Story</li>
              <li>Be Our Partner</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-6 text-[20px] font-bold">Contact</h3>
            <ul className="space-y-3 text-[17px] text-white/62">
              <li>T: 1-634-567-34</li>
              <li>E: info@goodlayers.com</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-6 text-[20px] font-bold">Pay Safely With Us</h3>
            <p className="text-[17px] leading-[1.8] text-white/62">The payment is encrypted and transmitted securely with an SSL protocol.</p>
            <div className="mt-6 flex gap-4 text-white">
              <CreditCard className="h-7 w-7" />
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-7 text-[15px] text-white/52 md:flex-row md:items-center md:justify-between">
            <p>Copyright © 2026 GoodLayers. All Rights Reserved.</p>
            <div className="flex gap-7">
              <Link href="#">Terms of Service</Link>
              <Link href="#">Privacy Policy</Link>
              <Link href="#">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
