import crypto from "crypto";

import { createServiceError } from "./serviceHelpers.js";

const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);

let cachedKeys = null;
let cachedUntil = 0;

const decodeBase64Url = (value) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
};

const decodeJwtPart = (value) => JSON.parse(decodeBase64Url(value).toString("utf8"));

const getGoogleKeys = async () => {
  if (cachedKeys && cachedUntil > Date.now()) {
    return cachedKeys;
  }

  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) {
    throw createServiceError(503, "Unable to verify Google account right now");
  }

  const body = await response.json();
  cachedKeys = body.keys || [];

  const cacheControl = response.headers.get("cache-control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 300);
  cachedUntil = Date.now() + maxAge * 1000;

  return cachedKeys;
};

const getRequiredClientId = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw createServiceError(500, "Google sign-in is not configured");
  }

  return process.env.GOOGLE_CLIENT_ID;
};

export const verifyGoogleCredential = async (credential) => {
  if (!credential || typeof credential !== "string") {
    throw createServiceError(400, "Google credential is required");
  }

  const parts = credential.split(".");
  if (parts.length !== 3) {
    throw createServiceError(400, "Invalid Google credential");
  }

  let header;
  let payload;
  try {
    header = decodeJwtPart(parts[0]);
    payload = decodeJwtPart(parts[1]);
  } catch {
    throw createServiceError(400, "Invalid Google credential");
  }

  if (header.alg !== "RS256" || !header.kid) {
    throw createServiceError(400, "Unsupported Google credential");
  }

  const keys = await getGoogleKeys();
  const key = keys.find((candidate) => candidate.kid === header.kid);
  if (!key) {
    throw createServiceError(401, "Google credential could not be verified");
  }

  const publicKey = crypto.createPublicKey({ key, format: "jwk" });
  const isValidSignature = crypto.verify(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    publicKey,
    decodeBase64Url(parts[2])
  );

  if (!isValidSignature) {
    throw createServiceError(401, "Google credential could not be verified");
  }

  const now = Math.floor(Date.now() / 1000);
  const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

  if (!GOOGLE_ISSUERS.has(payload.iss)) {
    throw createServiceError(401, "Invalid Google account issuer");
  }

  if (!audience.includes(getRequiredClientId())) {
    throw createServiceError(401, "Google credential was issued for another app");
  }

  if (!payload.exp || payload.exp < now) {
    throw createServiceError(401, "Google credential has expired");
  }

  if (payload.email_verified !== true && payload.email_verified !== "true") {
    throw createServiceError(401, "Google account email is not verified");
  }

  if (!payload.email) {
    throw createServiceError(401, "Google account did not provide an email");
  }

  return {
    googleSubject: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name,
    picture: payload.picture,
  };
};
