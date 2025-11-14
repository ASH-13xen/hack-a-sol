import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Gets the currently saved home location URLs for the logged-in user.
 */
export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Return the two fields from the user's document
    return {
      mapEmbedUrl: user.homeMapEmbedUrl,
      streetViewEmbedUrl: user.homeStreetViewEmbedUrl,
    };
  },
});

/**
 * Saves or updates the home location embed URLs for the logged-in user.
 */
export const set = mutation({
  args: {
    mapEmbedUrl: v.string(),
    streetViewEmbedUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Update the user's document with the new URLs
    await ctx.db.patch(user._id, {
      homeMapEmbedUrl: args.mapEmbedUrl,
      homeStreetViewEmbedUrl: args.streetViewEmbedUrl,
    });
  },
});

/**
 * Clears the saved home location.
 */
export const clear = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Clear the URLs by setting them to undefined
    await ctx.db.patch(user._id, {
      homeMapEmbedUrl: undefined,
      homeStreetViewEmbedUrl: undefined,
    });
  },
});
