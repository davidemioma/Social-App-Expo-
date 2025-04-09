import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET from env");
    }

    // Check headers
    const svix_id = request.headers.get("svix-id");

    const svix_timestamp = request.headers.get("svix-timestamp");

    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Error occured -- no svix headers", { status: 400 });
    }

    // Get the body
    const payload = await request.json();

    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(webhookSecret);

    let event: any;

    // Verify the webhook
    try {
      const headers = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      };

      console.log("Verifying webhook with headers:", headers);
      console.log("Webhook secret exists:", !!webhookSecret);

      event = wh.verify(body, headers) as any;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      console.error("Webhook verification failed with headers:", {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });

      return new Response("Error verifying webhook", {
        status: 400,
      });
    }

    const eventType = event.type;

    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    const email = email_addresses[0].email_address;

    const fullname = `${first_name} ${last_name}`;

    if (eventType === "user.created") {
      try {
        await ctx.runMutation(api.users.createUser, {
          clerkId: id,
          email,
          fullname,
          image: image_url,
          username: email.split("@")[0],
        });
      } catch (err) {
        console.error("Error creating user:", err);

        return new Response("Error creating user", {
          status: 500,
        });
      }
    }

    if (eventType === "user.updated") {
      try {
        await ctx.runMutation(api.users.updateUser, {
          clerkId: id,
          fullname,
          image: image_url,
        });
      } catch (err) {
        console.error("Error updating user:", err);

        return new Response("Error updating user", {
          status: 500,
        });
      }
    }

    if (eventType === "user.deleted") {
      try {
        await ctx.runMutation(api.users.deleteUser, {
          clerkId: id,
        });
      } catch (err) {
        console.error("Error deleting user:", err);

        return new Response("Error deleting user", {
          status: 500,
        });
      }
    }

    return new Response("", { status: 200 });
  }),
});

export default http;
