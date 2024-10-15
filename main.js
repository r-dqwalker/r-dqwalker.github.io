let csv = new XMLHttpRequest();
csv.open("GET", "data.csv?20240414", true);
csv.send();

let csvArray = []
let inputArray = []
const rareArray = ['とても', 'よく', 'ときどき', 'あまり', 'めったに', 'メタル']
const tableArray1 = ['名前', 'サイズ', '頻度', '系統']
const tableArray2 = ['name', 'size', 'rareName', 'etcName']
const colorArray = ['#d6ffd6', '#d6ffff', '#d6d6ff', '#ffd6ff', '#ffd6d6', '#cccccc']
let open = 0

csv.onload = function () {
  if (csv.status === 200) {
    let csvText = csv.responseText
    let lines = csvText.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      let cells = lines[i].split(',');
      csvArray.push(cells);
    }
  } else {
    console.log("CSVファイルの読み込みに失敗しました。");
  }
}

csv.onerror = function () {
  console.log("CSVファイルの読み込みに失敗しました。");
}

document.addEventListener('DOMContentLoaded', function () {
  const display = []
  for (let i = 0; i < 12; i++) {
    display.push('未入力');
  }
  document.getElementById('display_input').innerHTML = display.join('<br>')
});

window.onload = function () {
  document.getElementById('textarea_input').addEventListener('keydown', function () {
    if (event.keyCode == 13) {
      const text = document.getElementById('textarea_input').value.split(/\r?\n/);
      if (text.length > 11) {
        event.preventDefault();
      }
    }
  });
  document.getElementById('menu1').addEventListener('click', function () {
    if (open === 0) {
      document.getElementById('menu_open1').style.display = 'block';
      open++;
    } else {
      document.getElementById('menu_open1').style.display = 'none';
      open = 0
    }
  });
  document.getElementById('menu2').addEventListener('click', function () {
    if (open === 0) {
      document.getElementById('menu_open2').style.display = 'block';
      open++;
    } else {
      document.getElementById('menu_open2').style.display = 'none';
      open = 0
    }
  });
}

function input(elem) {
  const val = elem.value.split(/\r?\n/);
  inputArray = []
  const display = []
  for (let i = 0; i < 12; i++) {
    if (i < val.length) {
      if (val[i] === '') {
        inputArray[i] = -1
        display.push('未入力');
      } else {
        const index = matchID(val[i]);
        if (index === -1) {
          inputArray[i] = -1
          display.push('該当なし');
        } else {
          inputArray[i] = index
          display.push(`${csvArray[index][1]}(${csvArray[index][3]})`);
        }
      }
    } else {
      display.push('未入力');
    }
  }
  document.getElementById('display_input').innerHTML = display.join('<br>')
}

function matchID(input) {
  let index = -1
  let i = 0
  for (const array of csvArray) {
    if (array[0] === input || array[1] === input) {
      index = i
      return index
    }
    if (array[1].startsWith(input) || array[2].startsWith(input)) {
      index = i
      return index
    }
    i++;
  }
  return index
}

function reset() {
  const mapname = document.getElementById('input_mapname')
  mapname.value = ''
  const textarea = document.getElementById('textarea_input')
  textarea.value = ''
  input(textarea);
  const container = document.getElementById('table_result');
  if (container.hasChildNodes()) {
    container.removeChild(container.firstChild);
  }
  const container_score = document.getElementById('container_score');
  if (container_score.hasChildNodes()) {
    while (container_score.firstChild) {
      container_score.removeChild(container_score.firstChild);
    }
  }
}

