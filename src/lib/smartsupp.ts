/**
 * Smartsupp live chat bridge.
 *
 * The chat widget script itself is loaded in index.html (Vite) and
 * app/layout.tsx (Next.js). This module only talks to the widget's JavaScript
 * API so the site can enrich visitor data (visitor identification) for the
 * support team.
 *
 * Every call is a safe no-op when the widget is not loaded (SSR, ad blockers,
 * or the loader has not finished), so nothing here can break the site.
 */

declare global {
  interface Window {
    _smartsupp?: Record<string, unknown>;
    smartsupp?: ((method: string, ...args: unknown[]) => void) & { _: unknown[] };
  }
}

/** Send a command to the Smartsupp widget when it is loaded. */
export function smartsuppCommand(method: string, ...args: unknown[]): void {
  if (typeof window === "undefined") return;
  const api = window.smartsupp;
  if (typeof api !== "function") return;
  try {
    api(method, ...args);
  } catch {
    // Widget not ready yet — ignore silently.
  }
}

export interface VisitorIdentity {
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Visitor identification — the name, email and phone appear in the Smartsupp
 * dashboard's visitor info panel while chatting.
 * https://docs.smartsupp.com/chat-box/visitor-identification/
 */
export function identifyVisitor(identity: VisitorIdentity): void {
  if (identity.name) smartsuppCommand("name", identity.name);
  if (identity.email) smartsuppCommand("email", identity.email);
  if (identity.phone) smartsuppCommand("phone", identity.phone);
}

/**
 * Attach custom key/value data shown in the agent's customer info panel
 * under the visitor's browsing history.
 */
export function setVisitorVariables(variables: Record<string, string | number>): void {
  smartsuppCommand("variables", variables);
}

/**
 * Share a form submission with the chat team: the visitor becomes known by
 * name/email/phone and the submission type is listed as a custom variable.
 * Called right after a successful submit so the conversation starts with
 * full context.
 */
export function identifyVisitorFromForm(form: VisitorIdentity & { formType?: string }): void {
  identifyVisitor(form);
  if (form.formType) setVisitorVariables({ Form_Submitted: form.formType });
}
