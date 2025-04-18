import { v } from "convex/values";
import { mutation, MutationCtx, QueryCtx, query } from "./_generated/server";

export const getAuthUser = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorised");
  }

  // Get current user
  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!currentUser) {
    throw new Error("User not found");
  }

  return currentUser;
};

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) return;

    // Create User
    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: args.username,
      fullname: args.fullname,
      email: args.email,
      bio: args.bio,
      image: args.image,
      followers: 0,
      following: 0,
      posts: 0,
    });
  },
});

export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.optional(v.string()),
    fullname: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
    followers: v.optional(v.number()),
    following: v.optional(v.number()),
    posts: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Update User
    await ctx.db.patch(existingUser._id, {
      username: args.username,
      fullname: args.fullname,
      bio: args.bio,
      image: args.image,
      followers: args.followers,
      following: args.following,
      posts: args.posts,
    });
  },
});

export const deleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Delete User
    await ctx.db.delete(existingUser._id);
  },
});

export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});

export const updateProfile = mutation({
  args: {
    fullname: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    await ctx.db.patch(currentUser._id, {
      fullname: args.fullname,
      bio: args.bio,
    });
  },
});

export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found!");
    }

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", user._id)
      )
      .first();

    return {
      ...user,
      isFollowing: !!follow,
    };
  },
});