function result() {
  let resultArray = []
  for (const array of inputArray) {
    if (array === -1) continue;
    resultArray.push({
      name: csvArray[array][1],
      size: csvArray[array][3],
      rare: parseInt(csvArray[array][4]),
      rareName: rareArray[csvArray[array][4] - 1],
      etcName: csvArray[array][5]
    });
  }
  resultArray.sort((a, b) => a.rare - b.rare);

  const score = check(resultArray);
  const text = label(score[0])
  let mob = []
  if (score[1] !== -1) {
    for (const array of score[1]) {
      mob.push(array.name);
    }
  }

  const container = document.getElementById('table_result');
  if (container.hasChildNodes()) {
    container.removeChild(container.firstChild);
  }
  const table = document.createElement('table');
  container.appendChild(table);

  if (resultArray.length > 0) {
    let newRow = table.insertRow();
    for (const p of tableArray1) {
      let cell = newRow.insertCell();
      cell.innerHTML = p
    }

    for (const i of resultArray) {
      let newRow = table.insertRow();
      newRow.style.backgroundColor = colorArray[i.rare - 1];
      for (const p of tableArray2) {
        let cell = newRow.insertCell();
        for (const array of mob) {
          if (i[p] === array) {
            cell.style.color = '#ff0000'
            cell.style.fontWeight = 'bold'
          }
        }
        cell.innerHTML = i[p]
      }
    }
  }

  const container_score = document.getElementById('container_score');
  if (container_score.hasChildNodes()) {
    while (container_score.firstChild) {
      container_score.removeChild(container_score.firstChild);
    }
  }
  const div1 = document.createElement('div');
  container_score.appendChild(div1);
  div1.style.fontWeight = 'bold'
  div1.style.textDecoration = "underline"
  div1.innerHTML = document.getElementById('input_mapname').value

  const div_score = document.createElement('div');
  const span_score = document.createElement('span');
  for (const array of mob) {
    const span_temp_score = document.createElement('span');
    span_temp_score.style.color = '#ff0000'
    span_temp_score.style.fontWeight = 'bold'
    span_temp_score.textContent = array
    span_score.appendChild(span_temp_score);
    span_score.appendChild(document.createElement('span')).textContent = `、`;
  }
  if (span_score.hasChildNodes()) {
    span_score.removeChild(span_score.lastChild);
  }
  for (const array of text) {
    if (array === `mob`) {
      div_score.appendChild(span_score);
    } else {
      div_score.appendChild(document.createTextNode(array));
    }
  }
  container_score.appendChild(div_score);

  document.getElementById('scroll').scrollIntoView({ behavior: "smooth", block: "start" });
}

function check(result) {
  let score = [0, -1]
  const lengthTest = [4, 3, 2, 1, 1, 1]
  const length = []
  for (let i = 1; i <= 6; i++) {
    length.push(result.filter(e => e.rare === i).length);
  }
  const size = [
    result.filter(e => e.rare === 1).filter(e => e.size === '1.0倍'),
    result.filter(e => e.rare === 2).filter(e => e.size === '1.0倍'),
    result.filter(e => e.rare === 3).filter(e => e.size === '1.0倍'),
    result.filter(e => e.rare >= 4).filter(e => e.size === '1.0倍')
  ]

  if (JSON.stringify(lengthTest) === JSON.stringify(length) && result.filter((e, i, arr) => { return arr.findIndex(({ name }) => name === e.name) !== i }).length === 0) {
    if (size[0].length > 1) {
      score[0] = 1
    }
    if (size[0].length === 1) {
      if (size[1].length === 0) {
        score[0] = 2
        score[1] = size[0]
      } else {
        score[0] = 1
      }
    }
    if (size[0].length === 0) {
      if (size[1].length > 1) {
        score[0] = 2
        score[1] = size[1]
      }
      if (size[1].length === 1) {
        score[0] = 2
        score[1] = size[1]
      }
      if (size[1].length === 0) {
        if (size[2].length > 1) {
          score[0] = 2
          score[1] = size[2]
        }
        if (size[2].length === 1) {
          score[0] = 2
          score[1] = size[2]
        }
        if (size[2].length === 0) {
          score[0] = 3
        }
      }
    }
  } else {
    return score
  }
  return score
}

function label(result) {
  const scoreArray = [
    [`鑑定不可。入力を確認してください`],
    [`大量発生の特徴はありません`],
    [`mob`, `が大量発生`],
    [`４匹編成減少パターン（とても～ときどき枠に等倍がいない）`]
  ]
  return scoreArray[result]
}