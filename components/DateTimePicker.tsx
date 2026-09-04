"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const CLOCK_HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const CLOCK_MINUTES = Array.from({ length: 12 }, (_, index) => index * 5);

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function timeParts(time: string) {
  const [hours = "09", minutes = "00"] = time.split(":");
  return { hour: Number(hours), minute: Number(minutes) };
}

export function DateTimePicker({ label, dateName, timeName }: { label: string; dateName: string; timeName: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const today = useMemo(() => new Date(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [isClockOpen, setIsClockOpen] = useState(false);
  const [clockStep, setClockStep] = useState<"hour" | "minute">("hour");
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [draftTime, setDraftTime] = useState("09:00");
  const firstDay = (month.getDay() + 6) % 7;
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(month);
  const selectedDateLabel = selectedDate ? new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "long" }).format(new Date(`${selectedDate}T12:00:00`)) : "Choisir une date";
  const cells = Array.from({ length: Math.ceil((firstDay + dayCount) / 7) * 7 }, (_, index) => index - firstDay + 1);
  const draft = timeParts(draftTime);
  const isPm = draft.hour >= 12;
  const displayHour = draft.hour % 12 || 12;
  const selectedClockValue = clockStep === "hour" ? displayHour : draft.minute;

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) { setIsOpen(false); setIsClockOpen(false); }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") { setIsClockOpen(false); setIsOpen(false); }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutsideClick); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  function selectDate(value: string) { setSelectedDate(value); setSelectedTime(""); setIsClockOpen(false); }
  function openClock() { setDraftTime(selectedTime || "09:00"); setClockStep("hour"); setIsClockOpen(true); }
  function setMeridiem(pm: boolean) { const nextHour = (draft.hour % 12) + (pm ? 12 : 0); setDraftTime(`${String(nextHour).padStart(2, "0")}:${String(draft.minute).padStart(2, "0")}`); }
  function selectClockValue(value: number) {
    if (clockStep === "hour") { const nextHour = (value % 12) + (isPm ? 12 : 0); setDraftTime(`${String(nextHour).padStart(2, "0")}:${String(draft.minute).padStart(2, "0")}`); setClockStep("minute"); return; }
    setDraftTime(`${String(draft.hour).padStart(2, "0")}:${String(value).padStart(2, "0")}`);
  }
  function confirmTime() { setSelectedTime(draftTime); setIsClockOpen(false); setIsOpen(false); }

  return <section className="appointment-picker" aria-label={label} ref={rootRef}>
    <input type="hidden" name={dateName} value={selectedDate} /><input type="hidden" name={timeName} value={selectedTime} />
    <button type="button" className={`appointment-trigger ${isOpen ? "is-open" : ""}`} aria-expanded={isOpen} onClick={() => { setIsOpen(open => !open); setIsClockOpen(false); }}>
      <span className="appointment-trigger-icon" aria-hidden="true">&#128197;</span><span><small>Date et horaire</small><strong>{selectedDateLabel}{selectedTime && ` · ${selectedTime}`}</strong></span><span className="appointment-trigger-chevron" aria-hidden="true">⌄</span>
    </button>
    {isOpen && <div className={`appointment-popover ${isClockOpen ? "has-clock" : ""}`}>
      <div className="appointment-calendar"><div className="appointment-header"><button type="button" aria-label="Mois precedent" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button><strong>{monthLabel}</strong><button type="button" aria-label="Mois suivant" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button></div><div className="appointment-weekdays">{DAYS.map(day => <span key={day}>{day}</span>)}</div><div className="appointment-days">{cells.map((day, index) => { if (day < 1 || day > dayCount) return <span key={`blank-${index}`} />; const date = new Date(month.getFullYear(), month.getMonth(), day); const value = isoDate(date); const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate()); return <button key={value} type="button" disabled={isPast} aria-pressed={selectedDate === value} className={selectedDate === value ? "selected" : ""} onClick={() => selectDate(value)}>{day}</button>; })}</div></div>
      {!isClockOpen ? <div className="appointment-times"><div className="appointment-times-heading"><span>Horaire</span><strong>{selectedTime || "Aucune heure choisie"}</strong></div><button type="button" className="time-picker-trigger" disabled={!selectedDate} onClick={openClock}><span aria-hidden="true">◷</span>{selectedDate ? "Choisir une heure" : "Choisissez une date"}</button></div> : <div className="clock-picker" aria-label="Selection de l heure"><div className="clock-title">SELECT TIME</div><div className="clock-display"><button type="button" className={clockStep === "hour" ? "active" : ""} onClick={() => setClockStep("hour")}>{String(displayHour).padStart(2, "0")}</button><span>:</span><button type="button" className={clockStep === "minute" ? "active" : ""} onClick={() => setClockStep("minute")}>{String(draft.minute).padStart(2, "0")}</button><div><button type="button" className={!isPm ? "active" : ""} onClick={() => setMeridiem(false)}>AM</button><button type="button" className={isPm ? "active" : ""} onClick={() => setMeridiem(true)}>PM</button></div></div><div className="clock-face"><i className="clock-hand" style={{ transform: `rotate(${(selectedClockValue % 12) * 30}deg)` }} /><span className="clock-center" />{(clockStep === "hour" ? CLOCK_HOURS : CLOCK_MINUTES).map((value, index) => <button key={value} type="button" className={value === selectedClockValue ? "selected" : ""} style={{ transform: `rotate(${index * 30}deg) translateY(-84px) rotate(${-index * 30}deg)` }} onClick={() => selectClockValue(value)}>{clockStep === "minute" ? String(value).padStart(2, "0") : value}</button>)}</div><div className="clock-actions"><button type="button" onClick={() => setIsClockOpen(false)}>CANCEL</button><button type="button" onClick={confirmTime}>OK</button></div></div>}
    </div>}
  </section>;
}
