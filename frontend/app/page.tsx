import FAQSection from '@/components/LandingPage/Faqs';
import GetStarted from '@/components/LandingPage/get-started-section';
import  Hero  from '@/components/LandingPage/hero-section';
import { ReviewMarquee } from '@/components/LandingPage/reviews-section';
import Navbar from '@/components/LandingPage/nav-bar';
import Footer from '@/components/LandingPage/footer';
import { constructMetadata } from '@/lib/metadata';
import FeatureSection from '@/components/LandingPage/feature-section';
import { LayoutGridDemo } from '@/components/LandingPage/feature-grid';
import FeedbackBox from '@/components/LandingPage/feedback';
import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata = constructMetadata({
  title: 'DataXpert - Predictive Analytics Made Easy',
  description:
    'DataXpert is a predictive analytics platform that makes it easy to explore data, build models, and make predictions.',
});

export default function Home() {
  return (
    <ScrollArea scrollHideDelay={10}>
      <Navbar />
      <Hero />
      <FeatureSection/>
      <LayoutGridDemo/>
      <FAQSection />
      <ReviewMarquee />
      <FeedbackBox/>
      <GetStarted />
      <Footer />
    </ScrollArea>
  );
}
