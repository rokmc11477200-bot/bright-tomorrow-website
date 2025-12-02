import Hero from '@/components/sections/Hero';
import ProblemSolution from '@/components/sections/ProblemSolution';
import Packages from '@/components/sections/Packages';
import PortfolioBeforeAfter from '@/components/sections/PortfolioBeforeAfter';
import ProcessTimeline from '@/components/sections/ProcessTimeline';
import LightAdmin from '@/components/sections/LightAdmin';
import OptionsTable from '@/components/sections/OptionsTable';
import PolicyStrip from '@/components/sections/PolicyStrip';
import FAQ from '@/components/sections/FAQ';
import ContactMultiStep from '@/components/sections/ContactMultiStep';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProblemSolution />
      <Packages />
      <PortfolioBeforeAfter />
      <ProcessTimeline />
      <LightAdmin />
      <OptionsTable />
      <PolicyStrip />
      <FAQ />
      <ContactMultiStep />
      <Footer />
    </main>
  );
}
