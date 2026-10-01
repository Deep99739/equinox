import { Hero } from "./Components/hero";
import { Features } from "./Components/features";
import { HowItWorks } from "./Components/how-it-works";
import { MorningBriefing } from "./Components/morning-briefing";
import { CTA } from "./Components/cta";
import './styles/styles.css';
import { Navbar } from '../../components/Navbar/Navbar';
import SignedInNavbar from '../../components/Navbar/SignedInNavbar';
import { isAuthenticated, signOut } from '../../utils/authUtils';

export default function Home() {
  const signedIn = isAuthenticated();
  // const signedIn = true; // FORCE SHOW NAVBAR FOR DEMO

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <>
      {signedIn ? (
        <SignedInNavbar onSignOut={handleSignOut} />
      ) : (
        <Navbar />
      )}
      <main className="min-h-screen bg-background">
        <Hero />
        <Features />
        <HowItWorks />
        <MorningBriefing />
        <CTA />
        {/* <Footer /> */}
      </main>
    </>
  );
}
