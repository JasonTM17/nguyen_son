const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').toLowerCase();
// Generic discovery only. Named projects are handled before this branch; explicit
// technology/domain/comparison constraints retain normal relevance retrieval.
const constraints = /\b(?:java|javascript|typescript|python|kotlin|dart|golang|go|rust|c\+\+|c#|php|spring|react|next\.?js|nest\.?js|flutter|expo|docker|kubernetes|sql|postgresql|mysql|redis|mobile|android|ios|devops|rag|ai|y te|healthcare|medical|finance|tai chinh|tuyen dung|recruitment|giao duc|education|agriculture|nong nghiep|game|tro choi|other|similar|compare|comparison|alternatives?|besides|versus|vs|khac|tuong tu|so sanh|ngoai)\b/;
export function projectOverviewRequest(message) {
  const text = normalize(message);
  if (!/\b(?:du an|projects?|portfolio)\b/.test(text) || !/\b(?:tieu bieu|noi bat|tong quan|gioi thieu|overview|representative|highlights?|showcase|introduce|featured|show)\b/.test(text) || constraints.test(text) || /\bc(?:\+\+|#)?(?![\p{L}\p{N}_])|\b(?:node|fastapi|fastify|express|tailwind|css|vue|angular|laravel|terraform|three\.js|yolo|arduino|supabase|sqlite|kafka|pyside6|streamlit|godot|ecommerce|e-commerce|thuong mai|ban sach|bookstore|laptop|giao hang|delivery|hoc vu|dat lich)\b/u.test(text)) return null;
  const number = text.match(/\b([1-9]\d?)\s+(?:(?:featured|representative|best|top)\s+)?(?:du an|projects?)\b/);
  const words = { mot: 1, hai: 2, ba: 3, bon: 4, nam: 5, sau: 6, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  const word = text.match(/\b(mot|hai|ba|bon|nam|sau|one|two|three|four|five|six)\s+(?:(?:featured|representative)\s+)?(?:du an|projects?)\b/);
  if (/\b(?:pinned|pins|ghim|featured|spotlight)\b/.test(text) && !number && !word && !/\b(?:gioi thieu|tong quan|tieu bieu|noi bat|introduce|overview|representative|highlights?|showcase)\b/.test(text)) return null;
  return { requestedCount: number ? Number(number[1]) : word ? words[word[1]] : 3 };
}
