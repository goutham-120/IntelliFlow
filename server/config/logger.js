const timestamp = () => new Date().toISOString();

const writeLog = (level, message, meta) => {
  const parts = [`[${timestamp()}]`, `[${level.toUpperCase()}]`, message];
  if (meta !== undefined) {
    parts.push(typeof meta === "string" ? meta : JSON.stringify(meta));
  }
  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](parts.join(" "));
};

export const logger = {
  info: (message, meta) => writeLog("info", message, meta),
  warn: (message, meta) => writeLog("warn", message, meta),
  error: (message, meta) => writeLog("error", message, meta),
};

export default logger;
