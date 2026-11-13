import { useEffect, useId, useRef, useState } from 'react';

import { Modal } from '@/components/ui/Modal';
import { Glyph } from '@/components/ui/Glyph';
import { Input } from '@/components/base/input/input';
import { Form } from '@/components/base/form/form';
import { Button } from '@/components/base/buttons/button';
import { ModalBody, ModalFooter, ModalHeader } from '@/components/application/modal-layouts/modal-layouts';
import { useT } from '@/hooks/useT';
import { useAppStore, useStoreApi } from '@/hooks/useStoreApi';

/**
 * AuthModal — the frontend DEMO auth flow (plan Part B): sign-in via a one-time
 * code (email → 6-digit OTP; "any code signs in", 000000 = failure) and a
 * create-account variant. Purely client-side; no backend. All flow/timer state is
 * local — the store only holds the resulting `auth`.
 *
 * Laid out on Untitled UI PRO's login and signup modals (inventory #31): centered brand
 * mark, the title as the dialog's heading, the form, and a stacked footer with the
 * primary action. The Cancel link is gone: the shared close button and Escape close it.
 */
export function AuthModal() {
  const storeApi = useStoreApi();
  const authView = useAppStore((s) => s.authView);
  const closeAuth = useAppStore((s) => s.closeAuth);
  const signIn = useAppStore((s) => s.signIn);
  const createAccount = useAppStore((s) => s.createAccount);
  const brand = useAppStore((s) => s.config?.brand.name ?? 'Ichava');

  if (authView === 'create') return <CreateAccount brand={brand} onClose={closeAuth} onCreate={createAccount} />;
  if (authView === 'signin') return <SignIn brand={brand} onClose={closeAuth} onSignIn={signIn} onCreate={() => storeApi.getState().openAuth('create')} />;
  return null;
}

function Logo({ brand }: { brand: string }) {
  return (
    <div className="w-10 h-10 rounded-[10px] bg-[var(--accent)] flex items-center justify-center shadow-[var(--shadow-elevated)]" title={brand}>
      <Glyph name="layers" size={24} color="var(--accent-fg)" />
    </div>
  );
}

