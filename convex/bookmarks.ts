import { v } from "convex/values";
import { getAuthUser } from "./users";
import { mutation, query } from "./_generated/server";

export const getBookmarkedPosts = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    // Get posts
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .order("desc")
      .collect();

    if (bookmarks.length < 1) return [];

    const bookmarkedPosts = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const post = await ctx.db.get(bookmark.postId);

        return post;
      })
    );

    return bookmarkedPosts;
  },
});

export const toggleBookmark = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    // Check if bookmarked post
    const hasBookmarked = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    if (hasBookmarked) {
      // delete bookmark
      await ctx.db.delete(hasBookmarked._id);

      return false;
    }

    // Create like
    await ctx.db.insert("bookmarks", {
      postId: args.postId,
      userId: currentUser._id,
    });

    return true;
  },
});
