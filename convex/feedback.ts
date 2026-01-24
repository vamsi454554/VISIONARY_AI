import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submit = mutation({
  args: {
    documentId: v.id("documents"),
    wasHelpful: v.boolean(),
    comments: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("feedback", {
      userId,
      documentId: args.documentId,
      wasHelpful: args.wasHelpful,
      comments: args.comments,
      createdAt: Date.now(),
    });
  },
});

export const getByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
  },
});
