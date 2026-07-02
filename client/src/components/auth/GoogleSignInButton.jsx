import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let googleScriptPromise;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

      if (existingScript) {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
};

export default function GoogleSignInButton({
  onCredential,
  disabled = false,
  text = "signin_with",
}) {
  const buttonRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const configError = clientId ? "" : "Google sign-in needs VITE_GOOGLE_CLIENT_ID in the client env.";
  const [error, setError] = useState("");

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let isMounted = true;

    if (!clientId) {
      return undefined;
    }

    loadGoogleScript()
      .then(() => {
        if (!isMounted || !buttonRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => callbackRef.current?.(response.credential),
        });

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text,
          width: buttonRef.current.offsetWidth || 320,
        });
      })
      .catch(() => {
        if (isMounted) {
          setError("Google sign-in could not be loaded.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, text]);

  return (
    <div>
      <div
        ref={buttonRef}
        style={{
          minHeight: 44,
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      />
      {(configError || error) && (
        <p style={{ marginTop: 8, fontSize: "0.78rem", color: "#b91c1c", lineHeight: 1.5 }}>
          {configError || error}
        </p>
      )}
    </div>
  );
}
