$(document).ready(() => {
  pickNewColors();
  displayProjects();
});

//////////  FETCHES //////////

const removeProject = async (projId) => {
  const project = await fetch(`http://localhost:3000/api/v1/projects/${projId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const jsonProject = await project.json();

  return jsonProject;
}

const updatePalette = async (palId, projId, name, c1, c2, c3, c4, c5) => {
  const body = buildFetchBody(palId, projId, name, c1, c2, c3, c4, c5);
  const palette = await fetch('http://localhost:3000/api/v1/palettes', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  const jsonPalette = await palette.json();

  return jsonPalette;
}

buildFetchBody = (palId, projId, name, c1, c2, c3, c4, c5) => {
  let body = {}
  palId ? body.id = palId : null;
  projId ? body.project_id = projId : null;
  name ? body.palette_name = name : null;
  c1 ? body.color_1 = c1 : null;
  c2 ? body.color_2 = c2 : null;
  c3 ? body.color_3 = c3 : null;
  c4 ? body.color_4 = c4 : null;
  c5 ? body.color_5 = c5 : null;

  return body;
}

const createNewPalette = async (id, c1, c2, c3, c4, c5) => {
  const palette = await fetch('http://localhost:3000/api/v1/palettes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project_id: id,
      color_1: c1,
      color_2: c2,
      color_3: c3,
      color_4: c4,
      color_5: c5
    })
  })
  const jsonPalette = await palette.json();

  return jsonPalette;
}

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
  if (projects.status !== 400) {
    const jsonProjects = await projects.json();
    return jsonProjects;
  } else {
    return 'Status: 400'
  }

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

const deletePaletteByPaletteId = async (id) => {
  const palettes = await fetch(`http://localhost:3000/api/v1/palettes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const jsonPalettes = await palettes.json();

  return jsonPalettes;
}

//////////  CREATE FUNCTIONS  //////////

createProject = async () => {
  const name = $('.new-project-input').val()
  const projects = await createNewProject(name)
  if (projects === 'Status: 400') {
    $('.error-message').text('Name already taken.');
  } else {
    $('.error-message').text('');
    updateDropdown(projects);
    displayProjectName(name);
    $('.new-project-input').val('');
    clearPalettes();
  }
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

//////////  SAVE AND DELETE  //////////

savePalette = async () => {
  const color1 = $('.hex-value-1').text();
  const color2 = $('.hex-value-2').text();
  const color3 = $('.hex-value-3').text();
  const color4 = $('.hex-value-4').text();
  const color5 = $('.hex-value-5').text();
  const id = getCurrentProjectId();

  const newPalette = await createNewPalette(id, color1, color2, color3, color4, color5)
  createPaletteInProject(newPalette.project_id, newPalette.id, color1, color2, color3, color4, color5);
}


async function switchProjects() {
  const name = $(this).val();
  const id = getCurrentProjectId();
  const projectPalettes = await getPalettesByProjectId(id);

  clearPalettes();
  displayProjectName(name);
  displayPalettes(projectPalettes);
}

function deletePalette() {
  const palId = $(this).closest('.palette-holder').attr('data-palId');
  deletePaletteByPaletteId(palId);
  $(this).closest('.palette-holder').remove();
}

deleteProject = async () => {
  const id = getCurrentProjectId();
  const projectList = await getAllProjects();
  const newList = projectList.filter(project => {
    return project.id !== parseInt(id);
  })
  const newId = getCurrentProjectId();
  updateDropdown(newList);
  removeProject(id);
  if (newList.length) {
    displayProjectName(newList[0].project_name)
    displayTopProjectPalette(newList[0].id);
  } else {
    displayProjectName('');
    clearPalettes();
  }
}

//////////  DISPLAY FUNCTIONS  //////////

displayProjectName = (name) => {
  $('.project-name-span').text(name);
  $('select').val(name);
}

displayTopProjectPalette = async (id) => {
  const projectPalettes = await getPalettesByProjectId(id);
  displayPalettes(projectPalettes);
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

displayPalettes = (projectPalettes) => {
  clearPalettes();
  projectPalettes.forEach(palette => {
    const projId = palette.project_id;
    const palId = palette.id;
    const name = palette.palette_name || 'palette name';
    const c1 = palette.color_1;
    const c2 = palette.color_2;
    const c3 = palette.color_3;
    const c4 = palette.color_4;
    const c5 = palette.color_5;

    $('.palette-block').append(`
      <div class="palette-holder" data-id="${projId}" data-palId="${palId}">
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

createPaletteInProject = (projId, palId, hex1, hex2, hex3, hex4, hex5) => {
  $('.palette-block').append(`
    <div class="palette-holder" data-id="${projId}" data-palId="${palId}">
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

displayProjects = async () => {
  const projects = await getAllProjects();
  updateDropdown(projects);
  displayTopProjectPalette(projects[0].id);
  displayProjectName(projects[0].project_name);
}

function addPaletteName() {
  const name = $(this).val();
  const palId = $(this).closest('.palette-holder').attr('data-palId');
  $(this).replaceWith(`
    <h5 class="palette-name-h5"><img class="pencil" src="assets/pencil.svg"></button>${name}</h5>
  `)
  updatePalette(palId, null, name);
}

function editPaletteName() {
  const name = $(this).closest('.palette-name-h5').text();
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
      <option class="dropdown-options" data-id="${project.id}">${project.project_name}</option>
    `)
  })
}

clearPalettes = () => {
  $('.palette-holder').remove();
}

function sendToTop() {
  let colorArray = []
  for (let i = 0; i < 5; i++) {
    colorArray.push(rgb2hex($(this).parent().children()[i].style.backgroundColor))
  }
  console.log(colorArray)
  paletteToTop(colorArray);
}

paletteToTop = (colorArray) => {
  const brightnessArray = ["#000", "#fff"];
  for (let i = 0; i < 5; i++) {
    const color = colorArray[i]
    const brightness = findBrightness(colorArray[i]);
    $(`.color-${i + 1}`).css('background-color', colorArray[i]);
    $(`.hex-value-${i + 1}`).text(colorArray[i]).css('color', brightnessArray[brightness])
    $(`.lock-${i + 1}`).attr('src', `assets/lock-open-${brightness}.svg`);
  }
}

//////////  HELPERS  //////////

findBrightness = (hex) => {
  const array = hex.split('').slice(1, 7)
  const nums = array.map(val => parseInt(val, 16));
  let brightness = nums[0] + nums[2] + nums[4]
  brightness < 20 ? brightness = 1 : brightness = 0;
  return brightness;
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

getCurrentProjectId = () => {
  const id = $('select').find(':selected').attr('data-id');
  return id;
}

rgb2hex = (rgb) => {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  hex = (x) => {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

//////////  EVENT LISTENERS  //////////

$('main').on('click', '.all-locks', toggleLocked);
$('article').on('click', '.generate-button', pickNewColors);
$('article').on('click', '.save-palette-button', savePalette);
$('article').on('click', '.delete-palette-button', deletePalette);
$('article').on('blur', '.palette-name-input', addPaletteName);
$('article').on('click', '.pencil', editPaletteName);
$('header').on('click', '.header-button', createProject);
$('header').on('change', 'select', switchProjects)
$('header').on('click', '.delete-project-button', deleteProject);
$('article').on('click', '.palette-colors', sendToTop);
