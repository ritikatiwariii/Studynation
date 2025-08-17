// src/utils/getCourses.js
export function getCourses(category) {
    if (Array.isArray(category?.courses) && category.courses.length > 0) {
        return category.courses;
    }
    if (Array.isArray(category?.course) && category.course.length > 0) {
        return category.course;
    }
    return [];
}
