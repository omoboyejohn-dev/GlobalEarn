/* =========================================
   GlobalEarn Profile
   profile.js
========================================= */

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


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

const changeNameButton =
    document.getElementById("changeNameButton");

const changePasswordButton =
    document.getElementById("changePasswordButton");


/* =========================================
   LOADING
========================================= */

function showLoading() {

    if (profileFullName)
        profileFullName.textContent = "Loading...";

    if (profileUsername)
        profileUsername.textContent = "@username";

    if (profileUsernameInfo)
        profileUsernameInfo.textContent = "Loading...";

    if (profileEmail)
        profileEmail.textContent = "Loading...";

    if (profileCountry)
        profileCountry.textContent = "Loading...";

    if (memberSince)
        memberSince.textContent = "Loading...";

}


/* =========================================
   LOAD PROFILE
========================================= */

async function loadProfile(user) {

    try {

        showLoading();


        const userRef =
            doc(db, "users", user.uid);

        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            console.error(
                "User profile was not found in Firestore."
            );

            profileFullName.textContent =
                user.displayName || "User";

            profileUsername.textContent =
                "@username";

            profileUsernameInfo.textContent =
                "Not available";

            profileEmail.textContent =
                user.email || "Not available";

            profileCountry.textContent =
                "Not available";

            memberSince.textContent =
                "Not available";

            accountStatus.textContent =
                "Active";

            return;

        }


        const data =
            userSnapshot.data();


        /* =====================================
           USER INFORMATION
        ===================================== */

        const fullName =
            data.fullName ||
            data.name ||
            user.displayName ||
            "User";


        const username =
            data.username ||
            "username";


        const email =
            data.email ||
            user.email ||
            "Not available";


        const country =
            data.country ||
            "Not available";


        const status =
            data.status ||
            data.accountStatus ||
            "Active";


        /* =====================================
           MEMBER SINCE
        ===================================== */

        let joinedDate =
            "Not available";


        if (data.createdAt) {

            if (
                typeof data.createdAt.toDate ===
                "function"
            ) {

                joinedDate =
                    data.createdAt
                        .toDate()
                        .toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            }
                        );

            }

            else if (
                data.createdAt instanceof Date
            ) {

                joinedDate =
                    data.createdAt
                        .toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            }
                        );

            }

        }


        /* =====================================
           DISPLAY DATA
        ===================================== */

        profileFullName.textContent =
            fullName;


        profileUsername.textContent =
            `@${username}`;


        profileUsernameInfo.textContent =
            username;


        profileEmail.textContent =
            email;


        profileCountry.textContent =
            country;


        memberSince.textContent =
            joinedDate;


        accountStatus.textContent =
            status;


    }

    catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        profileFullName.textContent =
            "Unable to load profile";

        profileUsername.textContent =
            "";

        profileUsernameInfo.textContent =
            "Unavailable";

        profileEmail.textContent =
            user.email || "Unavailable";

        profileCountry.textContent =
            "Unavailable";

        memberSince.textContent =
            "Unavailable";

        accountStatus.textContent =
            "Active";

    }

}


/* =========================================
   AUTH CHECK
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


/* =========================================
   CHANGE FULL NAME
========================================= */

changeNameButton?.addEventListener(
    "click",
    () => {

        window.location.href =
            "settings.html#name";

    }
);


/* =========================================
   CHANGE PASSWORD
========================================= */

changePasswordButton?.addEventListener(
    "click",
    () => {

        window.location.href =
            "settings.html#password";

    }
);
