import fs from "fs";
import path from "path";

export interface Customer {
  id: string;
  household: "single" | "couple" | "family";
  ageBand: "18-29" | "30-44" | "45-64" | "65+";
  region: string;
  city: string;
  products: Record<string, boolean>;
}

export interface PastMoment {
  type: string;
  customerId: string;
  household: string;
  ageBand: string;
  region: string;
  country?: string;
  city?: string;
  nights?: number;
  totalSpent?: number;
  unexpectedCost?: number;
  extraCostsFirst3Months?: number;
  giftAmount?: number;
  forgot: string[];
}

export interface Persona {
  id: string;
  name: string;
  age: number;
  ageBand: "18-29" | "30-44" | "45-64" | "65+";
  household: "single" | "couple" | "family";
  region: string;
  city: string;
  passwordHash: string;
  products: Record<string, boolean>;
  transactions: {
    date: string;
    merchant: string;
    amount: number;
    type: string;
  }[];
}

const dataDir = path.join(process.cwd(), "data");
const templatesDir = path.join(process.cwd(), "templates");

export function getCustomers(): Customer[] {
  const filePath = path.join(dataDir, "customers.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getPastMoments(): PastMoment[] {
  const filePath = path.join(dataDir, "past_moments.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getPersonas(): Persona[] {
  const filePath = path.join(dataDir, "personas.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getTemplate(type: string): any {
  const filePath = path.join(templatesDir, `${type}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
