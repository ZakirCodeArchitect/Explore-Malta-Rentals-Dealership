"use client";

import { useEffect } from "react";

/** Removes `fdprocessedid` injected by browser extensions (e.g. form fillers) to avoid hydration noise. */
export function StripFdprocessedId() {
  useEffect(() => {
    const attributeName = "fdprocessedid";

    const stripInjectedAttribute = (target: Node) => {
      if (!(target instanceof Element)) return;
      if (target.hasAttribute(attributeName)) {
        target.removeAttribute(attributeName);
      }
    };

    document.querySelectorAll(`[${attributeName}]`).forEach((element) => {
      element.removeAttribute(attributeName);
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          stripInjectedAttribute(mutation.target);
        }
      }
    });

    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: [attributeName],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
