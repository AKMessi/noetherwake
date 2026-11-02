"use client";
import { ArrowUpRight, GitBranch, Lightbulb } from "lucide-react";
import { type Concept } from "@noetherwake/engine";
import { catalog, concept } from "@/lib/catalog";

export default function LessonConnections({
  lesson,
  onConcept,
}: {
  lesson: Concept;
  onConcept: (id: string) => void;
}) {
  const next = catalog
    .filter((c) => c.prerequisites.includes(lesson.id))
    .slice(0, 4);
  return (
    <section
      className="lesson-connections"
      aria-label="Connections and common misconceptions"
    >
      <span className="eyebrow">
        <GitBranch size={14} /> CONNECT THE IDEAS
      </span>
      {lesson.prerequisites.length > 0 && (
        <div>
          <h3>The foundations you’re using</h3>
          {lesson.prerequisites.map((id) => (
            <button key={id} onClick={() => onConcept(id)}>
              {concept(id).title}
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
      )}
      {next.length > 0 && (
        <div>
          <h3>Where this idea takes you</h3>
          {next.map((c) => (
            <button key={c.id} onClick={() => onConcept(c.id)}>
              {c.title}
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
      )}
      <div className="misconception-note">
        <Lightbulb size={17} />
        <div>
          <h3>A useful distinction</h3>
          <p>
            {lesson.misconceptions[0].description}.{" "}
            {lesson.misconceptions[0].remediation}
          </p>
        </div>
      </div>
    </section>
  );
}
