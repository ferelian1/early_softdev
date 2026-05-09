import { Flame, Skull, Eye } from "lucide-react"
import type { Project } from "@/types/project"

export const projects: Project[] = [
  {
    id: "silent-gateway",
    name: "THE SILENT GATEWAY",
    description:
      "A high-throughput gRPC gateway routing requests across distributed microservices with zero-downtime deploys.",
    icon: Skull,
    tags: ["Node.js", "gRPC", "Redis", "Kubernetes"],
  },
  {
    id: "infernal-pipeline",
    name: "INFERNAL PIPELINE",
    description:
      "An event-driven data pipeline consuming millions of Kafka messages per hour with exactly-once semantics.",
    icon: Flame,
    tags: ["Kafka", "Go", "PostgreSQL", "Docker"],
  },
  {
    id: "void-observer",
    name: "VOID OBSERVER",
    description:
      "A real-time observability platform aggregating traces, metrics, and logs into a unified dark dashboard.",
    icon: Eye,
    tags: ["OpenTelemetry", "Prometheus", "Grafana", "Rust"],
  },
]
