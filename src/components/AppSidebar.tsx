import { useState } from "react";
import { FileSpreadsheet, Settings, Zap, BookOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ResearchFlux } from "@/components/ResearchFlux";

const items = [
  { title: "Automação", url: "/", icon: Zap },
  { title: "Exportações", url: "/exports", icon: FileSpreadsheet },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [showResearch, setShowResearch] = useState(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            FL
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-foreground">FluxLeads</span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup className="flex-1 flex flex-col min-h-0">
            <button
              onClick={() => setShowResearch(!showResearch)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-neon hover:bg-muted/30 rounded-md transition-colors mx-2"
            >
              <BookOpen className="h-4 w-4" />
              Research Flux
            </button>
            {showResearch && (
              <div className="flex-1 min-h-0 border-t border-border/30 mt-1">
                <ResearchFlux />
              </div>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
