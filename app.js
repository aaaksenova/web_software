import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import * as feedbacks from "./feedbacks.js";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";

const app = new Hono();
const eta = new Eta({ views: `${Deno.cwd()}/templates/` });

// Serve the index page
app.get("/", async (c) => {
  const html = await eta.render("index.eta");
  return c.html(html);
});

// Show the feedback count
app.get("/feedbacks/:id", async (c) => {
  const id = c.req.param("id");
  const feedbackCount = await feedbacks.getFeedbackCount(id);
  return c.text(`Feedback ${id}: ${feedbackCount}`);
});

// Handle feedback POST with Redirect pattern
app.post("/feedbacks/:id", async (c) => {
  const id = c.req.param("id");
  await feedbacks.incrementFeedbackCount(id);
  // Redirect to root after submitting feedback
  return c.redirect("/");
});

export default app;
