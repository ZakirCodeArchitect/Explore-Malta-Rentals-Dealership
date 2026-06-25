"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type AdminRowActionItem = {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "default" | "danger" | "warning" | "success";
};

type AdminRowActionsMenuProps = Readonly<{
  items: AdminRowActionItem[];
  ariaLabel: string;
  isBusy?: boolean;
}>;

type MenuPosition = {
  top: number;
  left: number;
  minWidth: number;
};

const MENU_MIN_WIDTH = 160;
const MENU_GAP = 4;
const VIEWPORT_PADDING = 8;
const MENU_ITEM_HEIGHT = 36;
const MENU_PADDING_Y = 8;

function estimateMenuHeight(itemCount: number): number {
  return itemCount * MENU_ITEM_HEIGHT + MENU_PADDING_Y;
}

function itemClassName(tone: AdminRowActionItem["tone"], disabled: boolean): string {
  const base =
    "block w-full px-3 py-2 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  if (disabled) {
    return `${base} text-slate-400`;
  }
  if (tone === "danger") {
    return `${base} text-rose-700 hover:bg-rose-50`;
  }
  if (tone === "warning") {
    return `${base} text-amber-800 hover:bg-amber-50`;
  }
  if (tone === "success") {
    return `${base} text-emerald-700 hover:bg-emerald-50`;
  }
  return `${base} text-slate-700 hover:bg-slate-50`;
}

function computeMenuPosition(button: HTMLButtonElement, menuHeight: number): MenuPosition {
  const rect = button.getBoundingClientRect();
  const left = Math.min(
    Math.max(VIEWPORT_PADDING, rect.right - MENU_MIN_WIDTH),
    window.innerWidth - MENU_MIN_WIDTH - VIEWPORT_PADDING,
  );

  const belowTop = rect.bottom + MENU_GAP;
  const aboveTop = rect.top - menuHeight - MENU_GAP;
  const maxTop = window.innerHeight - menuHeight - VIEWPORT_PADDING;
  const fitsBelow = belowTop + menuHeight <= window.innerHeight - VIEWPORT_PADDING;
  const fitsAbove = aboveTop >= VIEWPORT_PADDING;

  let top: number;
  if (fitsBelow) {
    top = belowTop;
  } else if (fitsAbove) {
    top = aboveTop;
  } else {
    const spaceBelow = window.innerHeight - belowTop - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    top = spaceBelow >= spaceAbove ? belowTop : aboveTop;
    top = Math.max(VIEWPORT_PADDING, Math.min(top, maxTop));
  }

  return {
    top,
    left,
    minWidth: MENU_MIN_WIDTH,
  };
}

export function AdminRowActionsMenu({ items, ariaLabel, isBusy = false }: AdminRowActionsMenuProps) {
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setMenuPosition(null);
      return;
    }

    function updatePosition() {
      if (!buttonRef.current) {
        return;
      }
      const measuredHeight = menuRef.current?.getBoundingClientRect().height;
      const menuHeight = measuredHeight ?? estimateMenuHeight(items.length);
      setMenuPosition(computeMenuPosition(buttonRef.current, menuHeight));
    }

    updatePosition();
    const rafId = window.requestAnimationFrame(updatePosition);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && menuRef.current
        ? new ResizeObserver(updatePosition)
        : null;
    if (menuRef.current && resizeObserver) {
      resizeObserver.observe(menuRef.current);
    }

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, items.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const menuPanel = open ? (
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        className="fixed z-[200] max-h-[min(70vh,calc(100dvh-1rem))] min-w-[10rem] overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        style={{
          top: menuPosition?.top ?? -9999,
          left: menuPosition?.left ?? VIEWPORT_PADDING,
          minWidth: menuPosition?.minWidth ?? MENU_MIN_WIDTH,
          visibility: menuPosition ? "visible" : "hidden",
        }}
      >
        {items.map((item) =>
          item.href && !item.disabled ? (
            <a
              key={item.key}
              href={item.href}
              role="menuitem"
              className={itemClassName(item.tone, false)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ) : (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={itemClassName(item.tone, Boolean(item.disabled))}
              onClick={() => {
                if (item.disabled) {
                  return;
                }
                setOpen(false);
                item.onClick?.();
              }}
            >
              {item.label}
            </button>
          ),
        )}
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={isBusy}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-700 transition hover:border-[#3a7ca5]/30 hover:text-[#3a7ca5] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MoreVertical className="size-4" aria-hidden />
      </button>

      {typeof document !== "undefined" && menuPanel ? createPortal(menuPanel, document.body) : null}
    </>
  );
}
