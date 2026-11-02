import { useId, useState } from 'react';
type Props = { label: string; name: string; autoComplete: 'current-password' | 'new-password'; minLength?: number };
export function PasswordField({ label, name, autoComplete, minLength = 1 }: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return <div className="cv-password-field"><label htmlFor={id}>{label}</label><div className="cv-password">
    <input id={id} name={name} type={visible ? 'text' : 'password'} required minLength={minLength} maxLength={128} autoComplete={autoComplete} autoCapitalize="none" spellCheck={false} />
    <button className="button" type="button" aria-label={`${visible ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Ẩn' : 'Hiện'}</button>
  </div></div>;
}
