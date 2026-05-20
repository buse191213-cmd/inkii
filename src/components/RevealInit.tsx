"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Beobachtet alle .reveal-Elemente und blendet sie beim Scrollen ein. */
export default function RevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    let count = 0;
    const register = (el: HTMLElement) => {
      if (el.classList.contains("in")) return;
      el.style.transitionDelay = `${(count % 4) * 80}ms`;
      count++;
      io.observe(el);
    };

    document
      .querySelectorAll<HTMLElement>(".reveal")
      .forEach((el) => register(el));

    // Später eingefügte .reveal-Elemente (z. B. nach Sprachwechsel) erfassen.
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.classList.contains("reveal")) register(node);
          node
            .querySelectorAll<HTMLElement>(".reveal")
            .forEach((el) => register(el));
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
