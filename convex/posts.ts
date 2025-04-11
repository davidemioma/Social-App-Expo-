import { v } from "convex/values";
import { getAuthUser } from "./users";
import { mutation, query } from "./_generated/server";

export const getPosts = query({
  handler: async (ctx) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    // Get posts
    const posts = await ctx.db.query("posts").order("desc").collect();

    if (posts.length < 1) return [];

    const postsWithInfo = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.userId);

        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_post_id", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .unique();

        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        return {
          ...post,
          author: {
            _id: author?._id,
            username: author?.username,
            fullname: author?.fullname,
            image: author?.image,
          },
          hasLiked: !!like,
          hasBookmarked: !!bookmark,
        };
      })
    );

    return postsWithInfo;
  },
});

// File upload
export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorised");
  }

  return ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    const imageUrl = await ctx.storage.getUrl(args.storageId);

    if (!imageUrl) {
      throw new Error("Image not found");
    }

    // Create Post
    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      caption: args.caption,
      storageId: args.storageId,
      imageUrl,
      likes: 0,
      comments: 0,
    });

    // Update user number of posts
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});

export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    // Check if post exists
    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user has liked post
    const hasLiked = await ctx.db
      .query("likes")
      .withIndex("by_user_post_id", (q) =>
        q.eq("userId", currentUser._id).eq("postId", post._id)
      )
      .first();

    if (hasLiked) {
      // delete like
      await ctx.db.delete(hasLiked._id);

      // update post
      await ctx.db.patch(post._id, {
        likes: post.likes - 1,
      });

      return false;
    }

    // Create like
    await ctx.db.insert("likes", {
      postId: post._id,
      userId: currentUser._id,
    });

    // update post
    await ctx.db.patch(post._id, {
      likes: post.likes + 1,
    });

    // Send notification if post is not yours
    if (post.userId !== currentUser._id) {
      await ctx.db.insert("notifications", {
        postId: post._id,
        senderId: currentUser._id,
        recieverId: post.userId,
        type: "like",
      });
    }

    return true;
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    // Check if post exists
    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error("Post not found");
    }

    // check if user created the post
    if (post.userId !== currentUser._id) {
      throw new Error("Unauthorized! you can only delete your post.");
    }

    // Delete all likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post_id", (q) => q.eq("postId", post._id))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Delete notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_post_id", (q) => q.eq("postId", post._id))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // Delete all comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post_id", (q) => q.eq("postId", post._id))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete all bookmarks
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post_id", (q) => q.eq("postId", post._id))
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    // Delete image file from storage
    await ctx.storage.delete(post.storageId);

    // Delete posts
    await ctx.db.delete(post._id);

    // Update user details
    await ctx.db.patch(currentUser._id, {
      posts: Math.max(0, (currentUser.posts || 1) - 1), // to avoid negative numbers.
    });
  },
});

export const getPostsByUserId = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = args.userId
      ? await ctx.db.get(args.userId)
      : await getAuthUser(ctx);

    if (!user) {
      throw new Error("User not found!");
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .collect();

    return posts;
  },
});
