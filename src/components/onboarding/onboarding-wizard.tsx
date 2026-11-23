
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Clock3,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Sparkles,
  Target,
  Check,
  LoaderCircle,
} from "lucide-react";

const educationLevels = [
  "High School",
  "Diploma",
  "Undergraduate",
  "Postgraduate",
  "Doctorate",
  "Other",
];

const studyTimes = [
  { label: "Morning", time: "5 AM – 11 AM", icon: Sunrise },
  { label: "Afternoon", time: "11 AM – 4 PM", icon: Sun },
  { label: "Evening", time: "4 PM – 8 PM", icon: Sunset },
  { label: "Night", time: "8 PM – 12 AM", icon: Moon },
];

const studyHours = [1, 2, 3, 4, 5, 6, 8, 10];

const goals = [
  "Prepare for upcoming exams",
  "Improve my academic performance",
  "Learn new skills",
  "Prepare for interviews",
  "Build consistent study habits",
  "Complete my coursework",
];

type OnboardingData = {
  academicLevel: string;
  institution: string;
  course: string;
  dailyStudyHours: number;
  preferredStudyTime: string;
  studyGoal: string;
};

const initialData: OnboardingData = {
  academicLevel: "",
  institution: "",
  course: "",
  dailyStudyHours: 3,
  preferredStudyTime: "",
  studyGoal: "",
};

