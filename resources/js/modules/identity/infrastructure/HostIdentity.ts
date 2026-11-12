import type { IdentityProvider, IdentityUser } from '../application/IdentityProvider';

/** The host's user as icon-browser presents it (`UserData`): never an email or a token. */
export interface HostUserData {
  id: string;
  name: string;
  avatarUrl: string | null;
  abilities: Readonly<Record<string, boolean>>;
}

/** The host's own sign-in and sign-out routes. */
export interface HostAccountLinks {
  login: string | null;
  logout: string | null;
}

export interface HostIdentityOptions {
  /** Go to a URL. Defaults to `window.location.assign`. */
  navigate?: (url: string) => void;
  /**
   * Sign out at the host. Laravel's logout route takes a POST with the CSRF token, so the
   * default posts with the `XSRF-TOKEN` cookie as `X-XSRF-TOKEN` and resolves to where
   * the host sent the browser afterwards.
   */
  logout?: (url: string) => Promise<string | null>;
}

/** Up to two initials from a display name: "Ada Lovelace" -> "AL", "ada" -> "AD". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0] ?? '';
  const second = words.length > 1 ? (words[words.length - 1] ?? '') : first.slice(1);
  return ((first[0] ?? '') + (second[0] ?? '')).toUpperCase() || '?';
}

/** The browser's user for a host `UserData`. */
export function fromHostUser(user: HostUserData): IdentityUser {
  return {
    id: user.id,
    name: user.name,
    initials: initialsOf(user.name),
    email: '',
    plan: null,
    avatarUrl: user.avatarUrl,
    abilities: user.abilities,
  };
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const hit = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

async function postLogout(url: string): Promise<string | null> {
  const token = readCookie('XSRF-TOKEN');
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { Accept: 'text/html,application/json', 'X-Requested-With': 'XMLHttpRequest', ...(token ? { 'X-XSRF-TOKEN': token } : {}) },
  });
  return res.redirected ? res.url : null;
}

/**
 * The identity of a browser running inside a host application.
 *
 * The host signed the user in; this only reports who that is. Sign-in and account
 * creation go to the host's login page, and sign-out to its logout route. Nothing here
 * takes credentials: `signIn` always refuses, because the package never renders a login
 * of its own.
 */
export class HostIdentity implements IdentityProvider {
  readonly #user: IdentityUser | null;
  readonly #links: HostAccountLinks;
  readonly #navigate: (url: string) => void;
  readonly #logout: (url: string) => Promise<string | null>;

  constructor(user: HostUserData | null, links: HostAccountLinks, opts: HostIdentityOptions = {}) {
    this.#user = user ? fromHostUser(user) : null;
    this.#links = links;
    this.#navigate = opts.navigate ?? ((url) => window.location.assign(url));
    this.#logout = opts.logout ?? postLogout;
  }

  current(): IdentityUser | null {
    return this.#user;
  }

  signIn(): IdentityUser | null {
    return null;
  }

  createAccount(): IdentityUser {
    throw new Error('Accounts belong to the host application; the browser cannot create one.');
  }

  beginSignIn(): boolean {
    if (!this.#links.login) return false;
    this.#navigate(this.#links.login);
    return true;
  }

  signOut(): void {
    const url = this.#links.logout;
    if (!url) return;
    this.#logout(url)
      .catch(() => null)
      .then((next) => this.#navigate(next ?? this.#links.login ?? window.location.href));
  }
}
