import { FileText, Home, Mail, Settings, Briefcase, HelpCircle, MessageSquare, Flag, Github, Linkedin, BarChart, PlusCircle, Bell, Ghost, BookOpen, Video, HelpCircle as Help, MessageSquare as Contact, MailOpen, Inbox, Archive, Send, FileText as Template } from "lucide-react";
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

const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Resume Generator",
    url: "/resume-generator",
    icon: FileText,
  },
  {
    title: "Cold Emails",
    url: "/emails",
    icon: Mail,
    badge: "3",
    subItems: [
      {
        title: "Dashboard",
        url: "/email/dashboard",
        icon: Inbox,
      },
      {
        title: "Templates",
        url: "/email/templates",
        icon: Template,
      },
      {
        title: "Campaigns",
        url: "/email/campaigns",
        icon: Send,
      },
      {
        title: "Analytics",
        url: "/email/analytics",
        icon: BarChart,
      },
      {
        title: "Archive",
        url: "/email/archive",
        icon: Archive,
      },
    ],
  },
  {
    title: "Job Board",
    url: "/job-board",
    icon: Briefcase,
    subItems: [
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

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-bold">Job Tracker</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    <Collapsible>
                      <CollapsibleTrigger className="w-full">
                        <SidebarMenuButton>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link
                                  to={subItem.url}
                                  className={location.pathname === subItem.url ? "bg-sidebar-accent" : ""}
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
                        className={location.pathname === item.url ? "bg-sidebar-accent" : ""}
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
                          className={location.pathname === item.url ? "bg-sidebar-accent" : ""}
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

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center justify-center gap-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Github className="h-5 w-5" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}