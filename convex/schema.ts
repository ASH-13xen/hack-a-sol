import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]), // --- Table for Recognized People (Memory Storage) ---
  recognized_people: defineTable({
    patient_id: v.string(),
    full_name: v.string(),
    relationship: v.string(),
    face_image_urls: v.array(v.string()),
    face_embedding: v.array(v.float64()),

    // --- NEW FIELD ---
    // This will store notes, memories, or context.
    description: v.optional(v.string()),

    last_interaction_date: v.optional(v.string()),
  }).index("by_patient_id", ["patient_id"]),
});
