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

const profileName =
    document.getElementById("profileName");

const profileStatus =
    document.getElementById("profileStatus");

const profileEmail =
    document.getElementById("profileEmail");

const profileCountry =
    document.getElementById("profileCountry");

const profileMemberSince =
    document.getElementById("profileMemberSince");

const profileUsername =
    document.getElementById("profileUsername");


/* =========================================
   LOAD PROFILE
========================================= */

async function loadProfile(user) {

    try {

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const snapshot =
            await getDoc(userRef);


        /* =====================================
           DEFAULT AUTH INFORMATION
        ===================================== */

        let fullName =
            user.displayName || "GlobalEarn Member";

        let email =
            user.email || "Unavailable";

        let username =
            "Unavailable";

        let country =
            "Unavailable";

        let memberSince =
            "Unavailable";


        /* =====================================
           FIRESTORE DATA
        ===================================== */

        if (snapshot.exists()) {

            const data =
                snapshot.data();


            fullName =
                data.fullName ||
                data.name ||
                user.displayName ||
                "GlobalEarn Member";


            email =
                data.email ||
                user.email ||
                "Unavailable";


            username =
                data.username ||
                "Unavailable";


            country =
                data.country ||
                "Unavailable";


            /* =================================
               MEMBER SINCE
            ================================= */

            const createdAt =
                data.createdAt ||
                data.created_at ||
                data.registrationDate;


            if (
                createdAt &&
                typeof createdAt.toDate === "function"
            ) {

                memberSince =
                    formatDate(
                        createdAt.toDate()
                    );

            } else if (
                createdAt instanceof Date
            ) {

                memberSince =
                    formatDate(createdAt);

            }

        }


        /* =====================================
           UPDATE PAGE
        ===================================== */

        if (profileName) {

            profileName.textContent =
                fullName;

        }


        if (profileStatus) {

            profileStatus.textContent =
                "Active";

        }


        if (profileEmail) {

            profileEmail.textContent =
                email;

        }


        if (profileCountry) {

            profileCountry.textContent =
                country;

        }


        if (profileUsername) {

            profileUsername.textContent =
                username;

        }


        if (profileMemberSince) {

            profileMemberSince.textContent =
                memberSince;

        }


        console.log(
            "GlobalEarn profile loaded:",
            {
                fullName,
                email,
                username,
                country,
                memberSince
            }
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        if (profileName) {

            profileName.textContent =
                user.displayName ||
                "GlobalEarn Member";

        }


        if (profileEmail) {

            profileEmail.textContent =
                user.email ||
                "Unavailable";

        }


        if (profileStatus) {

            profileStatus.textContent =
                "Active";

        }

    }

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

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


        await loadProfile(user);

    }
);
