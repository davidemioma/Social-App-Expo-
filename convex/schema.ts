import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    image: v.string(),
    followers: v.number(),
    following: v.number(),
    posts: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
  posts: defineTable({
    userId: v.id("users"),
    imageUrl: v.string(),
    storageId: v.id("_storage"), // To delete file when post is deleted
    caption: v.optional(v.string()),
    likes: v.number(),
    comments: v.number(),
  }).index("by_user_id", ["userId"]),
  likes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_post_id", ["postId"])
    .index("by_user_post_id", ["userId", "postId"]),
  comments: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    content: v.string(),
  }).index("by_post_id", ["postId"]),
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  })
    .index("by_both", ["followerId", "followingId"])
    .index("by_follower_id", ["followerId"])
    .index("by_following_id", ["followingId"]),
  notifications: defineTable({
    senderId: v.id("users"),
    recieverId: v.id("users"),
    type: v.union(v.literal("like"), v.literal("comment"), v.literal("follow")),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
  }).index("by_reciever_id", ["recieverId"]),
  bookmarks: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_user_and_post", ["userId", "postId"])
    .index("by_user_id", ["userId"])
    .index("by_post_id", ["postId"]),
});
