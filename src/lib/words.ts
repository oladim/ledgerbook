// Convert an amount to words, e.g. 240131.5 -> "Two hundred forty thousand,
// one hundred thirty-one naira fifty kobo only".

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", " thousand", " million", " billion", " trillion"];

function underThousand(n: number): string {
  let s = "";
  if (n >= 100) { s += ONES[Math.floor(n / 100)] + " hundred"; n %= 100; if (n) s += " "; }
  if (n >= 20) { s += TENS[Math.floor(n / 10)]; if (n % 10) s += "-" + ONES[n % 10]; }
  else if (n > 0) { s += ONES[n]; }
  return s;
}

function intToWords(n: number): string {
  if (n === 0) return "zero";
  const parts: string[] = [];
  let scale = 0;
  while (n > 0) {
    const chunk = n % 1000;
    if (chunk) parts.unshift(underThousand(chunk) + SCALES[scale]);
    n = Math.floor(n / 1000);
    scale++;
  }
  return parts.join(", ");
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function nairaWords(amount: number): string {
  const naira = Math.floor(Math.abs(amount));
  const kobo = Math.round((Math.abs(amount) - naira) * 100);
  let s = `${intToWords(naira)} naira`;
  if (kobo > 0) s += ` ${intToWords(kobo)} kobo`;
  return cap(s + " only");
}
