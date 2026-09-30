// Owner: B (Backend + AI). Gemini classifier with enum-only response schema + keyword fallback.
// Input: event titles only. Output: { type: MomentType | "none", country?: ISO-2, dates }.
// Cache by normalised title. On any error use the keyword map:
//   vlucht / flight / vol → trip_abroad, verhuis / move / déménag → moving, trouw / wedding / mariage → wedding_guest
export {};
