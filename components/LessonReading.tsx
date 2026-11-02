"use client";
import { useEffect, useRef } from "react";
/** Only trusted, build-validated HTML. No user input is compiled or injected. */
export default function LessonReading({
  html,
  onConcept,
}: {
  html: string;
  onConcept: (id: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observers: ResizeObserver[] = [];
    root.current
      ?.querySelectorAll<HTMLElement>(".katex-display")
      .forEach((math) => {
        if (math.parentElement?.classList.contains("equation-scroll")) return;
        const wrap = document.createElement("div");
        wrap.className = "equation-scroll";
        math.replaceWith(wrap);
        wrap.append(math);
        const check = () => {
          const wide = math.scrollWidth > wrap.clientWidth + 1;
          wrap.classList.toggle("is-wide", wide);
          if (wide) {
            wrap.tabIndex = 0;
            wrap.setAttribute("role", "region");
            wrap.setAttribute("aria-label", "Scrollable equation");
          } else {
            wrap.removeAttribute("tabindex");
            wrap.removeAttribute("role");
            wrap.removeAttribute("aria-label");
          }
        };
        void document.fonts.ready.then(check);
        const observer = new ResizeObserver(check);
        observer.observe(wrap);
        observers.push(observer);
        check();
      });
    return () => observers.forEach((o) => o.disconnect());
  }, [html]);
  let section = 0;
  return (
    <div ref={root} className="lesson-reading" id="lesson-reading">
      {html
        .split(/(?=<h2[ >])/)
        .filter((s) => s.trim())
        .map((body, i) => {
          const heading = body.match(/<h2[^>]*>(.*?)<\/h2>/);
          if (heading) section++;
          const numbered = heading
            ? body.replace(
                heading[0],
                `<h2><span class="section-number" aria-hidden="true">§${section}</span>${heading[1]}</h2>`,
              )
            : body;
          return (
            <article
              className={`lesson-prose ${heading?.[1] === "Worked example" ? "worked-example" : ""}`}
              key={i}
              onClick={(e) => {
                const href = (e.target as HTMLElement)
                  .closest("a")
                  ?.getAttribute("href");
                if (href?.startsWith("concept:")) {
                  e.preventDefault();
                  onConcept(href.slice(8));
                }
              }}
              dangerouslySetInnerHTML={{ __html: numbered }}
            />
          );
        })}
    </div>
  );
}