export default function OnboardingWizard({
  initialValues,
}: {
  initialValues?: Partial<OnboardingData>;
}) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    ...initialData,
    ...initialValues,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateData<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) {
    setData((previous) => ({ ...previous, [key]: value }));
  }

  function validateStep() {
    if (step === 1) {
      if (
        !data.academicLevel ||
        data.institution.trim().length < 2 ||
        data.course.trim().length < 2
      ) {
        setError("Please complete all your academic details.");
        return false;
      }
    }

    if (step === 2) {
      if (!data.dailyStudyHours || !data.preferredStudyTime) {
        setError("Please select your study preferences.");
        return false;
      }
    }

    if (step === 3 && data.studyGoal.trim().length < 10) {
      setError("Please tell us a little more about your study goal.");
      return false;
    }

    setError("");
    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep((previous) => Math.min(previous + 1, 3));
  }

  async function submitOnboarding() {
    if (!validateStep()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save your profile.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Brand */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a58af5] to-[#7955dc] text-white shadow-lg shadow-purple-200">
          <Sparkles size={23} />
        </div>
        <span className="text-xl font-extrabold tracking-tight">
          StudyPilot<span className="text-[#8967e8]">.</span>
        </span>
      </div>

      {/* Wizard card */}
      <div className="glass-panel overflow-hidden rounded-[30px] p-5 sm:p-9">
        {/* Progress */}
        <div className="mb-9">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[2px] text-[#9993aa]">
              Let's personalize your experience
            </span>
            <span className="text-xs font-bold text-[#8967e8]">
              {String(step).padStart(2, "0")} / 03
            </span>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  item <= step
                    ? "bg-gradient-to-r from-[#9875e8] to-[#c09af2]"
                    : "bg-[#eae6f2]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step heading */}
        <div className="mb-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee8ff] text-[#8967e8]">
            {step === 1 && <GraduationCap size={27} />}
            {step === 2 && <Clock3 size={27} />}
            {step === 3 && <Target size={27} />}
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {step === 1 && "First, tell us about yourself."}
            {step === 2 && "Let's find your study rhythm."}
            {step === 3 && "What are you working towards?"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#9690a8]">
            {step === 1 &&
              "Tell us about your academic background so we can personalize your experience."}
            {step === 2 &&
              "We'll use your availability to help create a realistic study schedule."}
            {step === 3 &&
              "Every great learning journey starts with a goal. Tell us yours."}
          </p>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-bold">
                What's your education level?
              </label>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {educationLevels.map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => updateData("academicLevel", level)}
                    className={`rounded-2xl border p-4 text-left text-sm font-semibold transition ${
                      data.academicLevel === level
                        ? "border-[#9875e8] bg-[#eee8ff] text-[#805bd7] shadow-sm"
                        : "border-[#eeeaf5] bg-white/65 text-[#77728e] hover:border-purple-200"
                    }`}
                  >
                    <GraduationCap
                      size={19}
                      className="mb-3 text-[#9875e8]"
                    />
                    {level}
                    {data.academicLevel === level && (
                      <Check size={16} className="mt-2 text-[#8967e8]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Institution / University
              </label>
              <input
                value={data.institution}
                onChange={(event) =>
                  updateData("institution", event.target.value)
                }
                placeholder="e.g. Garden City University"
                maxLength={150}
                className="w-full rounded-2xl border border-[#eeeaf5] bg-white/75 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b2adc0] focus:border-[#9875e8] focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Course / Degree
              </label>
              <input
                value={data.course}
                onChange={(event) =>
                  updateData("course", event.target.value)
                }
                placeholder="e.g. Master of Computer Applications"
                maxLength={150}
                className="w-full rounded-2xl border border-[#eeeaf5] bg-white/75 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b2adc0] focus:border-[#9875e8] focus:ring-4 focus:ring-purple-100"
              />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-7">
            <div>
              <label className="mb-3 block text-sm font-bold">
                How many hours can you study daily?
              </label>

              <div className="grid grid-cols-4 gap-3">
                {studyHours.map((hours) => (
                  <button
                    type="button"
                    key={hours}
                    onClick={() => updateData("dailyStudyHours", hours)}
                    className={`rounded-2xl border py-4 text-center transition ${
                      data.dailyStudyHours === hours
                        ? "border-[#9875e8] bg-[#eee8ff] text-[#805bd7]"
                        : "border-[#eeeaf5] bg-white/65 text-[#77728e] hover:border-purple-200"
                    }`}
                  >
                    <span className="block text-xl font-extrabold">
                      {hours}
                    </span>
                    <span className="text-[10px] font-semibold">hours</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-bold">
                When do you feel most productive?
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {studyTimes.map((time) => {
                  const Icon = time.icon;
                  const active = data.preferredStudyTime === time.label;

                  return (
                    <button
                      type="button"
                      key={time.label}
                      onClick={() =>
                        updateData("preferredStudyTime", time.label)
                      }
                      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-[#9875e8] bg-[#eee8ff]"
                          : "border-[#eeeaf5] bg-white/65 hover:border-purple-200"
                      }`}
                    >
                      <div className="rounded-xl bg-white p-3 text-[#8967e8]">
                        <Icon size={21} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{time.label}</p>
                        <p className="mt-1 text-xs text-[#9993aa]">
                          {time.time}
                        </p>
                      </div>
                      {active && (
                        <Check size={17} className="ml-auto text-[#8967e8]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-bold">
                What's your primary study goal?
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {goals.map((goal) => (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => updateData("studyGoal", goal)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold transition ${
                      data.studyGoal === goal
                        ? "border-[#9875e8] bg-[#eee8ff] text-[#805bd7]"
                        : "border-[#eeeaf5] bg-white/65 text-[#77728e] hover:border-purple-200"
                    }`}
                  >
                    <Target size={18} className="shrink-0 text-[#9875e8]" />
                    <span>{goal}</span>
                    {data.studyGoal === goal && (
                      <Check size={16} className="ml-auto shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
               Describe your primary study goal
              </label>
              <textarea
                value={data.studyGoal}
                onChange={(event) =>
                  updateData("studyGoal", event.target.value)
                }
                placeholder="e.g. I want to improve my programming skills and prepare for my semester exams..."
                maxLength={500}
                rows={4}
                className="w-full resize-none rounded-2xl border border-[#eeeaf5] bg-white/75 px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b2adc0] focus:border-[#9875e8] focus:ring-4 focus:ring-purple-100"
              />
              <p className="mt-2 text-right text-xs text-[#aaa5b8]">
                {data.studyGoal.length}/500
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-9 flex items-center justify-between border-t border-purple-100/70 pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep((previous) => previous - 1);
              }}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-[#88829e] transition hover:bg-purple-50"
            >
              <ArrowLeft size={17} />
              Back
            </button>
          ) : (
            <span className="text-xs text-[#aaa5b8]">
              Your information stays private.
            </span>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9875e8] to-[#b18be9] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5"
            >
              Continue <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={submitOnboarding}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9875e8] to-[#b18be9] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete setup <Sparkles size={17} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-[#aaa5b8]">
        Made for your goals, your pace and your future. ✨
      </p>
    </div>
  );
}
