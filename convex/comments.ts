import { v } from "convex/values";
import { getAuthUser } from "./users";
import { mutation, query } from "./_generated/server";

export const getComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    // Get posts
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();

    if (comments.length < 1) return [];

    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.userId);

        return {
          ...comment,
          author: {
            _id: author?._id,
            username: author?.username,
            fullname: author?.fullname,
            image: author?.image,
          },
        };
      })
    );

    return formattedComments;
  },
});

export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    // Check if post exists
    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error("Post not found");
    }

    // Create comment
    const commentId = await ctx.db.insert("comments", {
      postId: post._id,
      userId: currentUser._id,
      content: args.content,
    });

    // update post info
    await ctx.db.patch(post._id, {
      comments: post.comments + 1,
    });

    // Send notification if post is not yours
    if (post.userId !== currentUser._id) {
      await ctx.db.insert("notifications", {
        postId: post._id,
        senderId: currentUser._id,
        recieverId: post.userId,
        type: "comment",
        commentId,
      });
    }

    return commentId;
  },
});
