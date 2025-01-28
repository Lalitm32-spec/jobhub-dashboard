import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Briefcase, Mail, FileText, BarChart2, Github } from "lucide-react";
import { HeroSection } from "@/components/blocks/hero-section";
import { Menu, MenuItem, ProductItem, HoveredLink } from "@/components/ui/navbar-menu";
import { Case } from "@/components/ui/cases-with-infinite-scroll";
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

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Land Your Dream Job</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Briefcase}
              title="Job Tracking"
              description="Keep track of all your applications in one place with status updates and follow-ups."
            />
            <FeatureCard
              icon={FileText}
              title="AI Resume Builder"
              description="Customize your resume for each application with AI-powered suggestions."
            />
            <FeatureCard
              icon={Mail}
              title="Cold Email Campaigns"
              description="Create and manage personalized cold email campaigns to reach out to potential employers."
            />
            <FeatureCard
              icon={BarChart2}
              title="Analytics Dashboard"
              description="Get insights into your application success rate and areas for improvement."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Free"
              price="$0"
              features={[
                "10 job applications/month",
                "Basic resume templates",
                "Email tracking",
                "Community support"
              ]}
              buttonText="Get Started"
              buttonVariant="outline"
            />
            <PricingCard
              title="Pro"
              price="$15"
              features={[
                "Unlimited applications",
                "AI-powered resume builder",
                "Cold email campaigns",
                "Priority support"
              ]}
              buttonText="Start Free Trial"
              buttonVariant="default"
              popular
            />
            <PricingCard
              title="Enterprise"
              price="Custom"
              features={[
                "Team collaboration",
                "Custom AI training",
                "API access",
                "Dedicated support"
              ]}
              buttonText="Contact Sales"
              buttonVariant="outline"
            />
          </div>
        </div>
      </section>

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

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="p-6 rounded-lg border border-gray-200 hover:border-primary/50 transition-colors">
    <Icon className="w-12 h-12 text-primary mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const PricingCard = ({
  title,
  price,
  features,
  buttonText,
  buttonVariant = "default",
  popular = false,
}: {
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  popular?: boolean;
}) => (
  <div className={`p-8 rounded-lg border ${popular ? 'border-primary shadow-lg' : 'border-gray-200'}`}>
    <div className="text-center mb-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold">{price}</p>
      {price !== "Custom" && <span className="text-gray-600">/month</span>}
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature) => (
        <li key={feature} className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Button className="w-full" variant={buttonVariant} asChild>
      <Link to="/auth/signup">{buttonText}</Link>
    </Button>
  </div>
);

export default Index;
