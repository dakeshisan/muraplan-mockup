import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeftRight } from "lucide-react";
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
import { portalNavGroups } from "./portal-space-nav";
import { Logo } from "./Logo";

/**
 * «Журнальный» сайдбар мок-Портала сотрудника: больше воздуха,
 * крупные пункты — в противоположность плотному пультовому ATLAS.
 */
export function PortalSpaceSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 pb-2 pt-4">
        <Link
          to="/portal"
          aria-label="ATAMŪRA GROUP · Портал сотрудника"
          className="flex items-center gap-2 rounded-lg px-1 py-1"
        >
          {collapsed ? (
            <Logo className="h-6" />
          ) : (
            <div className="min-w-0 leading-tight">
              <Logo className="h-[26px]" />
              <div className="mt-1 truncate text-[11px] font-medium text-muted-foreground">
                Портал сотрудника
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1.5">
        {portalNavGroups.map((group, gi) => (
          <SidebarGroup key={group.label ?? `g${gi}`} className="py-2">
            {group.label && !collapsed && (
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = item.url ? pathname === item.url : false;
                  if (item.soon || !item.url) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          tooltip={`${item.title} · скоро`}
                          disabled
                          className="cursor-not-allowed opacity-50"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && (
                            <span className="flex min-w-0 items-center justify-between gap-2 truncate">
                              <span className="truncate">{item.title}</span>
                              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                                скоро
                              </span>
                            </span>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="relative py-2.5 data-[active=true]:bg-accent data-[active=true]:font-semibold data-[active=true]:text-accent-foreground data-[active=true]:shadow-sm hover:bg-secondary"
                      >
                        <Link
                          to={item.url}
                          aria-current={active ? "page" : undefined}
                          className="flex items-center gap-2.5"
                        >
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
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl border border-border bg-brand-soft px-3 py-2.5 text-[11px] leading-snug text-accent-foreground transition-colors hover:border-primary/40"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block font-bold uppercase tracking-[0.1em]">Перейти в ATLAS</span>
              <span className="block truncate text-accent-foreground/80">
                Пультовое пространство стройки
              </span>
            </span>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
