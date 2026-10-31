const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// Date 객체 → '9월 14일 (일)' 형식
export const formatDateKorean = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = DAY_NAMES[date.getDay()];
  return `${month}월 ${day}일 (${dayName})`;
};

// Date 객체 → 'YYYY-MM-DD' 저장용 문자열 (로컬 기준 — toISOString은 UTC 반환이라 한국 시간대에서 날짜가 하루 밀림)
export const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 'YYYY-MM-DD' → Date 객체
export const fromDateString = (str: string): Date =>
  new Date(`${str}T00:00:00`);

// 오늘 날짜를 'YYYY-MM-DD'로 반환
export const todayString = (): string => toDateString(new Date());

export const subscribeLocalDate = (
  onChange: (today: string) => void,
  subscribeActive: (refresh: () => void) => () => void,
): (() => void) => {
  let timer: ReturnType<typeof setTimeout>;
  const refresh = () => {
    clearTimeout(timer);
    const now = new Date();
    onChange(toDateString(now));
    const midnight = new Date(now);
    // Local midnight may be 23 or 25 hours away across a DST transition.
    midnight.setHours(24, 0, 0, 0);
    timer = setTimeout(refresh, midnight.getTime() - now.getTime());
  };
  const removeActiveListener = subscribeActive(refresh);
  refresh();
  return () => {
    clearTimeout(timer);
    removeActiveListener();
  };
};

export const relativeDayLabel = (dateStr: string, today: string = todayString()): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [todayYear, todayMonth, todayDay] = today.split('-').map(Number);
  // UTC ordinals compare local calendar dates without DST's 23/25-hour days.
  const diff = (
    Date.UTC(year, month - 1, day) - Date.UTC(todayYear, todayMonth - 1, todayDay)
  ) / 86_400_000;
  if (diff === 0) return '오늘';
  return `${diff > 0 ? '+' : ''}${diff}D`;
};

// 'YYYY-MM-DD' 문자열에 days를 더한 새 문자열 반환
export const addDays = (dateStr: string, days: number): string => {
  const date = fromDateString(dateStr);
  date.setDate(date.getDate() + days);
  return toDateString(date);
};

// 'YYYY-MM-DD' 기준 오늘로부터 상대 날짜 텍스트 ('오늘' / 'N일 전' / 'N일 후')
export const relativeDays = (dateStr: string): string => {
  const diff = Math.round(
    (fromDateString(dateStr).getTime() - fromDateString(todayString()).getTime()) / 86_400_000
  );
  if (diff === 0) return '오늘';
  return diff > 0 ? `${diff}일 후` : `${Math.abs(diff)}일 전`;
};

// 시간 포맷 '오후 3:45' 형식
export const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const h = hours % 12 || 12;
  const m = String(minutes).padStart(2, '0');
  return `${period} ${h}:${m}`;
};
