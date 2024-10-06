const getFeedbackCount = async (courseId, feedbackType) => {
  const kv = await Deno.openKv();
  const store = await kv.get(["feedbacks", courseId, feedbackType]);
  return store?.value ?? 0;
};

const incrementFeedbackCount = async (courseId, feedbackType) => {
  const kv = await Deno.openKv();
  const count = await getFeedbackCount(courseId, feedbackType);
  await kv.set(["feedbacks", courseId, feedbackType], count + 1);
};


const getAllCourses = async () => {
  const kv = await Deno.openKv();
  const courseEntries = await kv.list({ prefix: ["courses"] });

  const courses = [];
  for await (const entry of courseEntries) {
    courses.push(entry.value);
  }
  console.log(courses)
  return courses;
};

// Add a new course to the KV store
const addCourse = async (name) => {
  const kv = await Deno.openKv()
  console.log(name)
  name.id = crypto.randomUUID();
  // console.log(name.id)
  await kv.set(["courses", name.id], name);
};

// Get a course by its ID from the KV store
const getCourse = async (courseId) => {
  const kv = await Deno.openKv()
  const course = await kv.get(["courses", courseId]);
  return course?.value ?? {};
};

// Delete a course from the KV store
const deleteCourse = async (courseId) => {
  const kv = await Deno.openKv()
  await kv.delete(["courses", courseId]);
};

export {
  getAllCourses,
  addCourse,
  getCourse,
  deleteCourse,
  getFeedbackCount,
  incrementFeedbackCount
};

