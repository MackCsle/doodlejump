const App = (function() {

    class AppView {
        constructor(container) {
            this.container = document.getElementById(container);
        }
        openForm() {
            const loginForm = document.getElementById("login-form");
            loginForm.style.display = "block";
        }
        warning() {
            const warning = document.getElementById("warning");
            warning.style.display = "block";
        }
        reminder() {
            const reminder = document.getElementById("reminder");
            reminder.style.display = "block";
        }
        rejectName() {
            const reject = document.getElementById("reject");
            reject.style.display = "block";
        }
        buildTable(obj) {
            const table = document.getElementById("table");
            const tr = document.createElement("tr");
            table.append(tr);
            const tdName = document.createElement("td");
            tr.append(tdName);
            tdName.textContent = obj["login"];
            const tdScore = document.createElement("td");
            tr.append(tdScore);
            tdScore.textContent = obj["score"];
        }
        init() {
            const background = document.querySelector(".blue-bg");
            const menu = document.getElementById("menu");
            menu.style.display = "none";
            background.style.display = "block";
        }
        showForm() {
            const form = document.getElementById("form");
            form.style.display = "block";
            const gameOverDiv = document.getElementById("game-over-block");
            gameOverDiv.style.display = "none";
        }
        toMenu() {
            const menu = document.getElementById("menu");
            menu.style.display = "block";
        }
        reject() {
            const reject = document.getElementById("reject");
            reject.style.display = "block";
        }
    }

    class AppModel {
        constructor(view) {
            this.view = view;
            this.newInfoFromServer;
            this.updatePassword;
            this.ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";
            this.stringName = "MALASHKO_TEST_TEST_TEST";
            this.array = [{login: "Alina", password: "testpassword", score: 185}];
        }
        insertNewData() {
            let sp = new URLSearchParams();
            sp.append("f", "INSERT");
            sp.append("n", this.stringName );
            sp.append("v", JSON.stringify(this.array));
            fetch(this.ajaxHandlerScript, {method: "post", body: sp})
            .then(response => response.json())
            .then(data => {
                data.result === "OK"?alert("Данные ушли на сервер"):alert("Строка на сервере может быть только одна");
            })
            .catch(error => console.error(error));
        }
        read() {
            let sp = new URLSearchParams();
            sp.append("f", "READ");
            sp.append("n", this.stringName);
            fetch(this.ajaxHandlerScript, {method: "post", body: sp})
            .then(response => response.json())
            .then(data => {
                const dataItems = JSON.parse(data.result);
                this.newInfoFromServer = dataItems;
                console.log(this.newInfoFromServer)
            })
            .catch(error => console.error(error));
        }
        openForm() {
            this.view.openForm();
        }
        logIn(name, userPassword) {
            if (name === "" || userPassword === "") {
                this.view.warning();
                return;
            } else {
                this.newInfoFromServer.forEach(obj => {
                    if (obj.login == name && obj.password == userPassword) {
                        this.view.reminder();
                        return;
                    }
                    if (obj.login == name && obj.password !== userPassword) {
                        this.view.rejectName();
                        return;
                    }
                });
                this.sendToServer(name, userPassword, 0);
            }
            //this.sendToServer(name, userPassword, 0);
        }
        sendToServer(name, userPassword, userScore) {
            let infoObj = {login: name, password: userPassword, score: userScore};
            console.log(infoObj);
            this.newInfoFromServer.push(infoObj);
            console.log(this.newInfoFromServer)
            this.storeInfo();
        }
        storeInfo() {
            this.updatePassword = Math.random();
            let sp = new URLSearchParams();
            sp.append("f","LOCKGET");
            sp.append("n", this.stringName);
            sp.append("p", this.updatePassword);
            console.log(sp)
            fetch(this.ajaxHandlerScript, {method: "post", body: sp})
            .then(response => response.json())
            .then(data => {
                if (data) {
                    console.log(data)
                    this.lockGetReady();
                }
            })
            .catch(error => console.error(error));
        }
        lockGetReady() {
            let newInfoFromServer = this.newInfoFromServer;
            console.log(newInfoFromServer)
            let sp = new URLSearchParams();
            sp.append("f",'UPDATE' );
            sp.append("n", this.stringName);
            sp.append("p", this.updatePassword);
            sp.append("v", JSON.stringify(this.newInfoToServer));
            console.log(sp);
            fetch(this.ajaxHandlerScript, {method: "post", body: sp})
            .then(response => response.json());
        }
        buildTable() {
            this.read();
            console.log(this.newInfoFromServer)
            this.newInfoFromServer.sort((a, b) => (b["score"] - a["score"]));
            this.newInfoFromServer.forEach((obj) => {
                /*if (this.newInfoFromServer.indexOf(obj) >= 10) {
                    return;
                } else {*/
                    console.log(obj)
                    this.view.buildTable(obj);
                //}
            });
        }
        start(container) {
            const orientation = screen.orientation.type.startsWith("landscape") ? "portrait" : "portrait";
            this.lock("portrait");
            this.view.init();
            game.init(container);
        }
        lock(orientation) {
            let de = document.documentElement;
            if (de.requestFullscreen) {de.requestFullscreen()}
            else if (de.mozRequestFullscreen) {de.mozRequestFullscreen()}
            else if (de.webkitRequestFullscreen) {de.webkitRequestFullscreen()}
            else if (de.msRequestFullscreen) {de.msRequestFullscreen()}
            // код для мобильных устройств
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                screen.orientation.lock(orientation);
            }
        }
        showForm() {
            this.view.showForm();
        }
        toMenu() {
            this.unlock("portrait");
            this.view.toMenu();
        }
        unlock(orientation) {
            screen.orientation.unlock(orientation);
            if (document.exitFullscreen) {document.exitFullscreen()}
            else if (document.webkitExitFullscreen) {document.webkitExitFullscreen()}
            else if (document.mozCancelFullscreen) {document.mozCancelFullscreen()}
            else if (document.msExitFullscreen) {document.msExitFullscreen()}
        }
        sendScoreToServer(userName, userPassword, userScore) {
            if (userName === "" || userPassword === "") {
                this.view.warning();
            }
            this.newInfoFromServer.forEach(obj => {
                if (obj.login == userName && obj.password == userPassword) {
                    obj.score = userScore;
                    this.storeInfo();
                    const menu = document.getElementById("menu");
                    menu.style.display = "block";
                    const background = document.querySelector(".blue-bg");
                    background.style.display = "none";
                    this.unlock("portrait");//выход из полноэкранного режима
                }
                if (obj.login == userName && obj.password !== userPassword) {
                    this.view.reject();
                }
                if (obj.login !== userName && obj.password !== userPassword) {
                    this.view.reject();
                }
                if (obj.login !== userName && obj.password == userPassword) {
                    this.view.reject();
                }
            });
        }
    }

    class AppController {
        constructor(container, model) {
            this.container = document.getElementById(container);
            this.model = model;
            this.addEventListeners();
        }
        addEventListeners() {
            this.container.addEventListener("click", (event) => {
                if (event.target && event.target.id === "login") {
                    const nameInput = document.getElementById("name");
                    const passwordInput = document.getElementById("password");
                    const name = nameInput.value;
                    const password = passwordInput.value;
                    console.log(name)
                    console.log(password)
                    this.model.logIn(name, password);
                }
            })
            const scores = document.getElementById("scores");
            scores.addEventListener("click", (event) => {
                //if (event.target && event.target.id === "table") {
                    this.model.buildTable();
                //}
            })
            this.container.addEventListener("click", (event) => {
                if (event.target && event.target.id === "start") {
                    this.model.start(container);
                }
            })
            this.container.addEventListener("click", (event) => {
                if (event.target && event.target.id === "close") {
                    this.model.toMenu();
                }
            })
            this.container.addEventListener("click", (event) => {
                if (event.target && event.target.id === "add-score") {
                    this.model.showForm();
                }
            })
            this.container.addEventListener("click", (event) => {
                if (event.target && event.target.id === "send-data") {
                    const nameInput = document.getElementById("name");
                    const passwordInput = document.getElementById("password");
                    //Функция, которая добавит имя и результат в таблицу
                    let scoreDiv = document.getElementById("score-span");
                    let score = scoreDiv.textContent;
                    let userScore = score;
                    let userName = nameInput.value;
                    let userPassword = passwordInput.value;
                    this.model.sendScoreToServer(userName, userPassword, userScore);
                }
            })
        }
    }
    return {
        init: function(container) {
            const myView = new AppView(container);
            const myModel = new AppModel(myView);
            const myController = new AppController(container, myModel);

            //myModel.insertNewData();
            myModel.read();
        }
    }
}());

document.addEventListener("DOMContentLoaded", App.init("content"));