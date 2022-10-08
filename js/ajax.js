const ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";
const stringName = "MALASHKO_ALINA_DOODLE_JUMP";

let updatePassword;
let newInfoFromServer;
       
function read() {
//отдельно создаём набор POST-параметров запроса
    let sp = new URLSearchParams();
    sp.append("f", "READ");
    sp.append("n", stringName);
    fetch(ajaxHandlerScript, {method: "post", body: sp})
    .then(response => response.json())
    .then(data => {
        const dataItems = JSON.parse(data.result);
        newInfoFromServer = dataItems;
    })
    .catch(error => console.error(error));
}
read();

function insertUserData() {
    let sp = new URLSearchParams();
    sp.append("f", "INSERT");
    sp.append("n", stringName );
    sp.append("v", JSON.stringify(array));
    fetch(ajaxHandlerScript, {method: "post", body: sp})
    .then(response => response.json())
    .then(data => {
        data.result === "OK"?alert("Данные ушли на сервер"):alert("Строка на сервере может быть только одна");
    })
    .catch(error => console.error(error));
}

function buildTable() {
    read();
    const table = document.getElementById("table");
    newInfoFromServer.sort((a, b) => (b["score"] - a["score"]));
    newInfoFromServer.forEach((obj) => {
        if (newInfoFromServer.indexOf(obj) >= 10) {
            return;
        } else {
            let tr = document.createElement("tr");
            table.append(tr);
            let tdName = document.createElement("td");
            tr.append(tdName);
            tdName.textContent = obj["name"];
            let tdScore = document.createElement("td");
            tr.append(tdScore);
            tdScore.textContent = obj["score"];
        }
    });
}

function storeInfo() {
    //Функция, которая апдейтит значения в таблице на сервере
    updatePassword = Math.random();
    let sp = new URLSearchParams();
    sp.append("f","LOCKGET");
    sp.append("n", stringName);
    sp.append("p", updatePassword);
    fetch(ajaxHandlerScript, {method: "post", body: sp})
    .then(response => response.json())
    .then(data => {
        if (data) {
            lockGetReady();
        }
    })
    .catch(error => console.error(error));
}


function lockGetReady() {
    let newInfoToServer = newInfoFromServer;
    let sp = new URLSearchParams();
    sp.append("f",'UPDATE' );
    sp.append("n", stringName);
    sp.append("p", updatePassword);
    sp.append("v", JSON.stringify(newInfoToServer));
    fetch(ajaxHandlerScript, {method: "post", body: sp})
    .then(response => response.json())
}

function addScore() {
    const form = document.getElementById("form");
    form.style.display = "block";
    const gameOverDiv = document.getElementById("game-over-block");
    gameOverDiv.style.display = "none";
}

function sendToServer() {
    const input = document.getElementById("name");
    //Функция, которая добавит имя и результат в таблицу
    let scoreDiv = document.getElementById("score-span");
    let score = scoreDiv.textContent;
    let userScore = score;
    let userName = input.value;
    let warning = document.getElementById("warning");
    if (userName == "") {
        warning.style.display = "block";
    } else {
        let scoreObj = {name: userName, score: userScore};
        newInfoFromServer.push(scoreObj); //Заносим данные в исходный массив
        storeInfo();
        const menu = document.getElementById("menu");
        menu.style.display = "block";
        const background = document.querySelector(".blue-bg");
        background.style.display = "none";
        unlock("portrait");//выход из полноэкранного режима
    }
}