"use client";

import type { ChangeEvent } from "react";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const pairs = (text: string) => text.match(/.{1,2}/g)?.join(" ") ?? "";
  if (value.trimStart().startsWith("+")) {
    // Preserve the French country code and group the remaining number naturally.
    if (digits.startsWith("33") && digits.length > 2) {
      return `+33 ${digits[2]}${digits.length > 3 ? ` ${pairs(digits.slice(3))}` : ""}`;
    }
    return `+${pairs(digits)}`;
  }
  return pairs(digits);
}

export function PhoneInput() {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const original = input.value;
    const caret = input.selectionStart ?? original.length;
    const charactersBeforeCaret = original.slice(0, caret).replace(/[^\d+]/g, "").length;
    const formatted = formatPhone(original);
    if (formatted === original) return;
    input.value = formatted;

    // Keep the cursor beside the edited digit, even when spaces move.
    let position = 0;
    let characters = 0;
    while (position < formatted.length && characters < charactersBeforeCaret) {
      if (/[\d+]/.test(formatted[position])) characters++;
      position++;
    }
    input.setSelectionRange(position, position);
  }

  return <input data-contact-field name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="06 12 34 56 78" onChange={handleChange} />;
}
