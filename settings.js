/* =========================================
   GlobalEarn Settings
   settings.js
========================================= */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    updatePassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

const fullNameInput =
    document.getElementById("fullName");

const usernameInput =
    document.getElementById("username");

const emailInput =
    document.getElementById("email");

const countryInput =
    document.getElementById("country");

const phoneInput =
    document.getElementById("phone");

const saveProfileButton =
    document.getElementById("saveProfileButton");

const profileMessage =
    document.getElementById("profileMessage");


/* PASSWORD */

const passwordForm =
    document.getElementById("passwordForm");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const savePasswordButton =
    document.getElementById("savePasswordButton");

const passwordMessage =
    document.getElementById("passwordMessage");


/* =========================================
   CURRENT USER
========================================= */

let currentUser = null;


/* =========================================
   MESSAGE HELPERS
========================================= */

function showProfileMessage(
    message,
    type = "error"
) {

    if (!profileMessage) return;

    profileMessage.textContent =
        message;

    profileMessage.className =
        `settings-message ${type}`;

    profileMessage.hidden = false;
}


function showPasswordMessage(
    message,
    type = "error"
) {

    if (!passwordMessage) return;

    passwordMessage.textContent =
        message;

    passwordMessage.className =
        `modal-message ${type}`;

    passwordMessage.hidden = false;
}


/* =========================================
   LOAD USER DATA
========================================= */

async function loadUserData(user) {

    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );

        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            showProfileMessage(
                "Your account information could not be found."
            );

            return;

        }


        const userData =
            userSnapshot.data();


        /* =====================================
           PROFILE FIELDS
        ===================================== */

        if (fullNameInput) {

            fullNameInput.value =
                userData.fullName ||
                user.displayName ||
                "";

        }


        if (usernameInput) {

            usernameInput.value =
                userData.username ||
                "";

            /*
             * Username cannot be changed.
             */

            usernameInput.readOnly =
                true;

        }


        if (emailInput) {

            emailInput.value =
                userData.email ||
                user.email ||
                "";

            /*
             * Email cannot be changed here.
             */

            emailInput.readOnly =
                true;

        }


        if (countryInput) {

            countryInput.value =
                userData.country ||
                "";

        }


        if (phoneInput) {

            phoneInput.value =
                userData.phone ||
                "";

        }


    } catch (error) {

        console.error(
            "Load settings error:",
            error
        );

        showProfileMessage(
            "Unable to load your account information."
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


        currentUser =
            user;


        await loadUserData(
            user
        );

    }
);


/* =========================================
   SAVE PROFILE
========================================= */

if (saveProfileButton) {

    saveProfileButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            if (!currentUser) {

                showProfileMessage(
                    "Please log in again."
                );

                return;

            }


            const fullName =
                fullNameInput?.value.trim() ||
                "";

            const country =
                countryInput?.value.trim() ||
                "";

            const phone =
                phoneInput?.value.trim() ||
                "";


            /* =================================
               VALIDATION
            ================================= */

            if (!fullName) {

                showProfileMessage(
                    "Please enter your full name."
                );

                fullNameInput?.focus();

                return;

            }


            if (fullName.length < 2) {

                showProfileMessage(
                    "Your full name is too short."
                );

                fullNameInput?.focus();

                return;

            }


            /* =================================
               LOADING
            ================================= */

            saveProfileButton.disabled =
                true;

            saveProfileButton.textContent =
                "Saving...";


            try {

                const userRef =
                    doc(
                        db,
                        "users",
                        currentUser.uid
                    );


                /* =================================
                   UPDATE FIRESTORE
                ================================= */

                await updateDoc(
                    userRef,
                    {

                        fullName:
                            fullName,

                        country:
                            country,

                        phone:
                            phone,

                        updatedAt:
                            serverTimestamp()

                    }
                );


                /* =================================
                   UPDATE FIREBASE AUTH NAME
                ================================= */

                await updateProfile(
                    currentUser,
                    {
                        displayName:
                            fullName
                    }
                );


                showProfileMessage(
                    "Your profile has been updated successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );


                showProfileMessage(
                    "Unable to update your profile. Please try again."
                );

            } finally {

                saveProfileButton.disabled =
                    false;

                saveProfileButton.textContent =
                    "Save Changes";

            }

        }
    );

}


/* =========================================
   CHANGE PASSWORD
========================================= */

if (passwordForm) {

    passwordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!currentUser) {

                showPasswordMessage(
                    "Please log in again."
                );

                return;

            }


            const newPassword =
                newPasswordInput?.value ||
                "";

            const confirmPassword =
                confirmPasswordInput?.value ||
                "";


            /* =================================
               VALIDATION
            ================================= */

            if (!newPassword) {

                showPasswordMessage(
                    "Please enter your new password."
                );

                newPasswordInput?.focus();

                return;

            }


            if (newPassword.length < 6) {

                showPasswordMessage(
                    "Password must contain at least 6 characters."
                );

                newPasswordInput?.focus();

                return;

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                showPasswordMessage(
                    "Passwords do not match."
                );

                confirmPasswordInput?.focus();

                return;

            }


            /* =================================
               LOADING
            ================================= */

            savePasswordButton.disabled =
                true;

            savePasswordButton.textContent =
                "Updating...";


            try {

                await updatePassword(
                    currentUser,
                    newPassword
                );


                showPasswordMessage(
                    "Your password has been updated successfully.",
                    "success"
                );


                /*
                 * Clear password fields
                 */

                newPasswordInput.value =
                    "";

                confirmPasswordInput.value =
                    "";


                /*
                 * Reset button after success
                 */

                setTimeout(
                    () => {

                        if (
                            passwordMessage
                        ) {

                            passwordMessage.hidden =
                                true;

                        }

                    },
                    3000
                );


            } catch (error) {

                console.error(
                    "Password update error:",
                    error
                );


                let message =
                    "Unable to update your password.";


                switch (
                    error.code
                ) {

                    case "auth/requires-recent-login":

                        message =
                            "For security, please log out and log in again before changing your password.";

                        break;


                    case "auth/weak-password":

                        message =
                            "Your password is too weak. Use at least 6 characters.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "Network error. Please check your internet connection.";

                        break;


                    default:

                        if (
                            error.message
                        ) {

                            message =
                                error.message;

                        }

                }


                showPasswordMessage(
                    message
                );

            } finally {

                savePasswordButton.disabled =
                    false;

                savePasswordButton.textContent =
                    "Update Password";

            }

        }
    );

}


/* =========================================
   SHOW / HIDE PASSWORD
========================================= */

document
    .querySelectorAll(
        ".toggle-password"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        this.getAttribute(
                            "data-target"
                        );


                    const input =
                        document.getElementById(
                            target
                        );


                    if (!input) return;


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";


                        this.innerHTML =
                            '<i class="fa-solid fa-eye-slash"></i>';

                        this.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        input.type =
                            "password";


                        this.innerHTML =
                            '<i class="fa-solid fa-eye"></i>';

                        this.setAttribute(
                            "aria-label",
                            "Show password"
                        );

                    }

                }
            );

        }
    );


/* =========================================
   LOGOUT
========================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                const {
                    signOut
                } = await import(
                    "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js"
                );


                await signOut(
                    auth
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}
