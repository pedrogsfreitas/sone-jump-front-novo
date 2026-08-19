import { apiRequest } from "../api";

const mentors_endpoints = {
  list: "/api/mentors",
};

export type Mentor = {
  userId: number;
  name: string;
  avatarColor: string;
  headline: string | null;
  companyName: string | null;
  specialties: string[];
  rating: number;
  sessionsCount: number;
  hourlyPriceCents: number | null;
  currency: string;
};

// ratingAvg is a Prisma Decimal — serializes to JSON as a string.
type RawMentor = Omit<Mentor, "rating"> & { rating: number | string };
function normalize(m: RawMentor): Mentor {
  return { ...m, rating: Number(m.rating) };
}

export async function getMentors() {
  const mentors = await apiRequest<RawMentor[]>(mentors_endpoints.list);
  return mentors.map(normalize);
}
