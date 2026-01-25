import { Hero } from "./Components/hero";
import { Features } from "./Components/features";
import { HowItWorks } from "./Components/how-it-works";
import { MorningBriefing } from "./Components/morning-briefing";
import { CTA } from "./Components/cta";
import './styles/styles.css';
// import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Features />
      <HowItWorks />
      <MorningBriefing />
      <CTA />
      {/* <Footer /> */}
    </main>
  );
}


