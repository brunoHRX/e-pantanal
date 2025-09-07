export function stripDiacritics(s: string) {
    return s.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}