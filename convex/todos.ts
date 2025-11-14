// convex/todos.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ⭐ Create a new todo
export const addTodo = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    date: v.string(),
    time: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("todos", {
      userId: args.userId,
      title: args.title,
      date: args.date,
      time: args.time,
      completed: false,
    });
  },
});

// ⭐ List todos for a user
export const getTodos = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// ⭐ Toggle completion
export const toggleTodo = mutation({
  args: { id: v.id("todos"), completed: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { completed: args.completed });
  },
});

// ⭐ Delete todo
export const deleteTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
