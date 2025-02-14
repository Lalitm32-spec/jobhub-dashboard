import { FileText, Home, Mail, Settings, Briefcase, HelpCircle, MessageSquare, Flag, Github, Linkedin, BarChart, PlusCircle, Bell, Ghost, BookOpen, Video, HelpCircle as Help, MessageSquare as Contact, User, LogOut, MailQuestion as Template, SendHorizontal as Send, Archive, InboxIcon as Inbox, ListChecks, Bug } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
  subItems?: MenuItem[];
}

const mainItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Resume Generator",
    url: "/resume-generator",
    icon: FileText,
  },
  {
    title: "Cold Emails",
    url: "/email",
    icon: Mail,
    subItems: [
      {
        title: "Dashboard",
        url: "/email",
        icon: Inbox,
      },
      {
        title: "Compose",
        url: "/email/compose",
        icon: Send,
      },
      {
        title: "Templates",
        url: "/email/templates",
        icon: Template,
      },
    ],
  },
  {
    title: "Job Board",
    url: "/job-board",
    icon: Briefcase,
    subItems: [
      {
        title: "Job Tracking",
        url: "/job-board",
        icon: ListChecks,
      },
      {
        title: "Analytics",
        url: "/job-board/analytics",
        icon: BarChart,
      },
      {
        title: "New Application",
        url: "/job-board/new",
        icon: PlusCircle,
      },
      {
        title: "Follow-ups",
        url: "/job-board/follow-ups",
        icon: Bell,
      },
      {
        title: "Ghosted",
        url: "/job-board/ghosted",
        icon: Ghost,
      },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const helpItems = [
  {
    title: "Documentation",
    url: "/help/documentation",
    icon: BookOpen,
  },
  {
    title: "Tutorials",
    url: "/help/tutorials",
    icon: Video,
  },
  {
    title: "FAQ",
    url: "/help/faq",
    icon: Help,
  },
  {
    title: "Contact",
    url: "/help/contact",
    icon: Contact,
  },
  {
    title: "Report Bug",
    url: "/help/report-bug",
    icon: Bug,
  },
];

const featureItems = [
  {
    title: "Request Feature",
    url: "#",
    icon: Flag,
  },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-primary/10">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>JT</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold">Job Tracker</h2>
            <p className="text-xs text-muted-foreground">Track your job search</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    <Collapsible>
                      <CollapsibleTrigger className="w-full">
                        <SidebarMenuButton className={isActive(item.url) ? "bg-primary/10 text-primary" : ""}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link
                                  to={subItem.url}
                                  className={isActive(subItem.url) ? "bg-primary/10 text-primary" : ""}
                                >
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={isActive(item.url) ? "bg-primary/10 text-primary" : ""}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Help & Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <SidebarMenuButton>
                  <HelpCircle className="h-4 w-4" />
                  <span>Help Center</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {helpItems.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to={item.url}
                          className={isActive(item.url) ? "bg-primary/10 text-primary" : ""}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {featureItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="space-y-4">
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <User className="h-4 w-4" />
                <span>Account</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2 pl-6">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <div className="flex items-center justify-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}