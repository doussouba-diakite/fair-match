// The values quiz. Each question is answered on a 1-5 scale:
// 1 = strongly disagree, 3 = neutral, 5 = strongly agree.
// `topic` is the short name used in explanations; `weight` says how much the question counts.
export const QUESTIONS = [
  { id: "routine", topic: "daily routine", weight: 1, text: "Kids do best with a clear, predictable daily routine." },
  { id: "school", topic: "school and achievement", weight: 1.2, text: "Academic achievement should be a top family priority." },
  { id: "faith", topic: "faith and tradition", weight: 1.5, text: "Religion or spiritual tradition should be central to how our child is raised." },
  { id: "screens", topic: "screen time", weight: 0.8, text: "Screen time should be strictly limited." },
  { id: "discipline", topic: "discipline", weight: 1.2, text: "Clear consequences matter more than long conversations when a child misbehaves." },
  { id: "freedom", topic: "independence", weight: 1, text: "Children should get freedom to make their own choices early." },
  { id: "culture", topic: "language and culture", weight: 1.3, text: "Raising our child with strong cultural roots or a second language matters a lot to me." },
  { id: "sharing", topic: "sharing time", weight: 1.5, text: "I want to split caregiving time close to 50/50." },
  { id: "money", topic: "splitting costs", weight: 1, text: "Costs should be split equally, no matter who earns more." },
  { id: "health", topic: "health and food", weight: 0.8, text: "Healthy food and activity should be strict household rules." },
];

export const CITIES = ["New York", "Boston", "Chicago", "Atlanta", "Los Angeles"];

// Plain-English stance for an answer, used when explaining a match.
export function stance(value) {
  if (value >= 4) return "agrees";
  if (value <= 2) return "disagrees";
  return "is neutral";
}
