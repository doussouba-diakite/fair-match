// The values quiz. Each question is answered on a 1-5 scale:
// 1 = strongly disagree, 3 = neutral, 5 = strongly agree.
// `topic` is the short name used in explanations; `weight` says how much the question counts.
export const QUESTIONS = [
  { id: "routine", starter: "What does a normal weekday look like for you, from wake-up to bedtime?", topic: "daily routine", weight: 1, text: "Kids do best with a clear, predictable daily routine." },
  { id: "school", starter: "What would 'doing well in school' mean for our child?", topic: "school and achievement", weight: 1.2, text: "Academic achievement should be a top family priority." },
  { id: "faith", starter: "What role do you want faith or tradition to play in our child's life?", topic: "faith and tradition", weight: 1.5, text: "Religion or spiritual tradition should be central to how our child is raised." },
  { id: "screens", starter: "How much screen time feels right to you at different ages?", topic: "screen time", weight: 0.8, text: "Screen time should be strictly limited." },
  { id: "discipline", starter: "How were you disciplined growing up, and what would you keep or change?", topic: "discipline", weight: 1.2, text: "Clear consequences matter more than long conversations when a child misbehaves." },
  { id: "freedom", starter: "At what age should a child start making their own big choices?", topic: "independence", weight: 1, text: "Children should get freedom to make their own choices early." },
  { id: "culture", starter: "Which languages, foods, or traditions do you most want to pass on?", topic: "language and culture", weight: 1.3, text: "Raising our child with strong cultural roots or a second language matters a lot to me." },
  { id: "sharing", starter: "How would we split weekdays, weekends, and holidays?", topic: "sharing time", weight: 1.5, text: "I want to split caregiving time close to 50/50." },
  { id: "money", starter: "How should we split costs if one of us earns more?", topic: "splitting costs", weight: 1, text: "Costs should be split equally, no matter who earns more." },
  { id: "health", starter: "What food and activity rules matter most to you at home?", topic: "health and food", weight: 0.8, text: "Healthy food and activity should be strict household rules." },
];

export const CITIES = ["New York", "Boston", "Chicago", "Atlanta", "Los Angeles"];

// Plain-English stance for an answer, used when explaining a match.
export function stance(value) {
  if (value >= 4) return "agrees";
  if (value <= 2) return "disagrees";
  return "is neutral";
}
