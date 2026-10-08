// Single entry point for the view layer.
// Preact + htm: React-compatible hooks API, JSX-like templates without a build step.
export {
  html, render, h, createContext,
  useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, useContext, useReducer,
} from "./preact-htm.js";

export const cx = (...xs) => xs.flat().filter(Boolean).join(" ");
