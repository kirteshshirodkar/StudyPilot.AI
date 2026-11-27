"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Clock3,
  Plus,
  Search,
  Sparkles,
  BookMarked,
  X,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";

type Subject = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  targetHoursPerWeek: number | null;
  topicCount: number;
  createdAt: string;
};

type SubjectsClientProps = {
  initialSubjects: Subject[];
  totalTargetHours: number;
};

const SUBJECT_COLORS = [
  "#A78BFA",
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#F472B6",
  "#FB923C",
  "#2DD4BF",
  "#818CF8",
];

export default function SubjectsClient({
  initialSubjects,
}: SubjectsClientProps) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [targetHours, setTargetHours] = useState("5");

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalSubjects = subjects.length;

  const totalTargetHours = subjects.reduce(
    (total, subject) => total + (subject.targetHoursPerWeek ?? 0),
    0,
  );

  const totalTopics = subjects.reduce(
    (total, subject) => total + subject.topicCount,
    0,
  );

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return subjects;

    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(query) ||
        subject.description?.toLowerCase().includes(query),
    );
  }, [subjects, search]);

  function resetForm() {
    setName("");
    setDescription("");
    setColor(SUBJECT_COLORS[0]);
    setTargetHours("5");
    setError("");
  }

  function closeModal() {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingSubject(null);
    resetForm();
  }

  function openEditModal(subject: Subject) {
    setEditingSubject(subject);

    setName(subject.name);
    setDescription(subject.description ?? "");
    setColor(subject.color);
    setTargetHours(String(subject.targetHoursPerWeek ?? 5));

    setError("");
    setIsModalOpen(true);
  }

  async function handleDeleteSubject() {
    if (!deletingSubject) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/subjects/${deletingSubject.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || data.message || "Failed to delete subject.",
        );
      }

      setSubjects((current) =>
        current.filter((subject) => subject.id !== deletingSubject.id),
      );

      setDeletingSubject(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete subject.",
      );
      setDeletingSubject(null);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSaveSubject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a subject name.");
      return;
    }

    const hours = Number(targetHours);

    if (!Number.isFinite(hours) || hours < 0 || hours > 168) {
      setError("Enter a valid weekly target between 0 and 168 hours.");
      return;
    }

    setIsSaving(true);

    const isEditing = Boolean(editingSubject);

    try {
      const response = await fetch(
        isEditing ? `/api/subjects/${editingSubject!.id}` : "/api/subjects",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            description: description.trim() || undefined,
            color,
            targetHoursPerWeek: hours,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || data.message || "Failed to save subject.",
        );
      }

      const savedSubject = data.subject;

      const updatedSubject: Subject = {
        id: savedSubject.id,
        name: savedSubject.name,
        description: savedSubject.description ?? null,
        color: savedSubject.color,
        targetHoursPerWeek: savedSubject.targetHoursPerWeek ?? null,
        topicCount:
          savedSubject._count?.topics ?? editingSubject?.topicCount ?? 0,
        createdAt: savedSubject.createdAt
          ? new Date(savedSubject.createdAt).toISOString()
          : (editingSubject?.createdAt ?? new Date().toISOString()),
      };

      if (isEditing) {
        setSubjects((current) =>
          current.map((subject) =>
            subject.id === updatedSubject.id ? updatedSubject : subject,
          ),
        );
      } else {
        setSubjects((current) => [updatedSubject, ...current]);
      }

      setIsModalOpen(false);
      setEditingSubject(null);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative min-h-full space-y-8 pb-10">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              YOUR LEARNING SPACE
            </span>
            <Sparkles size={15} className="text-purple-400" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#29243b] sm:text-4xl">
            My Subjects
          </h1>

          <p className="mt-2 text-sm text-[#9993aa] sm:text-base">
            Organize your learning and keep your study goals on track.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9671e8] to-[#b17de8] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200/60 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Subjects"
          value={totalSubjects}
          subtitle="Subjects you're learning"
          icon={<BookOpen size={21} />}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />

        <StatCard
          title="Weekly Study Goal"
          value={`${totalTargetHours}h`}
          subtitle="Your combined weekly target"
          icon={<Clock3 size={21} />}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />

        <StatCard
          title="Total Topics"
          value={totalTopics}
          subtitle="Topics across all subjects"
          icon={<BookMarked size={21} />}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
      </div>

      {/* Search and subject list */}
      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#29243b]">
              Your Learning Library
            </h2>
            <p className="mt-1 text-sm text-[#9993aa]">
              Manage and explore your subjects.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa3ba]"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subjects..."
              className="w-full rounded-2xl border border-purple-100/80 bg-white/75 py-3 pl-11 pr-4 text-sm text-[#29243b] outline-none backdrop-blur-xl transition placeholder:text-[#b2adbf] focus:border-purple-300 focus:ring-4 focus:ring-purple-100/70"
            />
          </div>
        </div>

        {filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onEdit={openEditModal}
                onDelete={setDeletingSubject}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-purple-100/80 bg-white/65 px-6 py-14 text-center shadow-sm backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
              {search ? <Search size={27} /> : <BookOpen size={27} />}
            </div>

            <h3 className="text-lg font-bold text-[#29243b]">
              {search
                ? "No subjects found"
                : "Your learning journey starts here"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#9993aa]">
              {search
                ? "Try searching with another subject name or description."
                : "Add your first subject to organize topics, set study goals, and track your progress."}
            </p>

            {!search && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                <Plus size={17} />
                Create your first subject
              </button>
            )}
          </div>
        )}
      </section>

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#211936]/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-lg rounded-3xl border border-white/70 bg-white/95 p-6 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                  <BookOpen size={22} />
                </div>
                <h2 className="text-2xl font-bold text-[#29243b]">
                  {editingSubject ? "Edit Subject" : "Add a Subject"}
                </h2>

                <p className="mt-1 text-sm text-[#9993aa]">
                  {editingSubject
                    ? "Update your subject details and study goals."
                    : "Create a space for your next learning goal."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-xl p-2 text-[#9993aa] transition hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-5">
              {/* Subject name */}
              <div>
                <label
                  htmlFor="subject-name"
                  className="mb-2 block text-sm font-semibold text-[#49425d]"
                >
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Data Structures and Algorithms"
                  maxLength={80}
                  required
                  className="w-full rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3 text-sm text-[#29243b] outline-none transition placeholder:text-[#b2adbf] focus:border-purple-300 focus:ring-4 focus:ring-purple-100/70"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="subject-description"
                  className="mb-2 block text-sm font-semibold text-[#49425d]"
                >
                  Description
                  <span className="ml-1 font-normal text-[#aaa3ba]">
                    (Optional)
                  </span>
                </label>
                <textarea
                  id="subject-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What will you be learning?"
                  rows={3}
                  maxLength={300}
                  className="w-full resize-none rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3 text-sm text-[#29243b] outline-none transition placeholder:text-[#b2adbf] focus:border-purple-300 focus:ring-4 focus:ring-purple-100/70"
                />
              </div>

              {/* Color selection */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#49425d]">
                  Choose a Color
                </label>

                <div className="flex flex-wrap gap-3">
                  {SUBJECT_COLORS.map((subjectColor) => (
                    <button
                      key={subjectColor}
                      type="button"
                      onClick={() => setColor(subjectColor)}
                      aria-label={`Select color ${subjectColor}`}
                      aria-pressed={color === subjectColor}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                        color === subjectColor
                          ? "ring-2 ring-purple-500 ring-offset-2"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: subjectColor }}
                    >
                      {color === subjectColor && (
                        <span className="h-2.5 w-2.5 rounded-full bg-white shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly target */}
              <div>
                <label
                  htmlFor="target-hours"
                  className="mb-2 block text-sm font-semibold text-[#49425d]"
                >
                  Weekly Study Target
                </label>

                <div className="relative">
                  <Clock3
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa3ba]"
                  />
                  <input
                    id="target-hours"
                    type="number"
                    min="0"
                    max="168"
                    step="0.5"
                    value={targetHours}
                    onChange={(event) => setTargetHours(event.target.value)}
                    className="w-full rounded-xl border border-purple-100 bg-purple-50/40 py-3 pl-11 pr-14 text-sm text-[#29243b] outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100/70"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#9993aa]">
                    hours
                  </span>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-xl border border-purple-100 px-5 py-3 text-sm font-semibold text-[#777087] transition hover:bg-purple-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9671e8] to-[#b17de8] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200/60 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingSubject ? (
                        <Pencil size={17} />
                      ) : (
                        <Plus size={17} />
                      )}
                      {editingSubject ? "Save Changes" : "Create Subject"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deletingSubject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#211936]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/95 p-7 shadow-2xl shadow-purple-950/20">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-500">
              <Trash2 size={23} />
            </div>

            <h2 className="text-xl font-bold text-[#29243b]">
              Delete Subject?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#9993aa]">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#49425d]">
                {deletingSubject.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingSubject(null)}
                className="rounded-xl border border-purple-100 px-5 py-3 text-sm font-semibold text-[#777087] transition hover:bg-purple-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSubject}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Delete Subject
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Statistics card */
function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  iconBg,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-[0_8px_30px_rgba(112,82,170,0.06)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-100/60">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#9993aa]">{title}</p>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-[#29243b]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#aaa3ba]">{subtitle}</p>
    </div>
  );
}

/* Subject card */
function SubjectCard({
  subject,
  onEdit,
  onDelete,
}: {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_8px_30px_rgba(112,82,170,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100/70">
      <div
        className="absolute left-0 top-0 h-1.5 w-full"
        style={{ backgroundColor: subject.color }}
      />

      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${subject.color}22`,
            color: subject.color,
          }}
        >
          <BookOpen size={23} />
        </div>

        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
          Active
        </span>
      </div>

      <h3 className="mt-5 line-clamp-1 text-lg font-bold text-[#29243b] transition group-hover:text-purple-700">
        {subject.name}
      </h3>

      <p className="mt-2 min-h-10 line-clamp-2 text-sm leading-5 text-[#9993aa]">
        {subject.description || "No description added yet."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-purple-100/70 pt-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#9993aa]">
            <BookMarked size={14} />
            <span className="text-xs">Topics</span>
          </div>
          <p className="mt-1 text-lg font-bold text-[#49425d]">
            {subject.topicCount}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[#9993aa]">
            <Clock3 size={14} />
            <span className="text-xs">Weekly Goal</span>
          </div>
          <p className="mt-1 text-lg font-bold text-[#49425d]">
            {subject.targetHoursPerWeek ?? 0}
            <span className="ml-1 text-xs font-medium text-[#9993aa]">hrs</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-purple-100/70 pt-4">
        <span className="text-xs text-[#aaa3ba]">
          Added{" "}
          {new Date(subject.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(subject)}
            aria-label={`Edit ${subject.name}`}
            title="Edit subject"
            className="rounded-xl bg-purple-50 p-2 text-purple-600 transition hover:bg-purple-100"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(subject)}
            aria-label={`Delete ${subject.name}`}
            title="Delete subject"
            className="rounded-xl bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
