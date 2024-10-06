import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import * as feedbackController from "./feedbackController.js";

const eta = new Eta({ views: `${Deno.cwd()}/templates/` });
const app = new Hono();

// Serve the index page with feedback buttons
// app.get("/", feedbackController.showFeedbackForm);



// Course-specific routes (viewing, adding, and deleting courses)
app.get("/courses", feedbackController.showCourses);
app.post("/courses", feedbackController.addCourse);
app.get("/courses/:courseId", feedbackController.showCourse);
app.post("/courses/:courseId/delete", feedbackController.deleteCourse);

// Feedback-specific routes (showing feedback count, handling feedback post)
app.post("/courses/:courseId/feedbacks/:feedbackType", feedbackController.postCourseFeedback);
app.get("/courses/:courseId/feedbacks/:feedbackType", feedbackController.getCourseFeedback);

export default app;
