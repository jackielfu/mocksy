const knex = require('./db');

const project = id => knex('projects').where({ id }).del();

const projectFeedback = id => knex('feedback').where({ project_id: id }).del();

const feedback = id => knex('feedback').where({ id }).del();

const feedbackVotes = feedback_id => knex('votes').where({ feedback_id }).del();

const projectVotes = id_project => knex('votes').where({ id_project }).del();

module.exports = {
  project,
  projectFeedback,
  feedback,
  feedbackVotes,
  projectVotes
};
