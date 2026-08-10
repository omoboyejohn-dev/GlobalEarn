/* =========================================
   GlobalEarn Task System
   task.js
========================================= */


/* =========================================
   TASK CONFIGURATION
========================================= */

const tasks = {

    regular1: {
        name: "Regular 1",
        reward: 5,
        category: "REGULAR TASK"
    },

    regular2: {
        name: "Regular 2",
        reward: 10,
        category: "REGULAR TASK"
    },

    regular3: {
        name: "Regular 3",
        reward: 15,
        category: "REGULAR TASK"
    },

    vip1: {
        name: "VIP 1",
        reward: 10,
        category: "VIP TASK"
    },

    vip2: {
        name: "VIP 2",
        reward: 20,
        category: "VIP TASK"
    },

    vip3: {
        name: "VIP 3",
        reward: 30,
        category: "VIP TASK"
    }

};


/* =========================================
   GET TASK FROM URL
========================================= */

const urlParams = new URLSearchParams(
    window.location.search
);

const taskId =
    urlParams.get("task") || "regular1";


/* =========================================
   CHECK TASK
========================================= */

const selectedTask =
    tasks[taskId];

if (!selectedTask) {

    window.location.href =
        "dashboard.html";

}


/* =========================================
   ELEMENTS
========================================= */

const taskTitle =
    document.getElementById("taskTitle");

const taskReward =
    document.getElementById("taskReward");

const descriptionReward =
    document.getElementById("descriptionReward");

const statusReward =
    document.getElementById("statusReward");

const taskStatus =
    document.getElementById("taskStatus");

const startTaskButton =
    document.getElementById("startTaskButton");

const taskMessage =
    document.getElementById("taskMessage");

const taskCategory =
    document.querySelector(".task-category");


/* =========================================
   FORMAT MONEY
========================================= */

function formatMoney(amount) {

    return "$" + Number(amount).toFixed(2);

}


/* =========================================
   LOAD TASK
========================================= */

if (selectedTask) {

    const reward =
        formatMoney(selectedTask.reward);


    if (taskTitle) {

        taskTitle.textContent =
            selectedTask.name;

    }


    if (taskCategory) {

        taskCategory.textContent =
            selectedTask.category;

    }


    if (taskReward) {

        taskReward.textContent =
            reward;

    }


    if (descriptionReward) {

        descriptionReward.textContent =
            reward;

    }


    if (statusReward) {

        statusReward.textContent =
            reward;

    }

}


/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(
    text,
    type = "error"
) {

    if (!taskMessage) return;

    taskMessage.textContent =
        text;

    taskMessage.className =
        "task-message " + type;

}


/* =========================================
   START TASK
========================================= */

if (startTaskButton) {

    startTaskButton.addEventListener(
        "click",
        function () {

            /*
             * IMPORTANT:
             * Do not add the reward to Firestore here.
             *
             * The browser cannot be trusted to confirm
             * that a task was completed.
             */


            startTaskButton.disabled = true;


            startTaskButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Task Started
            `;


            if (taskStatus) {

                taskStatus.innerHTML = `
                    <i class="fa-solid fa-circle"></i>
                    In Progress
                `;

            }


            showMessage(
                "Your task has started. Follow the instructions above and contact Telegram Support to complete the task.",
                "success"
            );


            /*
             * The button is temporarily locked.
             *
             * Later we will connect this to the
             * real task verification system.
             */

            setTimeout(() => {

                startTaskButton.disabled =
                    false;

                startTaskButton.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Task In Progress
                `;

            }, 1500);

        }
    );

}
