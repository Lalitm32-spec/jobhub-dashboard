import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Briefcase, Mail, FileText, BarChart2, Github } from "lucide-react";
import { HeroSection } from "@/components/blocks/hero-section";
import { Menu, MenuItem, ProductItem, HoveredLink } from "@/components/ui/navbar-menu";
import { Case } from "@/components/ui/cases-with-infinite-scroll";
import { Feature } from "@/components/ui/feature-section-with-bento-grid";
import { PricingSection } from "@/components/ui/pricing-section";
import { cn } from "@/lib/utils";

const Index = () => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navbar */}
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have streamlined their job search process with our platform.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth/signup">
              Start Free Trial <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
