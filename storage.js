// Simple in-memory storage
const submissions = [];

module.exports = {
  addSubmission: (data) => {
    submissions.push(data);
    return data;
  },
  getSubmissions: () => submissions
};