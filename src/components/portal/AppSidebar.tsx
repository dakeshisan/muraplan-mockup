import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navGroups, allNavItems } from "./nav";
import { useRole } from "@/lib/role";
import { Logo } from "./Logo";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { canAccess, persona, allowed, role } = useRole();
  const isAdmin = role === "admin";
  const totalModules = allNavItems.length;

  const visibleGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => canAccess(i.url)) }))
    .filter((g) => g.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 pt-4 pb-2">
        <Link
          to="/"
          aria-label="ATAMŪRA GROUP · ATLAS"
          className="flex items-center gap-2 rounded-lg px-1 py-1"
        >
          {collapsed ? (
            <Logo className="h-6" />
          ) : (
            <div className="min-w-0 leading-tight">
              <Logo className="h-[26px]" />
              <div className="mt-1 truncate text-[11px] font-medium text-muted-foreground">
                Портал ATLAS
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1.5">
        {visibleGroups.map((group, gi) => (
          <SidebarGroup key={group.label ?? `g${gi}`} className="py-1">
            {group.label && !collapsed && (
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="relative data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:font-semibold data-[active=true]:shadow-sm hover:bg-secondary transition-colors"
                      >
                        <Link
                          to={item.url}
                          aria-current={active ? "page" : undefined}
                          className="flex items-center gap-2.5"
                        >
                          {active && !collapsed && (
                            <span
                              aria-hidden
                              className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-accent"
                            />
                          )}
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        {!collapsed && (
          <div className="rounded-xl border border-border bg-brand-soft px-3 py-2.5 text-[11px] leading-snug">
            <div className="flex items-center gap-1.5 text-accent-foreground">
              <LayoutGrid className="h-3 w-3" />
              <span className="font-bold uppercase tracking-[0.1em]">
                {isAdmin
                  ? `Доступно: все ${totalModules} модулей`
                  : `Доступно ${allowed.length} из ${totalModules}`}
              </span>
            </div>
            <div className="mt-1 truncate text-accent-foreground/80">
              Роль: <span className="font-semibold text-accent-foreground">{persona.position}</span>
            </div>
            <div className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              my.atamura.group
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
