const xlsx = require("xlsx");
const fs = require("fs");

// Load the first Excel file (Course Code and Nature)
const workbook1 = xlsx.readFile("AG.xlsx");
const sheet1 = workbook1.Sheets[workbook1.SheetNames[1]];
const courseNatureData = xlsx.utils.sheet_to_json(sheet1);

// Load the second Excel file (Course Details)
const workbook2 = xlsx.readFile("AG.xlsx");
const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
const courseDetailsData = xlsx.utils.sheet_to_json(sheet2);

// Remove duplicates from courseNatureData based on "Course Code" and "Course Nature"
const uniqueCourseNature = [];
const seenCodes = new Set();

courseNatureData.forEach(row => {
    const courseCode = row["Course Code"];
    const courseNature = row["Course Nature"];
    
    // Check if this Course Code with Nature has already been added
    if (!seenCodes.has(courseCode)) {
        uniqueCourseNature.push({ courseCode, courseNature });
        seenCodes.add(courseCode);
    }
});

// Map "Course Nature" to "Course Name" in courseDetailsData based on "Course Code"
courseDetailsData.forEach(course => {
    const courseCode = course["course_code"];
    
    // Find the course nature for this course code
    const match = uniqueCourseNature.find(item => item.courseCode === courseCode);
    course["Course Nature"] = match ? match.courseNature : "N/A"; // Add "Course Nature" column
});

// Write updated data with "Course Nature" back to an Excel file
const newSheet = xlsx.utils.json_to_sheet(courseDetailsData);
const newWorkbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Updated Course Data");

// Save the file
xlsx.writeFile(newWorkbook, "updated_course_data.xlsx");

console.log("Updated course data with mapped Course Nature saved as 'updated_course_data.xlsx'");
