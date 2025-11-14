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

    // 1. Fetch all people
    const people = await ctx.db
      .query("recognized_people")
      .withIndex("by_patient_id", (q) => q.eq("patient_id", patientId))
      .collect();

    // 2. --- NEW: Map over people to get a displayable URL for their image ---
    const peopleWithImageUrls = await Promise.all(
      people.map(async (person) => {
        // Get the first image (storageId) from the array
        const firstImageId = person.face_image_urls[0];
        let displayImageUrl: string | null = null;

        if (firstImageId) {
          try {
            // Get a public URL for the stored image
            displayImageUrl = await ctx.storage.getUrl(firstImageId);
          } catch (err) {
            // If file not found or storage ID is invalid, it will be null
            console.warn(`Could not get image URL for ${firstImageId}`, err);
          }
        }

        // 3. Return the person object with the new displayImageUrl field
        return {
          ...person,
          displayImageUrl: displayImageUrl,
        };
      })
    );

    return peopleWithImageUrls;
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

/**
 * 5. --- NEW ---
 * Mutation to DELETE a recognized person and their stored images.
 */
export const deletePerson = mutation({
  args: {
    personId: v.id("recognized_people"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated.");
    }

    // Security check: Ensure the person belongs to the logged-in user
    const person = await ctx.db.get(args.personId);
    if (!person || person.patient_id !== identity.subject) {
      throw new Error("Not authorized to delete this person.");
    }

    // Delete all associated images from file storage
    for (const storageId of person.face_image_urls) {
      try {
        await ctx.storage.delete(storageId);
      } catch (err) {
        // Log error but continue, so we can delete the main record
        console.warn(`Failed to delete storage file ${storageId}:`, err);
      }
    }

    // Delete the database record
    await ctx.db.delete(args.personId);

    return { success: true, deletedName: person.full_name };
  },
});