function SignIn({ brand, onClose, onSignIn, onCreate }: { brand: string; onClose: () => void; onSignIn: (email: string, code: string) => boolean; onCreate: () => void }) {
  const reason = useAppStore((s) => s.authReason);
  const t = useT();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [resend, setResend] = useState(0);
  const [err, setErr] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const emailFormId = useId();

  useEffect(() => {
    if (step !== 'code' || resend <= 0) return;
    const timer = setInterval(() => setResend((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(timer);
  }, [step, resend]);

  const sendCode = () => {
    if (!/.+@.+\..+/.test(email)) return;
    setStep('code');
    setResend(21);
    setTimeout(() => boxes.current[0]?.focus(), 30);
  };
  const setDigit = (i: number, v: string) => {
    const c = v.replace(/\D/g, '').slice(-1);
    setErr(false);
    setDigits((d) => d.map((x, j) => (j === i ? c : x)));
    if (c && i < 5) boxes.current[i + 1]?.focus();
  };
  const onDigitKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
  };
  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length) {
      e.preventDefault();
      setDigits((d) => d.map((_, j) => pasted[j] ?? ''));
      boxes.current[Math.min(5, pasted.length)]?.focus();
    }
  };
  const verify = () => {
    const code = digits.join('');
    if (code.length < 6) return;
    if (!onSignIn(email, code)) {
      setErr(true);
      setDigits(['', '', '', '', '', '']);
      boxes.current[0]?.focus();
    }
  };

  return (
    <Modal onClose={onClose} width={400} label={t('common.signIn')}>
      {step === 'email' ? (
        <>
          <ModalHeader
            align="center"
            icon={<Logo brand={brand} />}
            title={t('auth.signInTo', { brand })}
            description={<>{reason ? <><b>{reason}</b> {t('auth.needsAccount')} </> : null}{t('auth.emailCode')}</>}
          />
          {/*
           * A real form, so Enter submits natively. The previous
           * `onKeyDown={e.key === 'Enter' && sendCode()}` reimplemented what the
           * platform already does, and only on this one field -- a form also gives
           * password managers something to recognise and mobile keyboards a "Go" key.
           * The submit button sits in the footer and joins the form through `form=`.
           */}
          <ModalBody>
            <Form id={emailFormId} onSubmit={(e) => { e.preventDefault(); sendCode(); }} className="flex flex-col gap-4">
              <Input
                autoFocus
                isRequired
                type="email"
                value={email}
                onChange={setEmail}
                placeholder={t('auth.emailPlaceholder')}
                aria-label={t('auth.emailPlaceholder')}
              />
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" form={emailFormId} color="primary" size="md">{t('auth.sendCode')}</Button>
            <div className="flex items-center justify-center gap-1 text-sm text-tertiary">
              {t('auth.newHere')}
              <Button color="link-color" size="md" onClick={onCreate}>{t('auth.createAccount')}</Button>
            </div>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalHeader
            align="center"
            icon={<Logo brand={brand} />}
            title={t('auth.enterCode')}
            description={<>{t('auth.sentTo')} <b className="text-primary">{email}</b><span className="mt-1 block text-xs text-[var(--muted-fg)]">{t('auth.demoHint')}</span></>}
          />
          <ModalBody className="items-center">
            <div className="flex gap-2" onPaste={onPaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { boxes.current[i] = el; }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onDigitKey(i, e)}
                  inputMode="numeric"
                  aria-label={t('auth.digit', { n: i + 1 })}
                  aria-invalid={err || undefined}
                  className={`h-14 w-12 rounded-lg bg-primary text-center text-2xl font-semibold text-primary shadow-xs ring-1 ring-inset outline-focus-ring focus:ring-2 focus:ring-brand ${err ? 'ring-error_subtle' : 'ring-primary'}`}
                />
              ))}
            </div>
            {err && <div role="alert" className="text-sm text-error-primary">{t('auth.codeFailed')}</div>}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" size="md" onClick={verify}>{t('auth.verify')}</Button>
            <div className="flex items-center justify-center gap-4 text-sm text-tertiary">
              <Button color="link-color" size="md" onClick={() => setStep('email')}>{t('auth.changeEmail')}</Button>
              <span>{resend > 0 ? t('auth.resendIn', { n: resend }) : <Button color="link-color" size="md" onClick={() => setResend(21)}>{t('auth.resendCode')}</Button>}</span>
            </div>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}

function CreateAccount({ brand, onClose, onCreate }: { brand: string; onClose: () => void; onCreate: (p: { first: string; last: string; email: string }) => void }) {
  const storeApi = useStoreApi();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const t = useT();
  const valid = first.trim() && /.+@.+\..+/.test(email) && pw.length >= 8;
  const createFormId = useId();

  return (
    <Modal onClose={onClose} width={400} label={t('auth.createAccount')}>
      <ModalHeader align="center" icon={<Logo brand={brand} />} title={t('auth.createTitle')} description={t('auth.createBlurb')} />
      <ModalBody>
        <Form id={createFormId} onSubmit={(e) => { e.preventDefault(); if (valid) onCreate({ first, last, email }); }} className="flex flex-col gap-4">
          <div className="flex w-full gap-3">
            <Input autoFocus isRequired value={first} onChange={setFirst} placeholder={t('auth.firstName')} aria-label={t('auth.firstName')} />
            <Input value={last} onChange={setLast} placeholder={t('auth.lastName')} aria-label={t('auth.lastName')} />
          </div>
          <Input isRequired type="email" value={email} onChange={setEmail} placeholder={t('auth.emailPlaceholder')} aria-label={t('auth.emailPlaceholder')} />
          {/*
           * `type="password"` brings the design system's own visibility toggle, which
           * replaces the hand-rolled show/hide button and its `show` state. Its label is
           * passed through because the built-in default is hardcoded English.
           */}
          <Input
            isRequired
            type="password"
            value={pw}
            onChange={setPw}
            placeholder={t('auth.passwordPlaceholder')}
            aria-label={t('auth.passwordPlaceholder')}
            passwordToggleLabel={t('auth.togglePassword')}
          />
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button type="submit" form={createFormId} color="primary" size="md" isDisabled={!valid}>{t('auth.createAccount')}</Button>
        <div className="flex items-center justify-center gap-1 text-sm text-tertiary">
          {t('auth.haveAccount')}
          <Button color="link-color" size="md" onClick={() => storeApi.getState().openAuth('signin')}>{t('common.signIn')}</Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
