import type { MomentType } from "./types";

export interface ClassifiedMoment {
  type: MomentType | "none";
  country?: string;
  city?: string;
  nights?: number;
  confidence: number;
}

export function classifyTitle(title: string): ClassifiedMoment {
  const t = title.toLowerCase();

  // Prompt injection protection: ignore suspicious prompt injection patterns
  if (t.includes("ignore previous") || t.includes("system prompt") || t.includes("transfer")) {
    return { type: "none", confidence: 0 };
  }

  // Trips
  if (t.includes("vlucht") || t.includes("flight") || t.includes("vol") || t.includes("vacation") || t.includes("trip")) {
    let country = "PT";
    let city = "Lisbon";
    if (t.includes("lissabon") || t.includes("lisbon")) {
      country = "PT";
      city = "Lisbon";
    } else if (t.includes("rome") || t.includes("italy")) {
      country = "IT";
      city = "Rome";
    } else if (t.includes("tokyo") || t.includes("japan")) {
      country = "JP";
      city = "Tokyo";
    } else if (t.includes("london") || t.includes("uk")) {
      country = "GB";
      city = "London";
    }
    return {
      type: "trip_abroad",
      country,
      city,
      nights: 7,
      confidence: 0.95,
    };
  }

  // Moving
  if (t.includes("verhuis") || t.includes("move") || t.includes("déménag") || t.includes("appartement") || t.includes("keuken") || t.includes("renovat")) {
    return {
      type: "moving",
      city: "Leuven",
      confidence: 0.90,
    };
  }

  // Weddings
  if (t.includes("trouw") || t.includes("wedding") || t.includes("mariage") || t.includes("huwelijk")) {
    return {
      type: "wedding_guest",
      city: "Ghent",
      confidence: 0.90,
    };
  }

  return { type: "none", confidence: 0 };
}
