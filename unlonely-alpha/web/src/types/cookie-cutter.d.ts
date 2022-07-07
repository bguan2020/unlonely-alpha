/**
 * The cookie-cutter npm module does not have types available from the package or
 * DefinitelyTyped, so this is needed to make the package typed.
 *
 * Luckily cookie-cutter is super simple, but be aware that this file has to change if
 * you update the cookie-cutter package to a newer version with more/less features.
 */
declare module "cookie-cutter" {
  interface CookieOptions {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: string;
  }

  export function set(
    key: string,
    value: string | number | null,
    opts?: CookieOptions
  ): void;
  export function get(key: string): string | undefined;
}
