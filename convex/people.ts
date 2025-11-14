import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// --- Mutations for Storing Registered Faces ---

/**
 * 1. Generates a one-time upload URL for the client
 * to post the face scan image to.
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * 2. Saves a NEW person's data (including the new description field).
 */
export const registerPersonWithStorage = mutation({
  args: {
    patient_id: v.string(),
    full_name: v.string(),
    relationship: v.string(),
    storage_id: v.id("_storage"),
    face_embedding: v.array(v.float64()),
    // --- ADDED ---
    description: v.optional(v.string()), // Accept the new description
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.patient_id) {
      throw new Error("Not authorized.");
    }

    const personId = await ctx.db.insert("recognized_people", {
      patient_id: args.patient_id,
      full_name: args.full_name,
      relationship: args.relationship,
      face_image_urls: [args.storage_id],
      face_embedding: args.face_embedding,
      description: args.description, // Save the new description
      last_interaction_date: new Date().toISOString(), // Set current date
    });

    console.log(`New person registered with ID: ${personId}`);
    return personId;
  },
});

/**
 * 3. Query to fetch all people recognized by the current patient.
 * (Fetches the new 'description' field as well).
 */
export const getRecognizedPeople = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const patientId = identity?.subject;

    if (!patientId) {
      // Return empty array if user isn't logged in
      return [];
    }

    // Fetch all people associated with the logged-in patient
    return await ctx.db
      .query("recognized_people")
      .withIndex("by_patient_id", (q) => q.eq("patient_id", patientId))
      .collect();
  },
});

/**
 * 4. --- NEW ---
 * Mutation to update the description (notes) for an existing person.
 */
export const updatePersonDescription = mutation({
  args: {
    // We need the Convex document ID (_id) of the person to update
    personId: v.id("recognized_people"),
    newDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    // Check if this person actually exists
    const person = await ctx.db.get(args.personId);

    // Security check: Ensure the person belongs to the logged-in user
    if (!person || person.patient_id !== identity.subject) {
      throw new Error("Not authorized to update this person.");
    }

    // Update the description and the interaction date
    await ctx.db.patch(args.personId, {
      description: args.newDescription,
      last_interaction_date: new Date().toISOString(),
    });

    console.log(`Updated description for: ${person.full_name}`);
    return { success: true, updatedName: person.full_name };
  },
});
