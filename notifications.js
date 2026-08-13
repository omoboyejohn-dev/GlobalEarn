/* =========================================
   GlobalEarn Notifications
   notifications.js

   Features:
   - Loads notifications from Firestore
   - Shows newest notifications first
   - Counts unread notifications
   - All / Unread filter
   - Mark individual notification as read
   - Mark all notifications as read
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
    orderBy,
    getDocs,
    doc,
    updateDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

const notificationList =
    document.getElementById(
        "notificationList"
    );

const emptyNotifications =
    document.getElementById(
        "emptyNotifications"
    );

const totalNotifications =
    document.getElementById(
        "totalNotifications"
    );

const unreadNotifications =
    document.getElementById(
        "unreadNotifications"
    );

const markAllReadButton =
    document.getElementById(
        "markAllReadButton"
    );

const filterButtons =
    document.querySelectorAll(
        ".filter-button"
    );


/* =========================================
   STATE
========================================= */

let currentUser = null;

let allNotifications = [];

let currentFilter = "all";


/* =========================================
   NOTIFICATION ICONS
========================================= */

function getNotificationIcon(type) {

    switch (type) {

        case "referral":
            return `
                <i class="fa-solid fa-users"></i>
            `;

        case "withdrawal":
            return `
                <i class="fa-solid fa-money-bill-transfer"></i>
            `;

        case "success":
            return `
                <i class="fa-solid fa-circle-check"></i>
            `;

        case "error":
            return `
                <i class="fa-solid fa-circle-xmark"></i>
            `;

        case "task":
            return `
                <i class="fa-solid fa-list-check"></i>
            `;

        case "bonus":
            return `
                <i class="fa-solid fa-gift"></i>
            `;

        case "announcement":
            return `
                <i class="fa-solid fa-bullhorn"></i>
            `;

        default:
            return `
                <i class="fa-solid fa-bell"></i>
            `;

    }

}


/* =========================================
   NOTIFICATION CLASS
========================================= */

function getNotificationClass(type) {

    switch (type) {

        case "referral":
            return "notification-referral";

        case "withdrawal":
            return "notification-withdrawal";

        case "success":
            return "notification-success";

        case "error":
            return "notification-error";

        case "task":
            return "notification-task";

        case "bonus":
            return "notification-bonus";

        case "announcement":
            return "notification-announcement";

        default:
            return "notification-default";

    }

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(timestamp) {

    if (!timestamp) {

        return "Just now";

    }


    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);


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

    } catch {

        return "Just now";

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

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


    if (totalNotifications) {

        totalNotifications.textContent =
            total;

    }


    if (unreadNotifications) {

        unreadNotifications.textContent =
            unread;

    }


    if (markAllReadButton) {

        markAllReadButton.disabled =
            unread === 0;

    }

}


/* =========================================
   GET FILTERED NOTIFICATIONS
========================================= */

function getFilteredNotifications() {

    if (
        currentFilter ===
        "unread"
    ) {

        return allNotifications.filter(
            notification =>
                notification.read !== true
        );

    }


    return allNotifications;

}


/* =========================================
   RENDER NOTIFICATIONS
========================================= */

function renderNotifications() {

    const notifications =
        getFilteredNotifications();


    if (notificationList) {

        notificationList.innerHTML =
            "";

    }


    if (!notifications.length) {

        if (notificationList) {

            notificationList.hidden =
                true;

        }


        if (emptyNotifications) {

            emptyNotifications.hidden =
                false;

        }


        return;

    }


    if (notificationList) {

        notificationList.hidden =
            false;

    }


    if (emptyNotifications) {

        emptyNotifications.hidden =
            true;

    }


    notifications.forEach(
        notification => {

            const notificationElement =
                document.createElement(
                    "article"
                );


            const unreadClass =
                notification.read === true
                    ? ""
                    : "unread";


            const iconClass =
                getNotificationClass(
                    notification.type
                );


            notificationElement.className =
                `notification-item ${unreadClass}`;


            notificationElement.dataset.id =
                notification.id;


            notificationElement.innerHTML = `

                <div class="notification-icon ${iconClass}">

                    ${getNotificationIcon(
                        notification.type
                    )}

                </div>


                <div class="notification-content">

                    <div class="notification-top">

                        <h3>
                            ${escapeHTML(
                                notification.title ||
                                "Notification"
                            )}
                        </h3>

                        ${
                            notification.read !== true
                                ? `
                                    <span class="unread-dot"></span>
                                  `
                                : ""
                        }

                    </div>


                    <p>
                        ${escapeHTML(
                            notification.message ||
                            ""
                        )}
                    </p>


                    <time>
                        ${formatDate(
                            notification.createdAt
                        )}
                    </time>


                    ${
                        notification.read !== true
                            ? `
                                <button
                                    type="button"
                                    class="mark-read-button"
                                    data-id="${notification.id}"
                                >
                                    <i class="fa-solid fa-check"></i>
                                    Mark as read
                                </button>
                              `
                            : ""
                    }

                </div>

            `;


            notificationList.appendChild(
                notificationElement
            );

        }
    );


    attachMarkReadButtons();

}


