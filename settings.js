/* =========================================
   GlobalEarn Settings
   settings.js
========================================= */

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    updatePassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

const editNameButton =
    document.getElementById("editNameButton");

const editPasswordButton =
    document.getElementById("editPasswordButton");

const logoutButton =
    document.getElementById("logoutButton");

const nameModal =
    document.getElementById("nameModal");

const passwordModal =
    document.getElementById("passwordModal");

const closeNameModal =
    document.getElementById("closeNameModal");

const closePasswordModal =
    document.getElementById("closePasswordModal");

const nameForm =
    document.getElementById("nameForm");

const passwordForm =
    document.getElementById("passwordForm");

const newFullName =
    document.getElementById("newFullName");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const saveNameButton =
    document.getElementById("saveNameButton");

const savePasswordButton =
    document.getElementById("savePasswordButton");

const nameMessage =
    document.getElementById("nameMessage");

const passwordMessage =
    document.getElementById("passwordMessage");

const settingsEmail =
    document.getElementById("settingsEmail");

const settingsUsername =
    document.getElementById("settingsUsername");

const settingsCountry =
    document.getElementById("settingsCountry");


let currentUser = null;


/* =========================================
   MODAL FUNCTIONS
========================================= */

function openModal(modal) {

    if (!modal) return;

    modal.hidden = false;

}


function closeModal(modal) {

    if (!modal) return;

    modal.hidden = true;

}


/* =========================================
   MESSAGE
========================================= */

function showMessage(element, message, type) {

    if (!element) return;

    element.textContent = message;

    element.className =
        `modal-message ${type}`;

    element.hidden = false;

}


function hideMessage(element) {

    if (!element) return;

    element.hidden = true;

    element.textContent = "";

}


/* =========================================
   LOAD ACCOUNT INFORMATION
========================================= */

async function loadSettings(user) {

    try {

        const userRef =
            doc(db, "users", user.uid);

        const snapshot =
            await getDoc(userRef);


        if (!snapshot.exists()) {

            settingsEmail.textContent =
                user.email || "Not available";

            settingsUsername.textContent =
                "Not available";

            settingsCountry.textContent =
                "Not available";

            return;

        }


        const data =
            snapshot.data();


        settingsEmail.textContent =
            data.email ||
            user.email ||
            "Not available";


        settingsUsername.textContent =
            data.username ||
            "Not available";


        settingsCountry.textContent =
            data.country ||
            "Not available";


    } catch (error) {

        console.error(
            "Settings loading error:",
            error
        );

        settingsEmail.textContent =
            user.email || "Unavailable";

        settingsUsername.textContent =
            "Unavailable";

        settingsCountry.textContent =
            "Unavailable";

    }

}


/* =========================================
   CHANGE NAME
========================================= */

editNameButton?.addEventListener(
    "click",
    () => {

        hideMessage(nameMessage);

        newFullName.value = "";

        openModal(nameModal);

        setTimeout(() => {

            newFullName.focus();

        }, 100);

    }
);


/* =========================================
   CLOSE NAME MODAL
========================================= */

closeNameModal?.addEventListener(
    "click",
    () => {

        closeModal(nameModal);

    }
);


/* =========================================
   SAVE NAME
========================================= */

nameForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentUser) {

            showMessage(
                nameMessage,
                "You are not logged in.",
                "error"
            );

            return;

        }


        const fullName =
            newFullName.value.trim();


        if (!fullName) {

            showMessage(
                nameMessage,
                "Please enter your full name.",
                "error"
            );

            return;

        }


        if (fullName.length < 2) {

            showMessage(
                nameMessage,
                "Your full name must contain at least 2 characters.",
                "error"
            );

            return;

        }


        saveNameButton.disabled = true;

        saveNameButton.textContent =
            "Saving...";


        try {

            const userRef =
                doc(db, "users", currentUser.uid);


            await updateDoc(
                userRef,
                {
                    fullName: fullName
                }
            );


            showMessage(
                nameMessage,
                "Your full name has been updated successfully.",
                "success"
            );


            saveNameButton.textContent =
                "Saved";


            setTimeout(() => {

                closeModal(nameModal);

                saveNameButton.disabled = false;

                saveNameButton.textContent =
                    "Save Changes";

            }, 1200);


        } catch (error) {

            console.error(
                "Name update error:",
                error
            );


            showMessage(
                nameMessage,
                "Unable to update your name. Please try again.",
                "error"
            );


            saveNameButton.disabled = false;

            saveNameButton.textContent =
                "Save Changes";

        }

    }
);


