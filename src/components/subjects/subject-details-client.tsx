
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Filter,
  Flag,
  Loader2,
  Plus,
  Search,
  Target,
  Trash2,
  X,
  CircleDashed,
  PlayCircle,
} from "lucide-react";

type TopicStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type Priority = "LOW" | "MEDIUM" | "HIGH";

type Subject = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  targetHoursPerWeek: number | null;
  createdAt: string;
};

type Topic = {
  id: string;
  subjectId: string;
  title: string;
  description: string | null;
  status: TopicStatus;
  priority: Priority;
  estimatedMinutes: number | null;
  order: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Statistics = {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  completionPercentage: number;
};

type SubjectDetailsClientProps = {
  subject: Subject;
  initialTopics: Topic[];
  statistics: Statistics;
};

type TopicFormData = {
  title: string;
  description: string;
  priority: Priority;
  estimatedMinutes: string;
};

const statusConfig: Record<
  TopicStatus,
  { label: string; color: string; icon: typeof CircleDashed }
> = {
  NOT_STARTED: {
    label: "Not started",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    icon: CircleDashed,
  },
  IN_PROGRESS: {
    label: "In progress",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: PlayCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: CheckCircle2,
  },
};

const priorityConfig: Record<
  Priority,
  { label: string; color: string }
> = {
  LOW: {
    label: "Low",
    color: "bg-slate-100 text-slate-600",
  },
  MEDIUM: {
    label: "Medium",
    color: "bg-amber-50 text-amber-700",
  },
  HIGH: {
    label: "High",
    color: "bg-rose-50 text-rose-600",
  },
};

const emptyForm: TopicFormData = {
  title: "",
  description: "",
  priority: "MEDIUM",
  estimatedMinutes: "",
};

export default function SubjectDetailsClient({
  subject,
  initialTopics,
}: SubjectDetailsClientProps) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState<TopicFormData>(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingTopicId, setUpdatingTopicId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const statistics = useMemo<Statistics>(() => {
    const completedTopics = topics.filter(
      (topic) => topic.status === "COMPLETED",
    ).length;

    const inProgressTopics = topics.filter(
      (topic) => topic.status === "IN_PROGRESS",
    ).length;

    const notStartedTopics = topics.filter(
      (topic) => topic.status === "NOT_STARTED",
    ).length;

    return {
      totalTopics: topics.length,
      completedTopics,
      inProgressTopics,
      notStartedTopics,
      completionPercentage:
        topics.length > 0
          ? Math.round((completedTopics / topics.length) * 100)
          : 0,
    };
  }, [topics]);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesSearch =
        topic.title.toLowerCase().includes(search.toLowerCase()) ||
        (topic.description ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || topic.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || topic.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [topics, search, statusFilter, priorityFilter]);

  function openCreateModal() {
    setEditingTopic(null);
    setFormData(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(topic: Topic) {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description ?? "",
      priority: topic.priority,
      estimatedMinutes: topic.estimatedMinutes?.toString() ?? "",
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingTopic(null);
    setFormData(emptyForm);
    setError("");
  }

  async function handleSaveTopic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const title = formData.title.trim();

    if (!title) {
      setError("Please enter a topic title.");
      return;
    }

    const estimatedMinutes = formData.estimatedMinutes.trim()
      ? Number(formData.estimatedMinutes)
      : null;

    if (
      estimatedMinutes !== null &&
      (!Number.isInteger(estimatedMinutes) ||
        estimatedMinutes < 1 ||
        estimatedMinutes > 1440)
    ) {
      setError("Estimated time must be between 1 and 1440 minutes.");
      return;
    }

    const body = {
      title,
      description: formData.description.trim() || null,
      priority: formData.priority,
      estimatedMinutes,
    };

    setSaving(true);

    try {
      const url = editingTopic
        ? `/api/subjects/${subject.id}/topics/${editingTopic.id}`
        : `/api/subjects/${subject.id}/topics`;

      const response = await fetch(url, {
        method: editingTopic ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save topic.");
      }

      if (editingTopic) {
        setTopics((current) =>
          current.map((topic) =>
            topic.id === editingTopic.id ? data.topic : topic,
          ),
        );
      } else {
        setTopics((current) => [...current, data.topic]);
      }

      setModalOpen(false);
      setEditingTopic(null);
      setFormData(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    topic: Topic,
    status: TopicStatus,
  ) {
    if (topic.status === status) return;

    setUpdatingTopicId(topic.id);

    try {
      const response = await fetch(
        `/api/subjects/${subject.id}/topics/${topic.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update topic.");
      }

      setTopics((current) =>
        current.map((item) =>
          item.id === topic.id ? data.topic : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update topic.",
      );
    } finally {
      setUpdatingTopicId(null);
    }
  }

  async function handleDeleteTopic() {
    if (!deleteTarget) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/subjects/${subject.id}/topics/${deleteTarget.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete topic.");
      }

      setTopics((current) =>
        current.filter((topic) => topic.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete topic.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function formatDuration(minutes: number | null) {
    if (!minutes) return "Not estimated";

    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/subjects"
          className="flex items-center gap-2 text-slate-500 transition hover:text-violet-600"
        >
          <ArrowLeft size={16} />
          My Subjects
        </Link>

        <span className="text-slate-300">/</span>

        <span className="font-medium text-slate-800">
          {subject.name}
        </span>
      </div>

      {/* Subject Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/75 p-6 shadow-[0_8px_40px_rgba(139,92,246,0.07)] backdrop-blur-xl sm:p-8">
        <div
          className="absolute -right-16 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: subject.color }}
        />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm"
              style={{
                backgroundColor: `${subject.color}20`,
                color: subject.color,
              }}
            >
              <BookOpen size={27} />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
                Subject workspace
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {subject.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {subject.description || "Organize your chapters, track your learning, and stay on top of your study goals."}
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
          >
            <Plus size={18} />
            Add topic
          </button>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={<BookOpen size={19} />}
          label="Total topics"
          value={statistics.totalTopics}
          color="violet"
        />

        <StatCard
          icon={<CheckCircle2 size={19} />}
          label="Completed"
          value={statistics.completedTopics}
          color="emerald"
        />

        <StatCard
          icon={<PlayCircle size={19} />}
          label="In progress"
          value={statistics.inProgressTopics}
          color="blue"
        />

        <StatCard
          icon={<Target size={19} />}
          label="Weekly target"
          value={
            subject.targetHoursPerWeek
              ? `${subject.targetHoursPerWeek}h`
              : "Not set"
          }
          color="amber"
        />
      </section>

      {/* Progress */}
      <section className="rounded-2xl border border-violet-100/80 bg-gradient-to-r from-violet-50/90 via-white to-purple-50/80 p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              Your learning progress
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Keep going. Every completed topic counts!
            </p>
          </div>

          <span className="text-2xl font-bold text-violet-600">
            {statistics.completionPercentage}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-violet-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-500"
            style={{
              width: `${statistics.completionPercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
          <span>
            {statistics.completedTopics} of {statistics.totalTopics} topics completed
          </span>
          <span>
            {statistics.totalTopics - statistics.completedTopics} remaining
          </span>
        </div>
      </section>

      {/* Topics Section */}
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Topics & chapters
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your learning journey topic by topic.
            </p>
          </div>

          <span className="w-fit rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600">
            {filteredTopics.length} {filteredTopics.length === 1 ? "topic" : "topics"}
          </span>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search topics..."
              className="w-full rounded-xl border border-slate-100 bg-slate-50/70 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50/70 py-3 pl-9 pr-8 text-sm text-slate-600 outline-none focus:border-violet-300 sm:w-40"
              >
                <option value="ALL">All statuses</option>
                <option value="NOT_STARTED">Not started</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3 text-sm text-slate-600 outline-none focus:border-violet-300 sm:w-36"
            >
              <option value="ALL">All priorities</option>
              <option value="LOW">Low priority</option>
              <option value="MEDIUM">Medium priority</option>
              <option value="HIGH">High priority</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && !modalOpen && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Topic Cards */}
        {filteredTopics.length > 0 ? (
          <div className="space-y-3">
            {filteredTopics.map((topic, index) => {
              const StatusIcon = statusConfig[topic.status].icon;
              const isUpdating = updatingTopicId === topic.id;

              return (
                <article
                  key={topic.id}
                  className="group rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-[0_3px_16px_rgba(15,23,42,0.025)] transition hover:border-violet-100 hover:shadow-[0_8px_25px_rgba(139,92,246,0.07)] sm:p-5"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-600">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`font-semibold ${
                            topic.status === "COMPLETED"
                              ? "text-slate-400 line-through"
                              : "text-slate-800"
                          }`}
                        >
                          {topic.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${priorityConfig[topic.priority].color}`}
                        >
                          {priorityConfig[topic.priority].label} priority
                        </span>
                      </div>

                      {topic.description && (
                        <p className="mt-1.5 text-sm leading-5 text-slate-500">
                          {topic.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock3 size={14} />
                          {formatDuration(topic.estimatedMinutes)}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusConfig[topic.status].color}`}
                        >
                          <StatusIcon size={13} />
                          {statusConfig[topic.status].label}
                        </span>
                      </div>
                    </div>

                    {/* Topic Actions */}
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => openEditModal(topic)}
                        title="Edit topic"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(topic)}
                        title="Delete topic"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Status Controls */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="text-xs font-medium text-slate-400">
                      Update progress
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {(
                        ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as TopicStatus[]
                      ).map((status) => (
                        <button
                          key={status}
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(topic, status)}
                          className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-50 ${
                            topic.status === status
                              ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                              : "bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                          }`}
                        >
                          {isUpdating && topic.status !== status ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            statusConfig[status].label
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-violet-200 bg-white/70 px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
              <BookOpen size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              {topics.length === 0
                ? "No topics added yet"
                : "No matching topics found"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {topics.length === 0
                ? "Start organizing this subject by adding your first topic or chapter."
                : "Try changing your search or filters to find what you're looking for."}
            </p>

            {topics.length === 0 && (
              <button
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Plus size={17} />
                Add your first topic
              </button>
            )}
          </div>
        )}
      </section>

      {/* Add / Edit Topic Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-lg rounded-3xl border border-white/80 bg-white p-6 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingTopic ? "Edit topic" : "Add a new topic"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingTopic
                    ? "Update the details of this topic."
                    : "Add a chapter or topic to your subject."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Topic title <span className="text-rose-500">*</span>
                </label>

                <input
                  type="text"
                  required
                  maxLength={120}
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="e.g. Process Management"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  maxLength={500}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Add a short description or learning objectives..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Priority
                  </label>

                  <select
                    value={formData.priority}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        priority: event.target.value as Priority,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm text-slate-700 outline-none focus:border-violet-300"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Estimated minutes
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={formData.estimatedMinutes}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        estimatedMinutes: event.target.value,
                      }))
                    }
                    placeholder="e.g. 60"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm text-slate-700 outline-none focus:border-violet-300"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingTopic
                      ? "Save changes"
                      : "Create topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/80 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Delete this topic?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteTopic}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
              >
                {deleting && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "violet" | "emerald" | "blue" | "amber";
}) {
  const colorStyles = {
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colorStyles[color]}`}
      >
        {icon}
      </div>

      <p className="text-xs font-medium text-slate-500 sm:text-sm">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}
