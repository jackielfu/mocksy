const knex = require('./db');

const user = data => {
  return  knex('users').insert({ name: data.username, avatar: data.photos[0].value, display_name: data.displayName, github_profile: data.profileUrl });
}

const project = (data) => {
  const { name, title, appURL, githubURL, description, tags, contributors } = data;
  const userId = knex('users').where({ name }).select('id');
  knex('projects').insert({
    title,
    url: appURL,
    github: githubURL,
    text: description,
    user_id: userId
  })
    .then(() => { /* add tags to tags table? */ })
    .then(() => { /* add contributors to contributors table? */ })
    .then(() => console.log('inserted project into database'))
    .catch(error => console.log('DID NOT ADD PROJECT: ', error));
};

const feedback = (data) => {
  const { name, text, projectId, type } = data;
  const userId = knex('users').where({ name }).select('id');
  knex('feedback').insert({
    text,
    user_id: userId,
    project_id: projectId,
    type_id: type
  })
    .then(() => console.log('inserted feedback into database'))
    .catch(error => console.log('DID NOT ADD FEEDBACK: ', error));
};

const tags = (data) => {
  const { name } = data;
  knex('tags').insert({ name })
    .then(() => console.log('inserted tag into database'))
    .catch(error => console.log('DID NOT ADD TAG: ', error));
};

const reviewType = (data) => {
  const { option } = data;
  knex('review_type').insert({ option })
    .then(() => console.log('inserted reviewType into database'))
    .catch(error => console.log('DID NOT ADD REVIEWTYPE: ', error));
};

const vote = (name, feedback_id, vote) => {
  knex('votes').insert({user_id: knex('users').where({ name }).select('id'), feedback_id, vote })
    .then(() => console.log('inserted vote'))
    .catch(error => console.log('did not add vote: ', error));
}

module.exports = {
  user,
  project,
  feedback,
  tags,
  reviewType,
  vote
};