/* =========================================
   CHANGE PASSWORD
========================================= */

editPasswordButton?.addEventListener(
    "click",
    () => {

        hideMessage(passwordMessage);

        newPassword.value = "";

        confirmPassword.value = "";

        openModal(passwordModal);

        setTimeout(() => {

            newPassword.focus();

        }, 100);

    }
);


/* =========================================
   CLOSE PASSWORD MODAL
========================================= */

closePasswordModal?.addEventListener(
    "click",
    () => {

        closeModal(passwordModal);

    }
);


/* =========================================
   UPDATE PASSWORD
========================================= */

passwordForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentUser) {

            showMessage(
                passwordMessage,
                "You are not logged in.",
                "error"
            );

            return;

        }


        const password =
            newPassword.value;

        const confirm =
            confirmPassword.value;


        /* PASSWORD LENGTH */

        if (password.length < 6) {

            showMessage(
                passwordMessage,
                "Password must contain at least 6 characters.",
                "error"
            );

            return;

        }


        /* PASSWORD MATCH */

        if (password !== confirm) {

            showMessage(
                passwordMessage,
                "Passwords do not match.",
                "error"
            );

            return;

        }


        savePasswordButton.disabled = true;

        savePasswordButton.textContent =
            "Updating...";


        try {

            await updatePassword(
                currentUser,
                password
            );


            showMessage(
                passwordMessage,
                "Your password has been updated successfully.",
                "success"
            );


            passwordForm.reset();


            savePasswordButton.textContent =
                "Updated";


            setTimeout(() => {

                closeModal(passwordModal);

                savePasswordButton.disabled = false;

                savePasswordButton.textContent =
                    "Update Password";

            }, 1200);


        } catch (error) {

            console.error(
                "Password update error:",
                error
            );


            let message =
                "Unable to update your password. Please try again.";


            if (
                error.code ===
                "auth/requires-recent-login"
            ) {

                message =
                    "For security, please log in again before changing your password.";

            }


            showMessage(
                passwordMessage,
                message,
                "error"
            );


            savePasswordButton.disabled = false;

            savePasswordButton.textContent =
                "Update Password";

        }

    }
);


/* =========================================
   PASSWORD VISIBILITY
========================================= */

document
    .querySelectorAll(".toggle-password")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const targetId =
                    button.dataset.target;

                const input =
                    document.getElementById(targetId);

                if (!input) return;


                if (input.type === "password") {

                    input.type = "text";

                    button.innerHTML =
                        '<i class="fa-solid fa-eye-slash"></i>';

                } else {

                    input.type = "password";

                    button.innerHTML =
                        '<i class="fa-solid fa-eye"></i>';

                }

            }
        );

    });


/* =========================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================= */

nameModal?.addEventListener(
    "click",
    (event) => {

        if (event.target === nameModal) {

            closeModal(nameModal);

        }

    }
);


passwordModal?.addEventListener(
    "click",
    (event) => {

        if (event.target === passwordModal) {

            closeModal(passwordModal);

        }

    }
);


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") return;


        closeModal(nameModal);

        closeModal(passwordModal);

    }
);


/* =========================================
   LOGOUT
========================================= */

logoutButton?.addEventListener(
    "click",
    async () => {

        try {

            logoutButton.disabled = true;

            logoutButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Logging out...
            `;


            await signOut(auth);


            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );


            logoutButton.disabled = false;

            logoutButton.innerHTML = `
                <i class="fa-solid fa-right-from-bracket"></i>
                Logout
            `;

        }

    }
);


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


        currentUser = user;


        await loadSettings(user);


        /*
         * Open the correct modal when coming
         * from Profile page.
         *
         * Example:
         * settings.html#name
         * settings.html#password
         */

        if (window.location.hash === "#name") {

            openModal(nameModal);

        }


        if (
            window.location.hash ===
            "#password"
        ) {

            openModal(passwordModal);

        }

    }
);
