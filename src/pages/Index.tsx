import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Briefcase, Mail, FileText, BarChart2, Github } from "lucide-react";
import { HeroSection } from "@/components/blocks/hero-section";
import { Menu, MenuItem, ProductItem, HoveredLink } from "@/components/ui/navbar-menu";
import { Case } from "@/components/ui/cases-with-infinite-scroll";
import { Feature } from "@/components/ui/feature-section-with-bento-grid";
import { PricingSection } from "@/components/ui/pricing-section";
import { Testimonials } from "@/components/ui/testimonials";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Index = () => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="fixed top-10 inset-x-0 max-w-2xl mx-auto z-50">
        <Menu setActive={setActive}>
          <MenuItem setActive={setActive} active={active} item="Services">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink to="/web-dev">Web Development</HoveredLink>
              <HoveredLink to="/interface-design">Interface Design</HoveredLink>
              <HoveredLink to="/seo">Search Engine Optimization</HoveredLink>
              <HoveredLink to="/branding">Branding</HoveredLink>
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Products">
            <div className="text-sm grid grid-cols-2 gap-10 p-4">
              <ProductItem
                title="Resume Generator"
                href="/resume-generator"
                src="https://images.unsplash.com/photo-1664575198308-3959904fa430?q=80&w=2940&auto=format&fit=crop"
                description="Create professional resumes with AI assistance."
              />
              <ProductItem
                title="Job Tracker"
                href="/job-board"
                src="https://images.unsplash.com/photo-1664575198308-3959904fa430?q=80&w=2940&auto=format&fit=crop"
                description="Track and manage your job applications efficiently."
              />
            </div>
          </MenuItem>
          <MenuItem setActive={setActive} active={active} item="Resources">
            <div className="flex flex-col space-y-4 text-sm">
              <HoveredLink to="/help/documentation">Documentation</HoveredLink>
              <HoveredLink to="/help/tutorials">Tutorials</HoveredLink>
              <HoveredLink to="/help/faq">FAQ</HoveredLink>
            </div>
          </MenuItem>
        </Menu>
      </div>
      
      {/* Hero Section */}
      <HeroSection
        badge={{
          text: "New Feature",
          action: {
            text: "AI Resume Generator",
            href: "/resume-generator",
          },
        }}
        title="Your Job Search Journey Made Simple"
        description="Track applications, customize resumes, and send cold emails - all in one place. Powered by AI to maximize your success rate."
        actions={[
          {
            text: "Get Started",
            href: "/auth/signup",
            variant: "default",
          },
          {
            text: "GitHub",
            href: "https://github.com/your-repo",
            variant: "outline",
            icon: <Github className="h-5 w-5" />,
          },
        ]}
        image={{
          light: "https://images.unsplash.com/photo-1664575198308-3959904fa430?q=80&w=2940&auto=format&fit=crop",
          dark: "https://images.unsplash.com/photo-1664575198308-3959904fa430?q=80&w=2940&auto=format&fit=crop",
          alt: "Job Search Dashboard Preview",
        }}
      />

      {/* Brands Carousel */}
      <Case />

      {/* Feature Section */}
      <Feature />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Final CTA Section */}
      <div className="h-[40rem] w-full rounded-md bg-background relative flex flex-col items-center justify-center antialiased">
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="relative z-10 text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground text-center font-sans font-bold">
            Start Your Job Search Journey
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto my-2 text-sm text-center relative z-10">
            Join thousands of job seekers who have streamlined their job search process with our platform. 
            Get access to AI-powered resume optimization, automated job tracking, and smart email campaigns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 relative z-10 justify-center">
            <Button asChild size="lg" className="font-semibold">
              <Link to="/auth/signup">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/help/documentation">Learn More</Link>
            </Button>
          </div>
        </div>
        <BackgroundBeams />
      </div>
    </div>
  );
};

export default Index;
