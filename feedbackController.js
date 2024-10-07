import * as feedbacks from "./feedbackService.js";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getSignedCookie, setSignedCookie } from "https://deno.land/x/hono@v3.12.11/helper.ts";

// Define Zod schema for course name validation
const courseNameSchema = z.string().min(4, {
  message: "The course name should be a string of at least 4 characters.",
});

const eta = new Eta({ views: `${Deno.cwd()}/templates/` });
const secret = "secret";


const getCourseFeedback = async (c) => {
  const courseId = c.req.param("courseId");
  const feedbackType = c.req.param("feedbackType");

  const feedbackCount = await feedbacks.getFeedbackCount(courseId, feedbackType);

  return c.text(`Feedback ${feedbackType}: ${feedbackCount}`);
};

const postCourseFeedback = async (c) => {
  const courseId = c.req.param("courseId");
  const feedbackType = c.req.param("feedbackType");
  const userId = await getSignedCookie(c, secret, "userId") ?? crypto.randomUUID();
  await setSignedCookie(c, "userId", userId, secret, { path: "/" });

  // Get the courses the user has already provided feedback for from the cookie
  let feedbackGivenCourses = JSON.parse(await getSignedCookie(c, secret, "feedbackGivenCourses") || "[]");

  if (feedbackGivenCourses.includes(courseId)) {
    return c.redirect(`/courses/${courseId}?alreadyGiven=true`);
  }

  // Increment feedback count for the specific course and feedback type
  await feedbacks.incrementFeedbackCount(courseId, feedbackType);

  // Update the cookie to include the current courseId
  feedbackGivenCourses.push(courseId);
  await setSignedCookie(c, "feedbackGivenCourses", JSON.stringify(feedbackGivenCourses), secret, { path: "/" });

  return c.redirect(`/courses/${courseId}`);
};


const showFeedbackForm = async (c) => {
  const html = await eta.render("index.eta");
  return c.html(html);
};

const showCourses = async (c) => {
  const courses = await feedbacks.getAllCourses();
  return c.html(
    eta.render("courses.eta", { courses })
  );
};

  
const addCourse = async (c) => {
    const body = await c.req.parseBody();
    const validationResult = courseNameSchema.safeParse(body.name);
    const courses = await feedbacks.getAllCourses();
    if (!validationResult.success) {
      return c.html(
        eta.render("courses.eta", { ...body,
          courses,
          errors: validationResult.error.format(), })
      );
    }
    await feedbacks.addCourse(body);
    return c.redirect("/courses");
  };
  

 

const showCourse = async (c) => {
    const courseId = c.req.param("courseId");
    
    let course = await feedbacks.getCourse(courseId);
    const feedbackCounts = [];
    for (let i = 1; i <= 5; i++) {
      feedbackCounts[i] = await feedbacks.getFeedbackCount(courseId, i.toString());
    }

    const userId = await getSignedCookie(c, secret, "userId") ?? crypto.randomUUID();
    const feedbackGivenCourses = JSON.parse(await getSignedCookie(c, secret, "feedbackGivenCourses") || "[]");
  
    const hasGivenFeedback = feedbackGivenCourses.includes(courseId);
  
    const html = await eta.render("course.eta", 
                                    { course,  
                                    feedbackCounts,
                                    hasGivenFeedback});

    return c.html(html);
  };
  
const deleteCourse = async (c) => {
    const courseId = c.req.param("courseId");

    console.log(courseId)

    await feedbacks.deleteCourse(courseId);
    return c.redirect("/courses");
  };
  
export {
    getCourseFeedback,
    postCourseFeedback,
    showFeedbackForm,
    showCourses,
    addCourse,
    showCourse,
    deleteCourse,
  };