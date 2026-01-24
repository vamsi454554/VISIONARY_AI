import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  documents: defineTable({
    userId: v.id("users"),
    originalText: v.string(),
    summarizedText: v.string(),
    brailleText: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  
  feedback: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
    wasHelpful: v.boolean(),
    comments: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_document", ["documentId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
