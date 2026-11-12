"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { useT } from "@/components/LocaleProvider";

type PasswordInputProps = {
  name: string;
  placeholder: string;
  autoComplete?: string;
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  id?: string;
};

export function PasswordInput({
  name,
  placeholder,
  autoComplete,
  className = "form-control form-control-solid login-input",
  onChange,
  id,
}: PasswordInputProps) {
  const t = useT();
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrap">
      <input
        id={id}
        type={visible ? "text" : "password"}
        name={name}
        className={className}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={onChange}
      />
      <button
        type="button"
        className="password-input-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
      >
        {visible ? <EyeSlash size={24} weight="light" /> : <Eye size={24} weight="light" />}
      </button>
    </div>
  );
}