/* =========================================
   GlobalEarn Profile
   profile.js
========================================= */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

const profileFullName =
    document.getElementById("profileFullName");

const profileUsername =
    document.getElementById("profileUsername");

const profileUsernameInfo =
    document.getElementById("profileUsernameInfo");

const profileEmail =
    document.getElementById("profileEmail");

const profileCountry =
    document.getElementById("profileCountry");

const memberSince =
    document.getElementById("memberSince");

const accountStatus =
    document.getElementById("accountStatus");


/* =========================================
   DEFAULT VALUES
========================================= */

const DEFAULT_NAME =
    "GlobalEarn Member";

const DEFAULT_VALUE =
    "Unavailable";


/* =========================================
   FORMAT MEMBER DATE
========================================= */

function formatDate(date) {

    if (!date) {
        return DEFAULT_VALUE;
    }

    try {

        return date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    } catch (error) {

        console.error(
            "Date formatting error:",
            error
        );

        return DEFAULT_VALUE;
    }

}


/* =========================================
   CONVERT FIRESTORE DATE
========================================= */

function getFirestoreDate(value) {

    if (!value) {
        return null;
    }


    /* Firestore Timestamp */

    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();

    }


    /* JavaScript Date */

    if (
        value instanceof Date
    ) {

        return value;

    }


    /* Number timestamp */

    if (
        typeof value ===
        "number"
    ) {

        const date =
            new Date(value);

        if (
            !isNaN(
                date.getTime()
            )
        ) {

            return date;

        }

    }


    /* String date */

    if (
        typeof value ===
        "string"
    ) {

        const date =
            new Date(value);

        if (
            !isNaN(
                date.getTime()
            )
        ) {

            return date;

        }

    }


    return null;

}


/* =========================================
   LOAD PROFILE
========================================= */

async function loadProfile(user) {

    try {

        console.log(
            "Loading GlobalEarn profile..."
        );


        /* =====================================
           FIRESTORE USER DOCUMENT
        ===================================== */

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const snapshot =
            await getDoc(
                userRef
            );


        /* =====================================
           DEFAULT AUTH DATA
        ===================================== */

        let fullName =
            user.displayName ||
            DEFAULT_NAME;


        let email =
            user.email ||
            DEFAULT_VALUE;


        let username =
            DEFAULT_VALUE;


        let country =
            DEFAULT_VALUE;


        let registrationDate =
            null;


        /* =====================================
           FIRESTORE DATA
        ===================================== */

        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.data();


            console.log(
                "Firestore user data:",
                data
            );


            /* FULL NAME */

            fullName =
                data.fullName ||
                data.name ||
                user.displayName ||
                DEFAULT_NAME;


            /* EMAIL */

            email =
                data.email ||
                user.email ||
                DEFAULT_VALUE;


            /* USERNAME */

            username =
                data.username ||
                data.userName ||
                DEFAULT_VALUE;


            /* COUNTRY */

            country =
                data.country ||
                DEFAULT_VALUE;


            /* =================================
               REGISTRATION DATE
            ================================= */

            registrationDate =
                data.createdAt ||
                data.created_at ||
                data.registrationDate ||
                data.registeredAt ||
                data.dateCreated ||
                null;

        }


        /* =====================================
           MEMBER SINCE
        ===================================== */

        const date =
            getFirestoreDate(
                registrationDate
            );


        const formattedMemberSince =
            date
                ? formatDate(date)
                : DEFAULT_VALUE;


        /* =====================================
           UPDATE PROFILE HEADER
        ===================================== */

        if (
            profileFullName
        ) {

            profileFullName.textContent =
                fullName;

        }


        if (
            profileUsername
        ) {

            profileUsername.textContent =
                username !== DEFAULT_VALUE
                    ? `@${username}`
                    : "@username";

        }


        if (
            accountStatus
        ) {

            accountStatus.textContent =
                "Active";

        }


        /* =====================================
           UPDATE PERSONAL DETAILS
        ===================================== */

        if (
            profileEmail
        ) {

            profileEmail.textContent =
                email;

        }


        if (
            profileCountry
        ) {

            profileCountry.textContent =
                country;

        }


        if (
            memberSince
        ) {

            memberSince.textContent =
                formattedMemberSince;

        }


        if (
            profileUsernameInfo
        ) {

            profileUsernameInfo.textContent =
                username;

        }


        console.log(
            "GlobalEarn profile successfully loaded."
        );


    } catch (error) {

        console.error(
            "GlobalEarn profile loading error:",
            error
        );


        /* =====================================
           FALLBACK TO FIREBASE AUTH
        ===================================== */

        if (
            profileFullName
        ) {

            profileFullName.textContent =
                user.displayName ||
                DEFAULT_NAME;

        }


        if (
            profileUsername
        ) {

            profileUsername.textContent =
                "@username";

        }


        if (
            profileEmail
        ) {

            profileEmail.textContent =
                user.email ||
                DEFAULT_VALUE;

        }


        if (
            profileCountry
        ) {

            profileCountry.textContent =
                DEFAULT_VALUE;

        }


        if (
            memberSince
        ) {

            memberSince.textContent =
                DEFAULT_VALUE;

        }


        if (
            profileUsernameInfo
        ) {

            profileUsernameInfo.textContent =
                DEFAULT_VALUE;

        }


        if (
            accountStatus
        ) {

            accountStatus.textContent =
                "Active";

        }

    }

}


/* =========================================
   AUTH STATE
========================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        console.log(
            "Authentication state:",
            user
                ? user.uid
                : "No user"
        );


        /* =====================================
           USER NOT LOGGED IN
        ===================================== */

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        /* =====================================
           LOAD USER PROFILE
        ===================================== */

        await loadProfile(
            user
        );

    }
);


/* =========================================
   CHANGE NAME BUTTON
========================================= */

const changeNameButton =
    document.getElementById(
        "changeNameButton"
    );


if (
    changeNameButton
) {

    changeNameButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "settings.html#name";

        }
    );

}


/* =========================================
   CHANGE PASSWORD BUTTON
========================================= */

const changePasswordButton =
    document.getElementById(
        "changePasswordButton"
    );


if (
    changePasswordButton
) {

    changePasswordButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "settings.html#password";

        }
    );

}
