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
   FORMAT MONEY
========================================= */

function formatMoney(value) {

    const amount = Number(value) || 0;

    return "$" + amount.toFixed(2);

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(timestamp) {

    if (!timestamp) {
        return "—";
    }

    try {

        const date =
            timestamp.toDate
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
   LOAD USER DATA
========================================= */

async function loadUserData(user) {

    try {

        const userRef =
            doc(db, "users", user.uid);

        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            console.error(
                "User document does not exist."
            );

            return;

        }


        const userData =
            userSnapshot.data();


        /* =====================================
           USER NAME
        ====================================== */

        const fullName =
            userData.fullName ||
            user.displayName ||
            "GlobalEarn Member";


        const username =
            userData.username ||
            fullName;


        /* =====================================
           BALANCES
        ====================================== */

        const balance =
            Number(userData.balance) || 0;


        const welcomeBonus =
            Number(userData.welcomeBonus) || 0;


        const taskEarnings =
            Number(userData.taskEarnings) || 0;


        const referralEarnings =
            Number(userData.referralEarnings) || 0;


        const totalWithdrawn =
            Number(userData.totalWithdrawn) || 0;


        /* =====================================
           UPDATE NAME
        ====================================== */

        const welcomeName =
            getElement("welcomeName");

        if (welcomeName) {

            welcomeName.textContent =
                fullName;

        }


        const headerUsername =
            getElement("headerUsername");

        if (headerUsername) {

            headerUsername.textContent =
                username;

        }


        /* =====================================
           UPDATE BALANCES
        ====================================== */

        const walletBalance =
            getElement("walletBalance");

        if (walletBalance) {

            walletBalance.textContent =
                formatMoney(balance);

        }


        const welcomeBonusElement =
            getElement("welcomeBonus");

        if (welcomeBonusElement) {

            welcomeBonusElement.textContent =
                formatMoney(welcomeBonus);

        }


        const taskEarningsElement =
            getElement("taskEarnings");

        if (taskEarningsElement) {

            taskEarningsElement.textContent =
                formatMoney(taskEarnings);

        }


        const referralEarningsElement =
            getElement("referralEarnings");

        if (referralEarningsElement) {

            referralEarningsElement.textContent =
                formatMoney(referralEarnings);

        }


        const totalWithdrawnElement =
            getElement("totalWithdrawn");

        if (totalWithdrawnElement) {

            totalWithdrawnElement.textContent =
                formatMoney(totalWithdrawn);

        }


        /* =====================================
           ACCOUNT STATUS
        ====================================== */

        const accountStatus =
            getElement("accountStatus");


        if (accountStatus) {

            const status =
                userData.accountStatus ||
                "active";


            accountStatus.textContent =
                status.charAt(0).toUpperCase() +
                status.slice(1);


            if (status.toLowerCase() === "active") {

                accountStatus.classList.add(
                    "status-active"
                );

            }

        }


        /* =====================================
           MEMBER SINCE
        ====================================== */

        const memberSince =
            getElement("memberSince");


        if (memberSince) {

            memberSince.textContent =
                formatDate(userData.createdAt);

        }


        console.log(
            "Dashboard data loaded successfully."
        );


    } catch (error) {

        console.error(
            "Unable to load user data:",
            error
        );

    }

}


/* =========================================
   AUTHENTICATION
========================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            /*
             * User is not logged in.
             * Send them back to login.
             */

            window.location.href =
                "login.html";

            return;

        }


        /*
         * User is authenticated.
         * Load their Firestore data.
         */

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


                logoutButton.innerHTML =
                    `
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


                logoutButton.innerHTML =
                    `
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


    /*
     * Close sidebar after selecting
     * a navigation item on mobile.
     */

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
   PREVENT DASHBOARD FLASH
   FOR LOGGED-OUT USERS
========================================= */

document.documentElement.classList.add(
    "dashboard-ready"
);
