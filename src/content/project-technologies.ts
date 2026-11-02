type TechnologyGroup = "languages" | "frameworks" | "data" | "tools";
const groups: Readonly<Record<TechnologyGroup, readonly string[]>> = {
  languages: ["Java", "JavaScript", "TypeScript", "Python", "Go", "Dart", "Kotlin", "C", "C++", "GDScript"],
  frameworks: ["Spring Boot", "React", "Next.js", "NestJS", "Node.js", "Express", "Fastify", "FastAPI", "Flutter", "Expo", "Streamlit", "PySide6", "Tailwind CSS"],
  data: ["PostgreSQL", "MySQL", "SQLite", "Redis", "Supabase", "Prisma", "MinIO", "Kafka"],
  tools: ["Docker", "Kubernetes", "Terraform", "GitOps", "EKS", "YOLO", "Arduino", "Godot", "Three.js", "DeepSeek"],
};
const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#]/g, "");
const aliases = new Map(Object.values(groups).flat().map((name) => [key(name), name]));
for (const [alias, canonical] of [["golang", "Go"], ["cpp", "C++"], ["spring", "Spring Boot"], ["postgres", "PostgreSQL"], ["k8s", "Kubernetes"], ["godot4", "Godot"], ["apachekafka", "Kafka"], ["reactjs", "React"], ["nodejs", "Node.js"]]) aliases.set(alias, canonical);

export function canonicalTechnology(value: string): string | undefined {
  return aliases.get(key(value));
}

export function projectTechnologies(values: readonly string[]): string[] {
  return [...new Set(values.map(canonicalTechnology).filter((value): value is string => Boolean(value)))];
}

export function groupedTechnologies(values: readonly string[]) {
  const available = new Set(projectTechnologies(values));
  return (Object.entries(groups) as [TechnologyGroup, readonly string[]][]).map(([group, names]) => ({ group, names: names.filter((name) => available.has(name)).sort((a, b) => a.localeCompare(b)) })).filter(({ names }) => names.length);
}
