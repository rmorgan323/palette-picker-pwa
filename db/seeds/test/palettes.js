const seedPalettes = [
  {
    palette_name: 'pastels',
    project_id: 1,
    color_1: '#ffe6d0',
    color_2: '#fffde3',
    color_3: '#c9e6d2',
    color_4: '#abe1fa',
    color_5: '#f9c9de'
  },
  {
    palette_name: 'bolds',
    project_id: 1,
    color_1: '#ed1c24',
    color_2: '#fff200',
    color_3: '#00aaad',
    color_4: '#25b34b',
    color_5: '#f9a01b'
  },
  {
    palette_name: 'earthyness',
    project_id: 1,
    color_1: '#fec77c',
    color_2: '#767769',
    color_3: '#737144',
    color_4: '#7895a4',
    color_5: '#5c4a56'
  },
  {
    palette_name: 'outdoors',
    project_id: 1,
    color_1: '#00bbd6',
    color_2: '#92d7e7',
    color_3: '#ffc74e',
    color_4: '#abc178',
    color_5: '#f6e8d7'
  },
  {
    palette_name: 'fruits',
    project_id: 1,
    color_1: '#fff342',
    color_2: '#a1cd43',
    color_3: '#d55b55',
    color_4: '#c4005b',
    color_5: '#88206e'
  },
]

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
  return knex('palettes').del()
    .then(() => { return knex('projects').del() })
    .then(() => { return knex('projects').returning('id').insert(seedProjects) })
    .then((project_ids) => {
      return knex('palettes').insert(
        seedPalettes.map(palette => {
          palette.project_id = project_ids[0];
          return palette;
        })
      )
    })
    .then(() => {
      console.log('Seeding palettes complete!')
    })
    .catch((error) => {
      console.log(`Error seeding data: ${error}`)
    })
};
