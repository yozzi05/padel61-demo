// Seed bookings for the demo account. New bookings made in the demo are stored in localStorage.
import { isoIn } from "../lib/date.js";

export const seedBookings = [
  { id: "b-seed-1", kind: "court", courtId: "indoor", date: isoIn(1), start: "19:00", duration: 90,
    price: 4500, paid: 4500, plan: "full", status: "upcoming", createdAt: isoIn(-2) },
  { id: "b-seed-2", kind: "training", courtId: "tent", coachId: "eva-bragar", trainingType: "individual",
    date: isoIn(4), start: "10:00", duration: 60, price: 3000, paid: 1500, plan: "half", status: "upcoming", createdAt: isoIn(-1) },
  { id: "b-seed-3", kind: "court", courtId: "indoor", date: isoIn(-1), start: "20:00", duration: 90,
    price: 4500, paid: 4500, plan: "full", status: "done", createdAt: isoIn(-6) },
  { id: "b-seed-4", kind: "court", courtId: "open", date: isoIn(-5), start: "18:00", duration: 60,
    price: 3000, paid: 3000, plan: "full", status: "done", createdAt: isoIn(-9) },
  { id: "b-seed-5", kind: "training", courtId: "indoor", coachId: "igor-smolich", trainingType: "group", groupSize: 3,
    date: isoIn(-9), start: "09:00", duration: 60, price: 4000, paid: 4000, plan: "full", status: "done", createdAt: isoIn(-15) },
];
