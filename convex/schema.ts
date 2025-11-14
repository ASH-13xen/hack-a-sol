import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // --- EXISTING FIELDS ---
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),

    // --- NEW FIELDS ---
    // Add these two lines to store the map URLs
    homeMapEmbedUrl: v.optional(v.string()),
    homeStreetViewEmbedUrl: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]), // --- This is your existing 'recognized_people' table ---

  recognized_people: defineTable({
    patient_id: v.string(),
    full_name: v.string(),
    relationship: v.string(),
    face_image_urls: v.array(v.string()),
    face_embedding: v.array(v.float64()),
    description: v.optional(v.string()),
    last_interaction_date: v.optional(v.string()),
  }).index("by_patient_id", ["patient_id"]),


    routines: defineTable({
    userId: v.string(),
    time: v.string(),
    message: v.string(),
    phone: v.string(),
  }).index("by_user", ["userId"]),

});
