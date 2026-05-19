import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  Database,
  FileCode2,
  Globe2,
  GraduationCap,
  Layers3,
  Monitor,
  Search,
  Server,
  Sparkles,
  TerminalSquare
} from "lucide-react";
import { renderMarkdown } from "./lib/markdown";
import type { CourseMap, CourseSection, Lesson, LessonContent } from "./types";

type AccentStyle = React.CSSProperties & {
  "--accent": string;
};

const chapterIcons = {
  nextjs: Globe2,
  nestjs: Server,
  prisma: Layers3,
  postgresql: Database,
  linux: TerminalSquare,
  typescript: FileCode2
};

function flattenLessons(courseMap: CourseMap | null) {
  return courseMap?.sections.flatMap((section) => section.lessons) ?? [];
}

function lessonMinutes(words: number) {
  return Math.max(2, Math.ceil(words / 160));
}

function pathLabel(path: string) {
  return path.replaceAll("\\", " / ");
}

type ChromeBarProps = {
  activeLesson?: Lesson;
  search: string;
  isSidebarOpen: boolean;
  onSearchChange: (value: string) => void;
  onToggleSidebar: () => void;
};

function ChromeBar({ activeLesson, search, isSidebarOpen, onSearchChange, onToggleSidebar }: ChromeBarProps) {
  return (
    <header className="chrome">
      <div className="window-controls" aria-hidden="true">
        <span className="control close" />
        <span className="control minimize" />
        <span className="control maximize" />
      </div>
      <button className="icon-button" onClick={onToggleSidebar} title={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}>
        {isSidebarOpen ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
      </button>
      <div className="address-bar">
        <Compass size={17} />
        <span>{activeLesson ? pathLabel(activeLesson.path) : "coursweb://parcours"}</span>
      </div>
      <label className="global-search">
        <Search size={17} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher un cours"
        />
      </label>
    </header>
  );
}

type SidebarProps = {
  sections: CourseSection[];
  activeLesson?: Lesson;
  search: string;
  completedLessons: Set<string>;
  onOpenLesson: (lesson: Lesson) => void;
};

function Sidebar({ sections, activeLesson, search, completedLessons, onOpenLesson }: SidebarProps) {
  const query = search.trim().toLowerCase();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <GraduationCap size={26} />
        </div>
        <div>
          <p className="eyebrow">CoursWeb</p>
          <h1>Studio</h1>
        </div>
      </div>

      <div className="sidebar-scroll">
        {sections.map((section) => {
          const Icon = chapterIcons[section.id as keyof typeof chapterIcons] ?? BookOpen;
          const visibleLessons = query
            ? section.lessons.filter((lesson) => lesson.title.toLowerCase().includes(query))
            : section.lessons;

          if (visibleLessons.length === 0) {
            return null;
          }

          return (
            <section className="chapter-group" key={section.id} style={{ "--accent": section.accent } as AccentStyle}>
              <div className="chapter-heading">
                <span className="chapter-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <h2>{String(section.order).padStart(2, "0")} — {section.label}</h2>
                  <p>{section.description}</p>
                </div>
              </div>
              <div className="lesson-list">
                {visibleLessons.map((lesson) => (
                  <button
                    className={`lesson-row ${activeLesson?.path === lesson.path ? "active" : ""}`}
                    key={lesson.path}
                    onClick={() => onOpenLesson(lesson)}
                  >
                    <span className="lesson-order">{String(lesson.order).padStart(2, "0")}</span>
                    <span className="lesson-name">{lesson.title}</span>
                    {completedLessons.has(lesson.path) ? (
                      <CheckCircle2 className="lesson-done" size={16} />
                    ) : (
                      <ChevronRight className="lesson-arrow" size={16} />
                    )}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}

type DashboardProps = {
  courseMap: CourseMap;
  completedLessons: Set<string>;
  onOpenLesson: (lesson: Lesson) => void;
};

function Dashboard({ courseMap, completedLessons, onOpenLesson }: DashboardProps) {
  const lessons = flattenLessons(courseMap);
  const totalWords = lessons.reduce((sum, lesson) => sum + lesson.words, 0);
  const completedCount = lessons.filter((lesson) => completedLessons.has(lesson.path)).length;
  const progress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <main className="reader dashboard">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Parcours complet</p>
          <h2>{courseMap.title}</h2>
          <p>{courseMap.subtitle}</p>
        </div>
        <div className="hero-badge">
          <Sparkles size={20} />
          <span>{progress}% terminé</span>
        </div>
      </section>

      <section className="stats-grid">
        <div>
          <strong>{lessons.length}</strong>
          <span>chapitres</span>
        </div>
        <div>
          <strong>{courseMap.sections.length}</strong>
          <span>modules</span>
        </div>
        <div>
          <strong>{Math.ceil(totalWords / 160)}</strong>
          <span>minutes de lecture</span>
        </div>
      </section>

      <section className="module-grid">
        {courseMap.sections.map((section) => {
          const Icon = chapterIcons[section.id as keyof typeof chapterIcons] ?? BookOpen;
          const firstLesson = section.lessons[0];

          return (
            <button
              className="module-card"
              key={section.id}
              style={{ "--accent": section.accent } as AccentStyle}
              onClick={() => firstLesson && onOpenLesson(firstLesson)}
            >
              <span className="module-icon">
                <Icon size={22} />
              </span>
              <strong>{String(section.order).padStart(2, "0")} — {section.label}</strong>
              <span>{section.description}</span>
              <small>{section.lessons.length} cours</small>
            </button>
          );
        })}
      </section>
    </main>
  );
}

type ReaderProps = {
  lesson: Lesson;
  lessonContent: LessonContent;
  currentIndex: number;
  totalLessons: number;
  previousLesson?: Lesson;
  nextLesson?: Lesson;
  onOpenLesson: (lesson: Lesson) => void;
  onComplete: (lesson: Lesson) => void;
};

function Reader({
  lesson,
  lessonContent,
  currentIndex,
  totalLessons,
  previousLesson,
  nextLesson,
  onOpenLesson,
  onComplete
}: ReaderProps) {
  const readerRef = useRef<HTMLElement>(null);
  const html = useMemo(() => renderMarkdown(lessonContent.content), [lessonContent.content]);

  useEffect(() => {
    readerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [lesson.path]);

  function handleMarkdownClick(event: React.MouseEvent<HTMLElement>) {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href") ?? "";
    if (/^https?:\/\//i.test(href)) {
      event.preventDefault();
      window.coursWeb.openExternal(href);
    }
  }

  return (
    <main className="reader" ref={readerRef}>
      <div className="lesson-toolbar">
        <div>
          <p className="eyebrow">Lecture</p>
          <h2>{lesson.title}</h2>
        </div>
        <div className="toolbar-actions">
          <span>{currentIndex + 1} / {totalLessons}</span>
          <span>{lessonMinutes(lesson.words)} min</span>
          <button onClick={() => onComplete(lesson)}>
            <CheckCircle2 size={17} />
            Terminé
          </button>
        </div>
      </div>

      <article className="markdown-body" onClick={handleMarkdownClick} dangerouslySetInnerHTML={{ __html: html }} />

      <footer className="reader-nav">
        <button
          className="nav-card previous"
          disabled={!previousLesson}
          onClick={() => previousLesson && onOpenLesson(previousLesson)}
        >
          <span className="nav-icon">
            <ArrowLeft size={19} />
          </span>
          <span>
            <small>Précédent</small>
            <strong>{previousLesson?.title ?? "Début du parcours"}</strong>
          </span>
        </button>
        <button
          className="nav-card next"
          disabled={!nextLesson}
          onClick={() => nextLesson && onOpenLesson(nextLesson)}
        >
          <span>
            <small>Suivant</small>
            <strong>{nextLesson?.title ?? "Fin du parcours"}</strong>
          </span>
          <span className="nav-icon">
            <ArrowRight size={19} />
          </span>
        </button>
      </footer>
    </main>
  );
}

export function App() {
  const [courseMap, setCourseMap] = useState<CourseMap | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | undefined>();
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    const raw = localStorage.getItem("coursweb.completed");
    return new Set(raw ? JSON.parse(raw) : []);
  });
  const [error, setError] = useState("");

  const lessons = useMemo(() => flattenLessons(courseMap), [courseMap]);
  const activeIndex = activeLesson ? lessons.findIndex((lesson) => lesson.path === activeLesson.path) : -1;
  const previousLesson = activeIndex > 0 ? lessons[activeIndex - 1] : undefined;
  const nextLesson = activeIndex >= 0 && activeIndex < lessons.length - 1 ? lessons[activeIndex + 1] : undefined;

  useEffect(() => {
    window.coursWeb
      .getCourseMap()
      .then((map) => setCourseMap(map))
      .catch((loadError) => setError(loadError.message));
  }, []);

  async function openLesson(lesson: Lesson) {
    setError("");
    const content = await window.coursWeb.readLesson(lesson.path);
    setActiveLesson(lesson);
    setLessonContent(content);
  }

  function completeLesson(lesson: Lesson) {
    setCompletedLessons((current) => {
      const next = new Set(current);
      next.add(lesson.path);
      localStorage.setItem("coursweb.completed", JSON.stringify([...next]));
      return next;
    });
  }

  if (!courseMap) {
    return (
      <div className="loading-screen">
        <Monitor size={34} />
        <h1>CoursWeb Studio</h1>
        <p>{error || "Chargement des cours..."}</p>
      </div>
    );
  }

  return (
    <div className={`app-shell ${isSidebarOpen ? "" : "sidebar-closed"}`}>
      <ChromeBar
        activeLesson={activeLesson}
        search={search}
        isSidebarOpen={isSidebarOpen}
        onSearchChange={setSearch}
        onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
      />
      <div className="workspace">
        {isSidebarOpen && (
          <Sidebar
            sections={courseMap.sections}
            activeLesson={activeLesson}
            search={search}
            completedLessons={completedLessons}
            onOpenLesson={openLesson}
          />
        )}
        {activeLesson && lessonContent ? (
          <Reader
            lesson={activeLesson}
            lessonContent={lessonContent}
            currentIndex={activeIndex}
            totalLessons={lessons.length}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            onOpenLesson={openLesson}
            onComplete={completeLesson}
          />
        ) : (
          <Dashboard courseMap={courseMap} completedLessons={completedLessons} onOpenLesson={openLesson} />
        )}
      </div>
    </div>
  );
}
