"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check } from "@phosphor-icons/react/dist/ssr";
import "./searchable-select.css";

export type SearchableOption = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  options: SearchableOption[];
  defaultValue?: string | string[] | number | null;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
  inputClassName?: string;
  style?: CSSProperties;
  emptyLabel?: string;
  menuPlacement?: "top" | "bottom";
};

type MenuStyle = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
};

const SEARCH_THRESHOLD = 20;

function toArray(value: string | string[] | number | null | undefined): string[] {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return [String(value)];
}

function isSearchPlaceholder(value: string) {
  return /^search/i.test(value.trim());
}

function findOption(options: SearchableOption[], value: string): SearchableOption | undefined {
  return options.find(
    (o) => o.value === value || String(o.value) === String(value) || Number(o.value) === Number(value),
  );
}

/** Resolve a display label; never fall back to a bare numeric id. */
function optionLabel(options: SearchableOption[], value: string): string {
  const match = findOption(options, value);
  const label = String(match?.label || "").trim();
  if (label) return label;
  const raw = String(value || "").trim();
  if (/^\d+$/.test(raw)) return "";
  return raw;
}

export function SearchableSelect({
  name,
  options,
  defaultValue,
  value,
  onChange,
  placeholder = "Search...",
  required = false,
  disabled = false,
  multiple = false,
  className,
  inputClassName = "form-control",
  style,
  emptyLabel,
  menuPlacement = "bottom",
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(() => toArray(defaultValue));
  const selected = controlled ? toArray(value) : internal;
  const selectedSet = useMemo(() => new Set(selected.map(String)), [selected]);
  const searchable = options.length >= SEARCH_THRESHOLD;
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<MenuStyle | null>(null);
  const [resolvedPlacement, setResolvedPlacement] = useState<"top" | "bottom">(menuPlacement);

  const selectedLabels = useMemo(
    () => selected.map((v) => optionLabel(options, v)).filter(Boolean),
    [options, selected],
  );

  const summary = useMemo(() => {
    if (!selected.length) return "";
    if (!selectedLabels.length) {
      return selected.length === 1 ? "1 selected" : `${selected.length} selected`;
    }
    if (selected.length === 1) return selectedLabels[0] || "";
    return `${selectedLabels[0]} +${selected.length - 1}`;
  }, [selected, selectedLabels]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(() => (multiple ? "" : selectedLabels[0] || ""));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery(multiple ? summary : selectedLabels[0] || "");
    }
  }, [multiple, open, selectedLabels, summary]);

  const filtered = useMemo(() => {
    const base = options;
    if (!searchable || !open) return base;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    if (multiple && q === summary.toLowerCase()) return base;
    if (!multiple && selectedLabels[0] && q === selectedLabels[0].toLowerCase()) return base;
    return base.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [options, query, searchable, open, multiple, summary, selectedLabels]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const updateMenuPosition = () => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const gap = 4;
    const preferredMax = 240;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 8;
    const spaceAbove = rect.top - gap - 8;

    let placement = menuPlacement;
    if (menuPlacement === "bottom" && spaceBelow < 140 && spaceAbove > spaceBelow) {
      placement = "top";
    } else if (menuPlacement === "top" && spaceAbove < 140 && spaceBelow > spaceAbove) {
      placement = "bottom";
    }

    const maxHeight = Math.max(120, Math.min(preferredMax, placement === "top" ? spaceAbove : spaceBelow));
    setResolvedPlacement(placement);

    if (placement === "top") {
      setMenuStyle({
        bottom: window.innerHeight - rect.top + gap,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    } else {
      setMenuStyle({
        top: rect.bottom + gap,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    }
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
    function onReposition() {
      updateMenuPosition();
    }
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, menuPlacement, filtered.length]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function setSelected(next: string[]) {
    if (!controlled) setInternal(next);
    onChange?.(multiple ? next : next[0] || "");
  }

  function toggle(option: SearchableOption) {
    if (multiple) {
      const exists = selectedSet.has(String(option.value));
      const next = exists
        ? selected.filter((v) => String(v) !== String(option.value))
        : [...selected, option.value];
      setSelected(next);
      if (searchable) {
        setQuery("");
        inputRef.current?.focus();
      }
      return;
    }
    setSelected([option.value]);
    setQuery(option.label);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && filtered[activeIndex]) {
        e.preventDefault();
        toggle(filtered[activeIndex]!);
      } else if (!searchable) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && multiple && open && searchable && !query && selected.length) {
      setSelected(selected.slice(0, -1));
    }
  }

  const showEmpty = Boolean(emptyLabel) && !required;
  const menuOptions =
    showEmpty && !multiple && !(searchable && open && query.trim() && query !== summary)
      ? [{ value: "", label: emptyLabel || "None" }, ...filtered]
      : filtered;

  const inputPlaceholder = searchable
    ? placeholder
    : isSearchPlaceholder(placeholder)
      ? "Select..."
      : placeholder;

  const displayValue = open && searchable ? (query === summary ? "" : query) : multiple ? summary : query;

  const menu =
    open && mounted && menuStyle
      ? createPortal(
          <ul
            ref={menuRef}
            className={`searchable-select-menu is-portal${resolvedPlacement === "top" ? " is-top" : ""}`}
            id={listId}
            role="listbox"
            style={{
              top: menuStyle.top,
              bottom: menuStyle.bottom,
              left: menuStyle.left,
              width: menuStyle.width,
              maxHeight: menuStyle.maxHeight,
            }}
          >
            {menuOptions.length === 0 ? (
              <li className="searchable-select-empty">{searchable ? "No matches" : "No options"}</li>
            ) : (
              menuOptions.map((option, index) => {
                const active = index === activeIndex;
                const isSelected = option.value !== "" && selectedSet.has(String(option.value));
                return (
                  <li key={`${option.value}-${option.label}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`searchable-select-option${active ? " is-active" : ""}${isSelected ? " is-selected" : ""}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (option.value === "" && !multiple) {
                          setSelected([]);
                          setQuery("");
                          setOpen(false);
                          return;
                        }
                        toggle(option);
                      }}
                    >
                      <span className="searchable-select-option-label">{option.label}</span>
                      <span className="searchable-select-check" aria-hidden>
                        {isSelected ? <Check size={24} weight="light" /> : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div
      className={`searchable-select${open ? " is-open" : ""}${searchable ? "" : " is-static"}${multiple ? " is-multiple" : ""}${className ? ` ${className}` : ""}`}
      ref={rootRef}
      style={style}
    >
      {multiple
        ? selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)
        : <input type="hidden" name={name} value={selected[0] || ""} />}

      <input
        ref={inputRef}
        type="text"
        className={`searchable-select-input ${inputClassName}`}
        value={displayValue}
        disabled={disabled}
        readOnly={!searchable}
        placeholder={selected.length ? summary || inputPlaceholder : inputPlaceholder}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete={searchable ? "list" : "none"}
        autoComplete="off"
        required={required && selected.length === 0}
        onFocus={() => {
          setOpen(true);
          if (searchable) setQuery("");
        }}
        onClick={() => {
          setOpen(true);
          if (searchable) setQuery("");
        }}
        onChange={(e) => {
          if (!searchable) return;
          setQuery(e.target.value);
          setOpen(true);
          if (!multiple && selected.length) {
            setSelected([]);
          }
        }}
        onKeyDown={onKeyDown}
      />

      {menu}
    </div>
  );
}
