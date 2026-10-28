"use client";
/** Trusted build-time lesson HTML; sections remain semantic at every breakpoint. */
export default function LessonReading({
  html,
  onConcept,
}: {
  html: string;
  onConcept: (id: string) => void;
}) {
  return (
    <div className="lesson-reading">
      {html
        .split(/(?=<h2[ >])/)
        .filter((section) => section.trim())
        .map((section, index) => (
          <article
            className="lesson-prose"
            key={index}
            onClick={(e) => {
              const link = (e.target as HTMLElement).closest("a");
              const href = link?.getAttribute("href");
              if (href?.startsWith("concept:")) {
                e.preventDefault();
                onConcept(href.slice(8));
              }
            }}
            dangerouslySetInnerHTML={{ __html: section }}
          />
        ))}
    </div>
  );
}
