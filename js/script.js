/**
 * Created by Agnieszka on 2016-10-30.
 */
var offices = getOffices() || mockOffices;
var workers = getWorkers() || mockWorkers;

var table = document.getElementById("workers-table-body"),
    addBtn = document.getElementById("add-btn"),
    searchWorker = document.getElementById("input-search-worker"),
    searchBtn = document.getElementById("search-btn"),
    searchError = document.getElementById("search-error"),
    salary = document.getElementById("sum-and-average-salary"),
    newName = document.getElementById("input-name"),
    inputSalary = document.getElementById("input-salary"),
    inputOffice = document.getElementById("input-office"),
    availableOffices = offices.map(function(office) {
        return office.id;
    });
var company = {};

function addWorkersAndOfficesToLocalStorage() {
    window.localStorage.setItem("workers", JSON.stringify(workers));
    window.localStorage.setItem("offices", JSON.stringify(offices));
}

addWorkersAndOfficesToLocalStorage();

function getOffices() {
    return JSON.parse(window.localStorage.getItem("offices"));
}

function getWorkers() {
    return JSON.parse(window.localStorage.getItem("workers"));
}

function mapWorkerstoOffices(office) {
    return {
        id: office.id,
        name: office.name,
        headquarter: office.headquarter || false,
        workers: workers.filter( function findWorkersOfOffice(worker) {
            return worker.office === office.id;
        })
    }
}

function addWorkerstoOffices() {
    offices = offices.map(mapWorkerstoOffices);
}

function addOfficesToCompany() {
    for (var office of offices) {
        company[office.name] = office;
    }
}

function calculateAverageGlobalSalary() {
    var salarySum = 0;
    var workersLength = 0;
    for (var office in company) {
        workersLength += company[office].workers.length;
        for (var i = 0, len = company[office].workers.length; i < len; i++) {
            salarySum += company[office].workers[i].salary;
        }
    }
    return salarySum/workersLength;
}

function compareSalary(prev, next) {
    return next.salary - prev.salary;
}

function showHighestSalary(office) {
    var sortedWorkers = office.workers.sort(compareSalary);
    return "The best paid worker is " + sortedWorkers[0].name + " and his salary is " + sortedWorkers[0].salary;
}

function displayWorkersTable() {
    var companyWorkersTable = "";
    for (var office in company) {
        for (var i = 0, len = company[office].workers.length; i < len; i++) {
            companyWorkersTable += '<tr><td>' + company[office].workers[i].id + '</td><td>'
                + company[office].workers[i].name + '</td><td>'
                + company[office].workers[i].salary + '</td><td>'
                + office + '</td><td>' + '<span class="glyphicon glyphicon-trash remove-worker" aria-hidden="true" id="' + company[office].workers[i].id + '"></span></td></tr>';
        }
    }
    table.innerHTML = companyWorkersTable; // zawsze nadpisuje całą zawartość węzła, do którego jest dodawany //
    var removeButtons = document.getElementsByClassName("remove-worker");
    for (var j = 0; j < removeButtons.length; j++) {
        removeButtons[j].addEventListener('click', removeWorker)
    }
}

function Worker(id, name, salary, office) {
    this.id = id;
    this.name = name;
    this.salary = salary;
    this.office = office;
}

function searchWorkers() {
    workers = workers.filter(function(worker) {
        return worker.name.toLowerCase().indexOf(searchWorker.value.toLowerCase().trim()) !== -1;
    });
    if (workers.length === 0) {
        document.getElementById("search-error").innerHTML = "No workers found!";
    }
    addWorkerstoOffices();
    addOfficesToCompany();
    displayWorkersTable();
}

function removeWorker() {
    var id = parseFloat(this.getAttribute('id'));
    workers = workers.filter(function(worker) {
        return !(worker.id === id);
    });
    window.localStorage.setItem("workers",JSON.stringify(workers));
    addWorkerstoOffices();
    addOfficesToCompany();
    displayWorkersTable();
}

addBtn.addEventListener("click", function(event) {
    event.preventDefault();
    var lastIds = workers.map(function(worker) {
        return worker.id;
    }).sort(function(prev, next) {
        return next - prev;
    });
    var nextId = ++lastIds[0];
    if (availableOffices.indexOf(inputOffice.value) === -1){
        document.getElementById("office-error").innerHTML = "Available offices are GD, GL or KO!";
        return;
    }
    workers.push(new Worker(nextId, newName.value, parseFloat(inputSalary.value), inputOffice.value));
    window.localStorage.setItem("workers",JSON.stringify(workers));
    addWorkerstoOffices();
    addOfficesToCompany();
    displayWorkersTable();
});
searchBtn.addEventListener("click", searchWorkers);

addWorkerstoOffices();
addOfficesToCompany();
displayWorkersTable();

function sumSalaryPerOffice(office) {
    var salarySum = 0;
    for (var i = 0, len = office.workers.length; i < len; i++) {
        salarySum += office.workers[i].salary;
    }
    return salarySum;
}

function calculateAverageWorkersSalary(office) {
    return sumSalaryPerOffice(office) / office.workers.length;
}

function addSalarySumAndAvgSalary() {
    companySumAndAvg = '';
    for (var office in company) {
        companySumAndAvg += '<row><div class="col-sm-4"><div class="panel panel-primary"><div class="panel-heading">' + company[office].name +'</div>'
            + '<div class="panel-body"><p>Average salary for ' + company[office].name + ' is <span>' + Math.round(calculateAverageWorkersSalary(company[office]))
            + '</span></p><p>Sum of salaries for ' + company[office].name + ' is <span>' + sumSalaryPerOffice(company[office])
            + '</span></p></div></div></div></row>';
    }
    salary.innerHTML = companySumAndAvg;
}

addSalarySumAndAvgSalary();

function addTooltipsForInput() {
    inputOffice.setAttribute('title', 'Dostępne biura to: ' + availableOffices.join(','));
}