/* =========================================
   ATTACH MARK-READ BUTTONS
========================================= */

function attachMarkReadButtons() {

    const buttons =
        document.querySelectorAll(
            ".mark-read-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async function () {

                    const notificationId =
                        this.dataset.id;


                    await markAsRead(
                        notificationId
                    );

                }
            );

        }
    );

}


/* =========================================
   MARK ONE AS READ
========================================= */

async function markAsRead(
    notificationId
) {

    try {

        const notificationRef =
            doc(
                db,
                "notifications",
                notificationId
            );


        await updateDoc(
            notificationRef,
            {
                read: true
            }
        );


        const notification =
            allNotifications.find(
                item =>
                    item.id ===
                    notificationId
            );


        if (notification) {

            notification.read =
                true;

        }


        updateSummary();

        renderNotifications();


        /*
         * Tell dashboard to update
         * notification badge.
         */

        localStorage.setItem(
            "notificationsUpdated",
            Date.now().toString()
        );


    } catch (error) {

        console.error(
            "Mark notification as read error:",
            error
        );

        alert(
            "Unable to mark this notification as read."
        );

    }

}


/* =========================================
   MARK ALL AS READ
========================================= */

async function markAllAsRead() {

    if (!currentUser) {

        return;

    }


    const unread =
        allNotifications.filter(
            notification =>
                notification.read !== true
        );


    if (!unread.length) {

        return;

    }


    try {

        if (markAllReadButton) {

            markAllReadButton.disabled =
                true;

            markAllReadButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Marking as read...
            `;

        }


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

            }
        );


        await batch.commit();


        allNotifications.forEach(
            notification => {

                notification.read =
                    true;

            }
        );


        updateSummary();

        renderNotifications();


        localStorage.setItem(
            "notificationsUpdated",
            Date.now().toString()
        );


    } catch (error) {

        console.error(
            "Mark all notifications error:",
            error
        );

        alert(
            "Unable to mark all notifications as read."
        );


    } finally {

        if (markAllReadButton) {

            markAllReadButton.innerHTML = `
                <i class="fa-solid fa-check-double"></i>
                Mark all as read
            `;

            markAllReadButton.disabled =
                allNotifications.filter(
                    notification =>
                        notification.read !== true
                ).length === 0;

        }

    }

}


/* =========================================
   LOAD NOTIFICATIONS
========================================= */

async function loadNotifications() {

    if (!currentUser) {

        return;

    }


    try {

        if (notificationList) {

            notificationList.innerHTML = `

                <div class="notification-loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    <span>
                        Loading notifications...
                    </span>

                </div>

            `;

            notificationList.hidden =
                false;

        }


        if (emptyNotifications) {

            emptyNotifications.hidden =
                true;

        }


        const notificationsRef =
            collection(
                db,
                "notifications"
            );


        const notificationsQuery =
            query(
                notificationsRef,
                where(
                    "userId",
                    "==",
                    currentUser.uid
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                notificationsQuery
            );


        allNotifications =
            snapshot.docs.map(
                document => ({

                    id:
                        document.id,

                    ...document.data()

                })
            );


        updateSummary();

        renderNotifications();


    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );


        if (notificationList) {

            notificationList.innerHTML = `

                <div class="notification-error-state">

                    <i class="fa-solid fa-circle-exclamation"></i>

                    <strong>
                        Unable to load notifications
                    </strong>

                    <p>
                        Please refresh the page and try again.
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================
   FILTER BUTTONS
========================================= */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                currentFilter =
                    this.dataset.filter ||
                    "all";


                renderNotifications();

            }
        );

    }
);


/* =========================================
   MARK ALL BUTTON
========================================= */

if (markAllReadButton) {

    markAllReadButton.addEventListener(
        "click",
        markAllAsRead
    );

}


/* =========================================
   AUTH STATE
========================================= */

onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentUser =
            user;


        await loadNotifications();

    }
);
