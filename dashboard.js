/* =========================================
   GlobalEarn Dashboard
   dashboard.js
========================================= */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   ELEMENT HELPER
========================================= */

function getElement(id) {
    return document.getElementById(id);
}


/* =========================================
   MONEY FORMAT
========================================= */

function formatMoney(value) {

    const amount = Number(value) || 0;

    return "$" + amount.toFixed(2);

}


/* =========================================
   DATE FORMAT
========================================= */

function formatDate(timestamp) {

    if (!timestamp) {
        return "—";
    }

    try {

        const date = timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

        return date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    } catch (error) {

        console.error(
            "Date formatting error:",
            error
        );

        return "—";
    }

}


/* =========================================
   SHOW USER DATA
========================================= */

function displayUserData(user, userData) {

    const fullName =
        userData.fullName ||
        user.displayName ||
        "GlobalEarn Member";

    const username =
        userData.username ||
        fullName;


    /* =====================================
       USERNAME / NAME
    ===================================== */

    const welcomeName =
        getElement("welcomeName");

    if (welcomeName) {

        welcomeName.textContent =
            username;

    }


    const headerUsername =
        getElement("headerUsername");

    if (headerUsername) {

        headerUsername.textContent =
            username;

    }


    /* =====================================
       BALANCE
    ===================================== */

    const balance =
        Number(userData.balance) || 0;

    const walletBalance =
        getElement("walletBalance");

    if (walletBalance) {

        walletBalance.textContent =
            formatMoney(balance);

    }


    /* =====================================
       WELCOME BONUS
    ===================================== */

    const welcomeBonus =
        Number(userData.welcomeBonus) || 0;

    const welcomeBonusElement =
        getElement("welcomeBonus");

    if (welcomeBonusElement) {

        welcomeBonusElement.textContent =
            formatMoney(welcomeBonus);

    }


    /* =====================================
       TASK EARNINGS
    ===================================== */

    const taskEarnings =
        Number(userData.taskEarnings) || 0;

    const taskEarningsElement =
        getElement("taskEarnings");

    if (taskEarningsElement) {

        taskEarningsElement.textContent =
            formatMoney(taskEarnings);

    }


    /* =====================================
       REFERRAL EARNINGS
    ===================================== */

    const referralEarnings =
        Number(userData.referralEarnings) || 0;

    const referralEarningsElement =
        getElement("referralEarnings");

    if (referralEarningsElement) {

        referralEarningsElement.textContent =
            formatMoney(referralEarnings);

    }


    /* =====================================
       TOTAL WITHDRAWN
    ===================================== */

    const totalWithdrawn =
        Number(userData.totalWithdrawn) || 0;

    const totalWithdrawnElement =
        getElement("totalWithdrawn");

    if (totalWithdrawnElement) {

        totalWithdrawnElement.textContent =
            formatMoney(totalWithdrawn);

    }


    /* =====================================
       ACCOUNT STATUS
    ===================================== */

    const accountStatus =
        getElement("accountStatus");

    if (accountStatus) {

        const status =
            userData.accountStatus ||
            "active";

        accountStatus.textContent =
            status.charAt(0).toUpperCase() +
            status.slice(1);

        accountStatus.classList.remove(
            "status-active",
            "status-disabled"
        );

        if (
            status.toLowerCase() ===
            "active"
        ) {

            accountStatus.classList.add(
                "status-active"
            );

        } else {

            accountStatus.classList.add(
                "status-disabled"
            );

        }

    }


    /* =====================================
       MEMBER SINCE
    ===================================== */

    const memberSince =
        getElement("memberSince");

    if (memberSince) {

        memberSince.textContent =
            formatDate(
                userData.createdAt
            );

    }


    /* =====================================
       COUNTRY
    ===================================== */

    const countryElement =
        getElement("userCountry");

    if (countryElement) {

        countryElement.textContent =
            userData.country ||
            "—";

    }


    /* =====================================
       EMAIL
    ===================================== */

    const emailElement =
        getElement("userEmail");

    if (emailElement) {

        emailElement.textContent =
            userData.email ||
            user.email ||
            "—";

    }


    console.log(
        "GlobalEarn user data loaded:",
        userData
    );

}


/* =========================================
   LOAD USER FROM FIRESTORE
========================================= */

async function loadUserData(user) {

    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );

        const snapshot =
            await getDoc(userRef);


        if (!snapshot.exists()) {

            console.error(
                "User document not found."
            );

            return;

        }


        const userData =
            snapshot.data();


        displayUserData(
            user,
            userData
        );


    } catch (error) {

        console.error(
            "Error loading dashboard:",
            error
        );

    }

}


/* =========================================
   AUTH STATE
========================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        await loadUserData(user);

    }
);


/* =========================================
   LOGOUT
========================================= */

const logoutButton =
    getElement("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


            try {

                logoutButton.disabled =
                    true;


                logoutButton.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Logging out...</span>
                `;


                await signOut(auth);


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Unable to logout. Please try again."
                );


                logoutButton.disabled =
                    false;


                logoutButton.innerHTML = `
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>Logout</span>
                `;

            }

        }
    );

}


/* =========================================
   MOBILE SIDEBAR
========================================= */

const menuButton =
    getElement("menuButton");

const sidebar =
    getElement("sidebar");


if (menuButton && sidebar) {

    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    sidebar.classList.remove(
                        "open"
                    );

                }
            );

        });

}


/* =========================================
   DASHBOARD READY
========================================= */

document.documentElement.classList.add(
    "dashboard-ready"
);
