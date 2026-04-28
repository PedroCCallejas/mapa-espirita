const weekdayAliases: string[][] = [
  ['domingo', 'sunday'],
  ['segunda', 'monday'],
  ['terca', 'tuesday'],
  ['quarta', 'wednesday'],
  ['quinta', 'thursday'],
  ['sexta', 'friday'],
  ['sabado', 'saturday'],
];
const weekdayTranslations = [
  { english: 'monday', portuguese: 'Segunda-feira' },
  { english: 'tuesday', portuguese: 'Terça-feira' },
  { english: 'wednesday', portuguese: 'Quarta-feira' },
  { english: 'thursday', portuguese: 'Quinta-feira' },
  { english: 'friday', portuguese: 'Sexta-feira' },
  { english: 'saturday', portuguese: 'Sábado' },
  { english: 'sunday', portuguese: 'Domingo' },
];
const scheduleTermTranslations = [
  { english: 'closed', portuguese: 'Fechado' },
  { english: 'open', portuguese: 'Aberto' },
  { english: '24 hours', portuguese: '24 horas' },
];

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function translateScheduleTerms(value: string) {
  return scheduleTermTranslations.reduce((translatedValue, translation) => {
    const pattern = new RegExp(`\\b${translation.english}\\b`, 'gi');

    return translatedValue.replace(pattern, (matchedValue) =>
      matchedValue === matchedValue.toLowerCase()
        ? translation.portuguese.toLowerCase()
        : translation.portuguese,
    );
  }, value);
}

export function translateWeekdayDescription(value: string) {
  const trimmedValue = value.trim();
  const normalizedValue = normalizeText(trimmedValue);
  const translation = weekdayTranslations.find(({ english }) =>
    normalizedValue.startsWith(english),
  );

  if (!translation) {
    return translateScheduleTerms(value);
  }

  const weekdayPrefix = trimmedValue.match(/^[A-Za-z]+/);

  if (!weekdayPrefix) {
    return translateScheduleTerms(value);
  }

  return `${translation.portuguese}${translateScheduleTerms(
    trimmedValue.slice(weekdayPrefix[0].length),
  )}`;
}

export function translateWeekdayDescriptions(weekdayDescriptions: string[]) {
  return weekdayDescriptions.map(translateWeekdayDescription);
}

export function getTodayHours(weekdayDescriptions: string[]) {
  if (!weekdayDescriptions.length) {
    return null;
  }

  const todayAliases = weekdayAliases[new Date().getDay()] ?? weekdayAliases[0];

  if (!todayAliases) {
    return weekdayDescriptions[0] ?? null;
  }
  const lineForToday = weekdayDescriptions.find((line) => {
    const normalizedLine = normalizeText(line);
    return todayAliases.some((alias) => normalizedLine.startsWith(normalizeText(alias)));
  });

  return translateWeekdayDescription(lineForToday ?? weekdayDescriptions[0] ?? '');
}
