import * as feedbacks from "./feedbackService.js";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";

const eta = new Eta({ views: `${Deno.cwd()}/templates/` });

// Feedback-related controllers (remain unchanged)
// const getFeedback = async (c) => {
//   const id = c.req.param("id");
//   const feedbackCount = await feedbacks.getFeedbackCount(id);
//   return c.text(`Feedback ${id}: ${feedbackCount}`);
// };

// const postFeedback = async (c) => {
//   const id = c.req.param("id");
//   await feedbacks.incrementFeedbackCount(id);
//   return c.redirect("/");
// };

const getCourseFeedback = async (c) => {
  const courseId = c.req.param("courseId");
  const feedbackType = c.req.param("feedbackType");

  const feedbackCount = await feedbacks.getFeedbackCount(courseId, feedbackType);

  return c.text(`Feedback ${feedbackType}: ${feedbackCount}`);
};

const postCourseFeedback = async (c) => {
  const courseId = c.req.param("courseId");
  const feedbackType = c.req.param("feedbackType");

  // Increment feedback count for the specific course and feedback type
  await feedbacks.incrementFeedbackCount(courseId, feedbackType);

  return c.redirect(`/courses/${courseId}`);
};

const showFeedbackForm = async (c) => {
  const html = await eta.render("index.eta");
  return c.html(html);
};

const showCourses = async (c) => {
  return c.html(
    eta.render("courses.eta", { courses: await feedbacks.getAllCourses() }),
  );
};
  
  const addCourse = async (c) => {
    const body = await c.req.parseBody();
    console.log(body)
    await feedbacks.addCourse(body);
    return c.redirect("/courses");
  };
  

  // const createTodo = async (c) => {
  //   const body = await c.req.parseBody();
  //   await todoService.createTodo(body);
  //   return c.redirect("/todos");
  // };


  const showCourse = async (c) => {
    const courseId = c.req.param("courseId");
    
    let course = await feedbacks.getCourse(courseId);
    const feedbackCounts = [];
    for (let i = 1; i <= 5; i++) {
      feedbackCounts[i] = await feedbacks.getFeedbackCount(courseId, i.toString());
    }
    // course = course.value
    // console.log(course)
  
    const html = await eta.render("course.eta", { course,  feedbackCounts});
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