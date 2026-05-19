const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const chapters = [
  {
    id: "typescript",
    order: 1,
    label: "TypeScript",
    accent: "#0891b2",
    description: "Les bases solides avant React, Next.js et NestJS."
  },
  {
    id: "nextjs",
    order: 2,
    label: "Next.js",
    accent: "#2563eb",
    description: "Frontend moderne, routes, composants, données."
  },
  {
    id: "nestjs",
    order: 3,
    label: "NestJS",
    accent: "#e11d48",
    description: "Backend structuré, controllers, services, DTOs."
  },
  {
    id: "prisma",
    order: 4,
    label: "Prisma",
    accent: "#0f766e",
    description: "ORM, migrations, relations, connexion au backend."
  },
  {
    id: "postgresql",
    order: 5,
    label: "PostgreSQL",
    accent: "#7c3aed",
    description: "SQL, tables, requêtes, jointures, performance."
  },
  {
    id: "linux",
    order: 6,
    label: "Linux",
    accent: "#ca8a04",
    description: "Terminal, serveur et déploiement en production."
  }
];

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1060,
    minHeight: 680,
    title: "CoursWeb Studio",
    autoHideMenuBar: true,
    backgroundColor: "#eef2f6",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

function contentRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "course-content");
  }

  return path.resolve(__dirname, "..", "..");
}

function ensureInsideContent(targetPath) {
  const root = contentRoot();
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(targetPath);
  const relative = path.relative(resolvedRoot, resolvedTarget);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Chemin en dehors des cours.");
  }

  return resolvedTarget;
}

function titleFromMarkdown(fileName, content) {
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading?.[1]) {
    return heading[1].replace(/[`*_]/g, "").trim();
  }

  return fileName
    .replace(/^\d+_/, "")
    .replace(/\.md$/i, "")
    .replaceAll("-", " ")
    .replaceAll("_", " ");
}

async function readLessonsForChapter(chapter) {
  const chapterDir = ensureInsideContent(path.join(contentRoot(), chapter.id));
  const entries = await fs.readdir(chapterDir, { withFileTypes: true });
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));

  return Promise.all(
    markdownFiles.map(async (entry, index) => {
      const lessonPath = path.join(chapterDir, entry.name);
      const content = await fs.readFile(lessonPath, "utf8");
      const relativePath = path.relative(contentRoot(), lessonPath);

      return {
        id: `${chapter.id}-${index + 1}`,
        chapterId: chapter.id,
        order: index + 1,
        title: titleFromMarkdown(entry.name, content),
        fileName: entry.name,
        path: relativePath,
        words: content.split(/\s+/).filter(Boolean).length
      };
    })
  );
}

ipcMain.handle("course:getMap", async () => {
  const sections = await Promise.all(
    chapters.map(async (chapter) => ({
      ...chapter,
      lessons: await readLessonsForChapter(chapter)
    }))
  );

  return {
    title: "Cours Web",
    subtitle: "De zéro à un projet en production",
    sections
  };
});

ipcMain.handle("course:readLesson", async (_event, lessonPath) => {
  const safePath = ensureInsideContent(path.join(contentRoot(), lessonPath));
  const content = await fs.readFile(safePath, "utf8");

  return {
    path: path.relative(contentRoot(), safePath),
    content,
    title: titleFromMarkdown(path.basename(safePath), content)
  };
});

ipcMain.handle("shell:openExternal", async (_event, url) => {
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    return false;
  }

  await shell.openExternal(url);
  return true;
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
