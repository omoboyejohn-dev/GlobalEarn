/* =========================================
   GlobalEarn Notifications
   notifications.js
========================================= */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

const notificationList =
    document.getElementById("notificationList");

const loadingNotifications =
    document.getElementById("loadingNotifications");

const emptyNotifications =
    document.getElementById("emptyNotifications");

const notificationError =
    document.getElementById("notificationError");

const notificationErrorText =
    document.getElementById("notificationErrorText");

const totalNotifications =
    document.getElementById("totalNotifications");

const unreadNotifications =
    document.getElementById("unreadNotifications");

const markAllRead =
    document.getElementById("markAllRead");

const filterButtons =
    document.querySelectorAll(".notification-tab");


/* =========================================
   STATE
========================================= */

let allNotifications = [];

let currentFilter = "all";

let currentUser = null;


/* =========================================
   AUTHENTICATION
========================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }

    currentUser = user;

    await loadNotifications();

});


/* =========================================
   LOAD NOTIFICATIONS
========================================= */

async function loadNotifications() {

    showLoading();

    try {

        const notificationsRef =
            collection(
                db,
                "notifications"
            );


        const notificationQuery =
            query(
                notificationsRef,
                where(
                    "userId",
                    "==",
                    currentUser.uid
                )
            );


        const snapshot =
            await getDocs(
                notificationQuery
            );


        allNotifications =
            snapshot.docs.map(
                notificationDoc => ({

                    id:
                        notificationDoc.id,

                    ...notificationDoc.data()

                })
            );


        /*
         * Sort newest first.
         */

        allNotifications.sort(
            (a, b) => {

                const timeA =
                    getTimestamp(
                        a.createdAt
                    );

                const timeB =
                    getTimestamp(
                        b.createdAt
                    );

                return timeB - timeA;

            }
        );


        updateSummary();

        renderNotifications();

    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );

        showError(
            "Unable to load notifications. Please refresh the page and try again."
        );

    }

}


/* =========================================
   TIMESTAMP
========================================= */

function getTimestamp(timestamp) {

    if (!timestamp) {
        return 0;
    }

    if (
        typeof timestamp.toMillis ===
        "function"
    ) {

        return timestamp.toMillis();

    }

    if (
        timestamp.seconds
    ) {

        return timestamp.seconds * 1000;

    }

    return 0;

}


/* =========================================
   UPDATE SUMMARY
========================================= */

function updateSummary() {

    const total =
        allNotifications.length;


    const unread =
        allNotifications.filter(
            notification =>
                notification.read !== true
        ).length;


    totalNotifications.textContent =
        total;


    unreadNotifications.textContent =
        unread;

}


/* =========================================
   RENDER
========================================= */

function renderNotifications() {

    hideLoading();

    notificationList.innerHTML = "";

    let notifications =
        allNotifications;


    if (
        currentFilter ===
        "unread"
    ) {

        notifications =
            allNotifications.filter(
                notification =>
                    notification.read !== true
            );

    }


    if (
        notifications.length === 0
    ) {

        emptyNotifications.hidden =
            false;

        return;

    }


    emptyNotifications.hidden =
        true;


    notifications.forEach(
        notification => {

            notificationList.appendChild(
                createNotificationElement(
                    notification
                )
            );

        }
    );

}


/* =========================================
   CREATE NOTIFICATION
========================================= */

function createNotificationElement(
    notification
) {

    const item =
        document.createElement("article");


    const isUnread =
        notification.read !== true;


    item.className =
        "notification-item" +
        (
            isUnread
                ? " unread"
                : ""
        );


    const type =
        notification.type ||
        "info";


    const icon =
        getNotificationIcon(
            type
        );


    const title =
        escapeHTML(
            notification.title ||
            "GlobalEarn Notification"
        );


    const message =
        escapeHTML(
            notification.message ||
            ""
        );


    const time =
        formatDate(
            notification.createdAt
        );


    item.innerHTML = `

        <div class="notification-icon ${type}">

            <i class="${icon}"></i>

        </div>


        <div class="notification-content">

            <div class="notification-top">

                <h3 class="notification-title">
                    ${title}
                </h3>

                <span class="notification-time">
                    ${time}
                </span>

            </div>

            <p class="notification-text">
                ${message}
            </p>

        </div>


        ${
            isUnread
                ? `<span class="unread-dot"></span>`
                : ""
        }

    `;


    /*
     * Clicking an unread notification
     * marks it as read.
     */

    item.addEventListener(
        "click",
        async () => {

            if (
                notification.read === true
            ) {
                return;
            }


            try {

                await updateDoc(
                    doc(
                        db,
                        "notifications",
                        notification.id
                    ),
                    {
                        read: true
                    }
                );


                notification.read =
                    true;


                updateSummary();

                renderNotifications();

            } catch (error) {

                console.error(
                    "Mark notification read error:",
                    error
                );

            }

        }
    );


    return item;

}


/* =========================================
   ICONS
========================================= */

function getNotificationIcon(type) {

    switch (type) {

        case "success":

            return "fa-solid fa-circle-check";


        case "warning":

            return "fa-solid fa-triangle-exclamation";


        case "withdrawal":

            return "fa-solid fa-money-bill-transfer";


        case "info":

            return "fa-solid fa-circle-info";


        default:

            return "fa-solid fa-bell";

    }

}


/* =========================================
   DATE FORMAT
========================================= */

function formatDate(timestamp) {

    const milliseconds =
        getTimestamp(timestamp);


    if (!milliseconds) {
        return "Recently";
    }


    const date =
        new Date(milliseconds);


    return date.toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


/* =========================================
   MARK ALL AS READ
========================================= */

if (markAllRead) {

    markAllRead.addEventListener(
        "click",
        async () => {

            const unread =
                allNotifications.filter(
                    notification =>
                        notification.read !== true
                );


            if (
                unread.length === 0
            ) {

                return;

            }


            markAllRead.disabled =
                true;


            try {

                const batch =
                    writeBatch(db);


                unread.forEach(
                    notification => {

                        const notificationRef =
                            doc(
                                db,
                                "notifications",
                                notification.id
                            );


                        batch.update(
                            notificationRef,
                            {
                                read: true
                            }
                        );


                        notification.read =
                            true;

                    }
                );


                await batch.commit();


                updateSummary();

                renderNotifications();


            } catch (error) {

                console.error(
                    "Mark all notifications read error:",
                    error
                );

                showError(
                    "Unable to mark notifications as read."
                );

            } finally {

                markAllRead.disabled =
                    false;

            }

        }
    );

}


/* =========================================
   FILTER BUTTONS
========================================= */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter ||
                    "all";


                renderNotifications();

            }
        );

    }
);


/* =========================================
   LOADING
========================================= */

function showLoading() {

    if (loadingNotifications) {

        loadingNotifications.hidden =
            false;

    }

    if (notificationError) {

        notificationError.hidden =
            true;

    }

    if (emptyNotifications) {

        emptyNotifications.hidden =
            true;

    }

}


/* =========================================
   HIDE LOADING
========================================= */

function hideLoading() {

    if (loadingNotifications) {

        loadingNotifications.hidden =
            true;

    }

}


/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {

    hideLoading();

    if (notificationError) {

        notificationError.hidden =
            false;

    }

    if (notificationErrorText) {

        notificationErrorText.textContent =
            message;

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}
