/**
 * Contact identity for outbound requests. Wikidata / Open Food Facts ask
 * callers to identify themselves with a contact in the User-Agent. Sourced
 * from env so it isn't hardcoded in the public repo.
 */
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "hello@parakhi.in";

export const USER_AGENT = `Parakhi/0.1 (https://parakhi.in; ${CONTACT_EMAIL})`;
