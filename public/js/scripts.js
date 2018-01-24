// let projects = [];

$(document).ready(() => {
  pickNewColors();
  displayProjects();
});

//////////  FETCHES //////////

const getAllProjects = async () => {
  const projects = await fetch('http://localhost:3000/api/v1/projects', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const jsonProjects = await projects.json();

  return jsonProjects;
}

const createNewProject = async (name) => {
  const projects = await fetch('http://localhost:3000/api/v1/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project_name: name
    })
  });
  const jsonProjects = await projects.json();

  return jsonProjects;
}

const getPalettesByProjectId = async (id) => {
  const palettes = await fetch(`http://localhost:3000/api/v1/palettes/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const jsonPalettes = await palettes.json();

  return jsonPalettes;
}

//////////  EVERYTHING ELSE  //////////

displayProjects = async () => {
  const projects = await getAllProjects();
  console.log(projects[0].id)
  updateDropdown(projects);
  displayTopProjectPalette(projects[0].id);
  displayProjectName(projects[0].project_name);
}

createProject = async () => {
  const name = $('.new-project-input').val()
  const projects = await createNewProject(name)
  updateDropdown(projects);
}

displayProjectName = (name) => {
  console.log(name)
  $('.project-name-span').text(name);
}

displayTopProjectPalette = async (id) => {
  const projectPalettes = await getPalettesByProjectId(id);
  displayPalettes(projectPalettes);
}

displayPalettes = (projectPalettes) => {
  projectPalettes.forEach(palette => {
    const id = palette.project_id;
    const name = palette.palette_name || 'palette name';
    const c1 = palette.color_1;
    const c2 = palette.color_2;
    const c3 = palette.color_3;
    const c4 = palette.color_4;
    const c5 = palette.color_5;

    $('.palette-block').append(`
      <div class="palette-holder" data-id="${id}">
        <h5 class="palette-name-h5"><img class="pencil" src="assets/pencil.svg"></button>${name}</h5>
        <div class="palette-colors-holder">
          <div class="palette-color-1 palette-colors" style="background-color: ${c1}"></div>
          <div class="palette-color-2 palette-colors" style="background-color: ${c2}"></div>
          <div class="palette-color-3 palette-colors" style="background-color: ${c3}"></div>
          <div class="palette-color-4 palette-colors" style="background-color: ${c4}"></div>
          <div class="palette-color-5 palette-colors" style="background-color: ${c5}"></div>
          <button class="delete-palette-button"><img class="trash" src="assets/trash.svg"</button>
        </div>
      </div>
    `)
  })
}



pickNewColors = () => {
  for(let i = 1; i <= 5; i++) {
    if ($(`.color-${i}`).attr('data-locked') === 'false') {
      const newColor = generateRandomHexCode();
      const color = newColor[0];
      const brightness = newColor[1];
      const brightnessArray = ["#000", "#fff"];

      $(`.color-${i}`).css('background-color', color);
      $(`.hex-value-${i}`).text(color).css('color', brightnessArray[brightness])
      $(`.lock-${i}`).attr('src', `assets/lock-open-${brightness}.svg`);
    }
  }
}

generateRandomHexCode = () => {
  const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  let hexCode = ['#'];
  let brightness = 0;
  for(let i = 0; i < 6; i++) {
    const randomNum = Math.floor(Math.random() * 16);
    if (i === 0 || i === 2 || i === 4) {
      brightness += randomNum
    }
    hexCode.push(chars[randomNum])
  }
  brightness <= 19 ? brightness = 1 : brightness = 0

  return [hexCode.join(''), brightness];
}

function toggleLocked() {
  if ($(this).attr('src') === 'assets/lock-open-0.svg') {
    $(this).closest('div').attr('data-locked', true);
    $(this).attr('src', 'assets/lock-0.svg');
    return
  }
  if ($(this).attr('src') === 'assets/lock-0.svg') {
    $(this).closest('div').attr('data-locked', false);
    $(this).attr('src', 'assets/lock-open-0.svg');
    return
  }
  if ($(this).attr('src') === 'assets/lock-open-1.svg') {
    $(this).closest('div').attr('data-locked', true);
    $(this).attr('src', 'assets/lock-1.svg');
    return
  }
  if ($(this).attr('src') === 'assets/lock-1.svg') {
    $(this).closest('div').attr('data-locked', false);
    $(this).attr('src', 'assets/lock-open-1.svg');
    return
  }
}

savePalette = () => {
  const color1 = $('.hex-value-1').text();
  const color2 = $('.hex-value-2').text();
  const color3 = $('.hex-value-3').text();
  const color4 = $('.hex-value-4').text();
  const color5 = $('.hex-value-5').text();

  createNewPalette()
  createPaletteInProject(color1, color2, color3, color4, color5);
}

createPaletteInProject = (hex1, hex2, hex3, hex4, hex5) => {
  $('.palette-block').append(`
    <div class="palette-holder">
      <input class="palette-name-input" placeholder="name palette"></input>
      <div class="palette-colors-holder">
        <div class="palette-color-1 palette-colors" style="background-color: ${hex1}"></div>
        <div class="palette-color-2 palette-colors" style="background-color: ${hex2}"></div>
        <div class="palette-color-3 palette-colors" style="background-color: ${hex3}"></div>
        <div class="palette-color-4 palette-colors" style="background-color: ${hex4}"></div>
        <div class="palette-color-5 palette-colors" style="background-color: ${hex5}"></div>
        <button class="delete-palette-button"><img class="trash" src="assets/trash.svg"</button>
      </div>
    </div>
  `)
}

function deletePalette() {
  $(this).closest('.palette-holder').remove();
}

function addPaletteName() {
  const name = $(this).val();
  $(this).replaceWith(`
    <h5 class="palette-name-h5"><img class="pencil" src="assets/pencil.svg"></button>${name}</h5>
  `)
}

function editPaletteName() {
  const name = $(this).closest('.palette-name-h5').text();
  console.log(name)
  const parent = $(this).closest('.palette-holder');
  $(this).closest('.palette-name-h5').replaceWith(`
    <input class="palette-name-input" placeholder="name palette" onfocus="this.setSelectionRange(this.value.length, this.value.length)" value="${name}"></input>
  `)
  parent.children('.palette-name-input').focus();
}


updateDropdown = (projects) => {
  $('.project-dropdown').children().remove();
  projects.forEach(project => {
    $('.project-dropdown').append(`
      <option class="dropdown-options" value="create-project">${project.project_name}</option>
    `)
  })
}



$('main').on('click', '.all-locks', toggleLocked);
$('article').on('click', '.generate-button', pickNewColors);
$('article').on('click', '.save-palette-button', savePalette);
$('article').on('click', '.delete-palette-button', deletePalette);
$('article').on('blur', '.palette-name-input', addPaletteName);
$('article').on('submit', '.palette-name-input', addPaletteName);
$('article').on('click', '.pencil', editPaletteName);
$('header').on('click', '.header-button', createProject);


