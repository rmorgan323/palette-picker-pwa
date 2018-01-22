const seedProjects = [
  {
    project_name: 'Linked List'
  },
  {
    project_name: 'Swapi Box'
  },
  {
    project_name: 'Movie Tracker'
  },
]

exports.seed = function(knex, Promise) {
  return knex('projects').del()
    .then(() => {
      return Promise.all([
        knex('projects').insert(seedProjects)
        .then(() => console.log('Seeding projects complete!'))
        .catch(error => console.log(`Error seeding data: ${error}`))
      ])
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};