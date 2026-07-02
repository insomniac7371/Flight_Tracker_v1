import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./styles.css";

/* Key layout definitions */
const LOWER = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["SHIFT","z","x","c","v","b","n","m","DEL"],
  ["123","@","."," ","DONE"],
];
const UPPER = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["SHIFT","Z","X","C","V","B","N","M","DEL"],
  ["123","@","."," ","DONE"],
];
const NUMS = [
  ["1","2","3","4","5","6","7","8","9","0"],
  ["-","_","/",":",".","@","!","?","#","&"],
  ["ABC","(",")",'"',"'",",","DEL"],
  [" ","DONE"],
];
const NUMPAD = [
  ["1","2","3"],
  ["4","5","6"],
  ["7","8","9"],
  ["DEL","0","DONE"],
];

const LABEL = { SHIFT: "⇧", DEL: "⌫", DONE: "✓", ABC: "ABC", "123": "123", " ": " " };

/** Programmatically set a React-controlled input's value */
function setNativeValue(el, value) {
  const proto = el.tagName === "TEXTAREA"
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Global on-screen keyboard — slides up when any input/textarea is focused.
 *
 * @returns {JSX.Element|null} keyboard overlay or null when hidden
 */
const VirtualKeyboard = () => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState("lower");
  const activeEl = useRef(null);

  /* Insert a character at the current cursor position */
  const typeChar = useCallback((char) => {
    const el = activeEl.current;
    if (!el) return;

    const isNum = el.type === "number";
    if (isNum) {
      const cur = String(el.value || "");
      const next = cur + char;
      if (next === "-" || next === "." || /^-?\d*\.?\d*$/.test(next)) {
        setNativeValue(el, next);
      }
      return;
    }

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const cur = el.value;
    setNativeValue(el, cur.slice(0, start) + char + cur.slice(end));
    requestAnimationFrame(() => {
      try { el.setSelectionRange(start + char.length, start + char.length); } catch (_) { /* number inputs don't support setSelectionRange */ }
    });
  }, []);

  /* Delete character before cursor */
  const deleteChar = useCallback(() => {
    const el = activeEl.current;
    if (!el) return;

    if (el.type === "number") {
      const cur = String(el.value || "");
      setNativeValue(el, cur.slice(0, -1));
      return;
    }

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const cur = el.value;
    if (start !== end) {
      setNativeValue(el, cur.slice(0, start) + cur.slice(end));
      requestAnimationFrame(() => { try { el.setSelectionRange(start, start); } catch (_) { /* number inputs don't support setSelectionRange */ } });
    } else if (start > 0) {
      setNativeValue(el, cur.slice(0, start - 1) + cur.slice(start));
      requestAnimationFrame(() => { try { el.setSelectionRange(start - 1, start - 1); } catch (_) { /* number inputs don't support setSelectionRange */ } });
    }
  }, []);

  /* Global focus listener — show keyboard when any input is focused */
  useEffect(() => {
    const onFocusIn = (e) => {
      const el = e.target;
      if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") return;
      if (el.readOnly || el.disabled) return;
      activeEl.current = el;
      const isNumeric = el.type === "number" || el.inputMode === "numeric" || el.dataset.kbMode === "numeric";
      setMode(isNumeric ? "numpad" : "lower");
      setVisible(true);
    };
    const onFocusOut = () => {
      setTimeout(() => {
        const focused = document.activeElement;
        if (!focused || (focused.tagName !== "INPUT" && focused.tagName !== "TEXTAREA")) {
          setVisible(false);
        } else {
          activeEl.current = focused;
        }
      }, 80);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  /* Handle a key press — prevents the input from blurring */
  const handleKey = useCallback((key) => (e) => {
    e.preventDefault();
    switch (key) {
      case "DEL":  deleteChar(); break;
      case "DONE": setVisible(false); activeEl.current?.blur(); break;
      case "SHIFT": setMode((m) => m === "upper" ? "lower" : "upper"); break;
      case "123":  setMode("nums"); break;
      case "ABC":  setMode("lower"); break;
      default:
        typeChar(key);
        if (mode === "upper") setMode("lower");
    }
  }, [deleteChar, typeChar, mode]);

  if (!visible) return null;

  const rows = { lower: LOWER, upper: UPPER, nums: NUMS, numpad: NUMPAD }[mode] || LOWER;

  return (
    <div className={styles.keyboard} onPointerDown={(e) => e.preventDefault()}>
      {rows.map((row, ri) => (
        <div key={ri} className={`${styles.row} ${mode === "numpad" ? styles.numpadRow : ""}`}>
          {row.map((key) => {
            const isShift  = key === "SHIFT";
            const isDel    = key === "DEL";
            const isDone   = key === "DONE";
            const isSpace  = key === " ";
            const isWide   = isShift || isDel || key === "ABC" || key === "123";
            const isActive = isShift && mode === "upper";
            const cls = [
              styles.key,
              isWide   && styles.keyWide,
              isSpace  && styles.keySpace,
              isDone   && styles.keyDone,
              isDel    && styles.keyDel,
              isActive && styles.keyActive,
            ].filter(Boolean).join(" ");
            return (
              <button key={key + ri} className={cls} onPointerDown={handleKey(key)}>
                {LABEL[key] ?? key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;
