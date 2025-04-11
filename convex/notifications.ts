import { getAuthUser } from "./users";
import { query } from "./_generated/server";

export const getNotifications = query({
  handler: async (ctx) => {
    // Auth
    const currentUser = await getAuthUser(ctx);

    // Get notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_reciever_id", (q) => q.eq("recieverId", currentUser._id))
      .order("desc")
      .collect();

    if (notifications.length < 1) return [];

    const formatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const sender = await ctx.db.get(notification.senderId);

        let post = null;

        let comment = null;

        if (notification.postId) {
          post = await ctx.db.get(notification.postId);
        }

        if (notification.type === "comment" && notification.commentId) {
          comment = await ctx.db.get(notification.commentId);
        }

        return {
          ...notification,
          sender: {
            _id: sender?._id,
            fullname: sender?.fullname,
            username: sender?.username,
            image: sender?.image,
          },
          post,
          comment: comment?.content,
        };
      })
    );

    return formatedNotifications;
  },
});
