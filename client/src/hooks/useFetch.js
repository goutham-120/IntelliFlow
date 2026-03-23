import { useCallback, useState } from "react";

export default function useFetch(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError("");
      try {
        return await asyncFn(...args);
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Request failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { run, loading, error, setError };
}
