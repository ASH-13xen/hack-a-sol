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

<<<<<<< HEAD
  // ⭐ NEW TODO TABLE
  todos: defineTable({
    userId: v.string(),
    title: v.string(),
    date: v.string(), // yyyy-mm-dd
    time: v.string(), // hh:mm:ss
    completed: v.boolean(),
=======


  caretakers: defineTable({
    userId: v.string(),       // clerk user ID
    name: v.string(),
    relation: v.string(),
    phone: v.string(),
    email: v.string(),
    avatar: v.string(),
    available: v.boolean(),
    createdAt: v.number(),
>>>>>>> e2c9c5d0fe0ec696a8ad1a1d92bef64a48fd01c9
  }).index("by_user", ["userId"]),
});
