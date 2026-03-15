import { cn } from "@/lib/utils";
import type { LegalSection } from "@/content/legal";

interface LegalDocumentProps {
  accent: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
  compact?: boolean;
}

const LegalDocument = ({ accent, intro, lastUpdated, sections, compact = false }: LegalDocumentProps) => {
  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
        <p className="text-sm leading-6 text-muted-foreground">{intro}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.18em]" style={{ color: accent }}>
          Atualizado em {lastUpdated}
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.title} className="app-panel-soft rounded-[1.45rem] p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
            {section.title}
          </h3>
          <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && (
              <ul className="space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-primary/80" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
};

export default LegalDocument;
