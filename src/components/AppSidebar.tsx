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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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

        <div className="mt-auto p-2">
          <Sheet>
            <SheetTrigger asChild>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-neon hover:bg-muted/30 rounded-md transition-colors glow-neon">
                <BookOpen className="h-4 w-4" />
                {!collapsed && <span>Research Flux</span>}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[340px] sm:w-[400px] bg-card border-border p-0">
              <SheetHeader className="p-4 border-b border-border/30">
                <SheetTitle className="flex items-center gap-2 text-neon">
                  <BookOpen className="h-5 w-5" />
                  Research Flux
                </SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-80px)]">
                <ResearchFlux />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
