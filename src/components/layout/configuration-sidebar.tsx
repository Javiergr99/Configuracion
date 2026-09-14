import type { MouseEvent } from "react";
import { useMemo, useState } from "react";
import { ChevronDown, Dot } from "lucide-react";
import { NavLink, useLocation } from "react-router";

import {
  canAccessNavigationItem,
  getVisibleNavigationChildren,
  sidebarNavigation,
  type NavigationItem,
} from "@/shared/config/navigation";
import { cn } from "@/shared/lib/cn";

type ConfigurationSidebarProps = {
  permissions?: readonly string[];
  onNavigate?: () => void;
};

const EMPTY_PERMISSIONS: readonly string[] = [];
const PRIMARY_ITEM_CLASS =
  "focus-ring flex min-h-10 w-full items-center justify-center overflow-hidden rounded-md px-2 text-[13px] leading-5 font-semibold text-[var(--ui-sidebar-text)] transition-colors hover:bg-black/10 hover:text-[var(--ui-sidebar-text)] md:justify-start md:gap-2.5 md:px-3";
const PRIMARY_ICON_CLASS = "h-[17px] w-[17px] shrink-0";
const PRIMARY_LABEL_CLASS = "font-sans text-[13px] font-semibold leading-5 tracking-normal";

function isPrimaryNavigation(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isGroupRouteActive(item: NavigationItem, pathname: string): boolean {
  return (item.children ?? []).some((child) =>
    child.to === "/app/usuarios"
      ? pathname === child.to || /^\/app\/usuarios\/[^/]+\/editar$/.test(pathname)
      : pathname === child.to || pathname.startsWith(`${child.to}/`),
  );
}

export function ConfigurationSidebar({
  permissions = EMPTY_PERMISSIONS,
  onNavigate,
}: ConfigurationSidebarProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());

  const visibleItems = useMemo(
    () => sidebarNavigation.filter((item) => canAccessNavigationItem(item, permissions)),
    [permissions],
  );

  function handleStandaloneNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPrimaryNavigation(event)) return;

    setOpenGroups((current) => (current.size ? new Set<string>() : current));
    onNavigate?.();
  }

  function handleGroupChildNavigation(event: MouseEvent<HTMLAnchorElement>, label: string) {
    if (!isPrimaryNavigation(event)) return;

    setOpenGroups((current) => {
      if (!current.has(label)) return current;

      const next = new Set(current);
      next.delete(label);
      return next;
    });
    onNavigate?.();
  }

  function toggleGroup(label: string) {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <aside
      className="fixed bottom-0 left-0 top-[var(--header-height)] z-30 w-[var(--sidebar-current-width)] overflow-x-hidden overflow-y-auto border-r border-black/10 bg-[var(--ui-sidebar)] px-2 py-3"
      aria-label="Navegación lateral de configuración"
    >
      <nav className="space-y-1" aria-label="Módulos de configuración">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          if (item.children?.length) {
            const children = getVisibleNavigationChildren(item, permissions);
            if (!children.length) return null;

            const active = isGroupRouteActive(item, location.pathname);
            const open = openGroups.has(item.label);

            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    PRIMARY_ITEM_CLASS,
                    active &&
                      "bg-[var(--ui-primary-soft)] text-[var(--ui-primary)] hover:bg-[var(--ui-primary-soft)] hover:text-[var(--ui-primary)]",
                  )}
                  aria-expanded={open}
                  title={item.label}
                >
                  <Icon className={PRIMARY_ICON_CLASS} strokeWidth={1.8} aria-hidden="true" />
                  <span
                    className={cn(
                      PRIMARY_LABEL_CLASS,
                      "hidden min-w-0 flex-1 truncate whitespace-nowrap text-left md:block",
                    )}
                  >
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "ml-auto hidden h-4 w-4 shrink-0 transition-transform md:block",
                      open && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                {open ? (
                  <div className="mt-1 space-y-1 md:ml-6 md:border-l md:border-white/25 md:pl-2">
                    {children.map((child) => {
                      const ChildIcon = child.icon ?? Dot;

                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end={child.to === "/app/usuarios"}
                          onClick={(event) => handleGroupChildNavigation(event, item.label)}
                          title={child.label}
                          className={({ isActive }) =>
                            cn(
                              "focus-ring flex min-h-9 items-center justify-center rounded-md px-2 text-[12px] font-medium text-[var(--ui-sidebar-text)] transition-colors hover:bg-black/10 hover:text-[var(--ui-sidebar-text)]",
                              "md:justify-start md:gap-1.5",
                              isActive &&
                                "bg-[var(--ui-primary-soft)] font-semibold text-[var(--ui-primary)]",
                            )
                          }
                        >
                          <ChildIcon
                            className="h-4 w-4 shrink-0"
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                          <span className="hidden min-w-0 truncate md:block">{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          }

          if (!item.to) return null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              title={item.label}
              onClick={handleStandaloneNavigation}
              className={({ isActive }) =>
                cn(
                  PRIMARY_ITEM_CLASS,
                  isActive &&
                    "bg-[var(--ui-primary-soft)] text-[var(--ui-primary)] hover:bg-[var(--ui-primary-soft)] hover:text-[var(--ui-primary)]",
                )
              }
            >
              <Icon className={PRIMARY_ICON_CLASS} strokeWidth={1.8} aria-hidden="true" />
              <span
                className={cn(
                  PRIMARY_LABEL_CLASS,
                  "hidden min-w-0 flex-1 truncate whitespace-nowrap text-left md:block",
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
