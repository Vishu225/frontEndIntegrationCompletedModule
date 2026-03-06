import type { ProgramCategory } from "../api/program.types";

const CATEGORY_LABELS: Record<ProgramCategory, string> = {
  FITNESS: "Fitness",
  MENTAL_WELLNESS: "Mental Wellness",
  NUTRITION: "Nutrition",
  YOGA: "Yoga",
  MINDFULNESS: "Mindfulness",
  WELLNESS: "Wellness",
};

export default function CategoryBadge({
  category,
}: {
  category: ProgramCategory;
}) {
  return (
    <span className="badge-category">
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}
