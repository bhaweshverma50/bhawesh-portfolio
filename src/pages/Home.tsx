import { Hero } from '../sections/Hero';
import { About } from '../sections/About';
import { Featured } from '../sections/Featured';
import { CTA } from '../sections/CTA';
import { Marquee } from '../components/Marquee';

export function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Featured />
      <CTA />
    </>
  );
}
