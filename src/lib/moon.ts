// Datas de lua nova pelo algoritmo de Jean Meeus (Astronomical Algorithms, cap. 49),
// com os termos periódicos principais: erro de poucos minutos, suficiente para
// saber o dia da lua nova no horário de Brasília.

const RAD = Math.PI / 180

function newMoonJDE(k: number): number {
  const T = k / 1236.85
  const T2 = T * T
  const T3 = T2 * T
  const T4 = T3 * T

  const jde =
    2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4
  const E = 1 - 0.002516 * T - 0.0000074 * T2
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3) * RAD
  const Mp =
    (201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4) * RAD
  const F =
    (160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4) * RAD
  const Om = (124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) * RAD

  const corr =
    -0.4072 * Math.sin(Mp) +
    0.17241 * E * Math.sin(M) +
    0.01608 * Math.sin(2 * Mp) +
    0.01039 * Math.sin(2 * F) +
    0.00739 * E * Math.sin(Mp - M) -
    0.00514 * E * Math.sin(Mp + M) +
    0.00208 * E * E * Math.sin(2 * M) -
    0.00111 * Math.sin(Mp - 2 * F) -
    0.00057 * Math.sin(Mp + 2 * F) +
    0.00056 * E * Math.sin(2 * Mp + M) -
    0.00042 * Math.sin(3 * Mp) +
    0.00042 * E * Math.sin(M + 2 * F) +
    0.00038 * E * Math.sin(M - 2 * F) -
    0.00024 * E * Math.sin(2 * Mp - M) -
    0.00017 * Math.sin(Om)

  return jde + corr
}

/** Data (YYYY-MM-DD, horário de Brasília) da lua nova de índice k. */
function newMoonDate(k: number): string {
  const ms = (newMoonJDE(k) - 2440587.5) * 86400000
  return new Date(ms - 3 * 3600 * 1000).toISOString().slice(0, 10)
}

function kNear(date: string): number {
  const d = new Date(date + "T12:00:00Z")
  const years = d.getUTCFullYear() + (d.getUTCMonth() + d.getUTCDate() / 31) / 12 - 2000
  return Math.floor(years * 12.3685) - 1
}

/** Próximas `n` luas novas a partir de `from` (inclusive). */
export function newMoonsFrom(from: string, n: number): string[] {
  const out: string[] = []
  let k = kNear(from)
  while (out.length < n) {
    const d = newMoonDate(k)
    if (d >= from) out.push(d)
    k++
  }
  return out
}

/** Últimas `n` luas novas antes de `before` (exclusive), da mais recente para a mais antiga. */
export function newMoonsBefore(before: string, n: number): string[] {
  const out: string[] = []
  let k = kNear(before) + 2
  while (out.length < n) {
    const d = newMoonDate(k)
    if (d < before) out.push(d)
    k--
  }
  return out
}
