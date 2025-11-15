// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    homeMapEmbedUrl: v.optional(v.string()),
    homeStreetViewEmbedUrl: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

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

  todos: defineTable({
    userId: v.string(),
    title: v.string(),
    date: v.string(),
    time: v.string(),
    completed: v.boolean(),
  }).index("by_user", ["userId"]),

  caretakers: defineTable({
    userId: v.string(),
    name: v.string(),
    relation: v.string(),
    phone: v.string(),
    email: v.string(),
    avatar: v.string(),
    available: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  voice_logs: defineTable({
    userId: v.string(),
    text: v.string(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  // ⭐ NEW: Store FULL DAILY LOGS
  daily_logs: defineTable({
    userId: v.string(),
    date: v.string(), // yyyy-mm-dd
    logs: v.array(v.string()), // list of text logs
    createdAt: v.number(),
  }).index("by_user_date", ["userId", "date"]),
});
