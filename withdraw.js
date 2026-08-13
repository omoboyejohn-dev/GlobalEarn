/* =========================================
   GlobalEarn Withdrawal System
   withdraw.js

   Features:
   - Reads real balance from Firestore
   - Displays current balance
   - Minimum withdrawal: $200
   - Prevents withdrawal above balance
   - Creates withdrawal request only when valid
   - Deducts balance only after valid request
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
    getDoc,
    updateDoc,
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   SETTINGS
========================================= */

const MINIMUM_WITHDRAWAL = 200;


/* =========================================
   ELEMENTS
========================================= */

const withdrawForm =
    document.getElementById("withdrawForm");

const amountInput =
    document.getElementById("withdrawAmount");

const walletInput =
    document.getElementById("walletAddress");

const withdrawButton =
    document.getElementById("withdrawButton");

const withdrawBalance =
    document.getElementById("withdrawBalance");

const errorMessage =
    document.getElementById("withdrawError");

const errorText =
    document.getElementById("withdrawErrorText");

const successMessage =
    document.getElementById("withdrawSuccess");

const successText =
    document.getElementById("withdrawSuccessText");


/* =========================================
   CURRENT USER BALANCE
========================================= */

let currentBalance = 0;
let currentUser = null;


/* =========================================
   FORMAT MONEY
========================================= */

function formatMoney(amount) {

    return Number(amount || 0).toFixed(2);

}


/* =========================================
   UPDATE BALANCE ON PAGE
========================================= */

function displayBalance(balance) {

    currentBalance =
        Number(balance || 0);

    if (withdrawBalance) {

        withdrawBalance.textContent =
            `$${formatMoney(currentBalance)}`;

    }

}


/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {

    if (errorText) {

        errorText.textContent =
            message;

    }

    if (errorMessage) {

        errorMessage.hidden =
            false;

    }

    if (successMessage) {

        successMessage.hidden =
            true;

    }

}


/* =========================================
   SHOW SUCCESS
========================================= */

function showSuccess(message) {

    if (successText) {

        successText.textContent =
            message;

    }

    if (successMessage) {

        successMessage.hidden =
            false;

    }

    if (errorMessage) {

        errorMessage.hidden =
            true;

    }

}


/* =========================================
   HIDE MESSAGES
========================================= */

function hideMessages() {

    if (errorMessage) {

        errorMessage.hidden =
            true;

    }

    if (successMessage) {

        successMessage.hidden =
            true;

    }

}


/* =========================================
   LOAD USER BALANCE
========================================= */

async function loadUserBalance(user) {

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

            showError(
                "Your account information could not be found."
            );

            displayBalance(0);

            return;

        }


        const userData =
            userSnapshot.data();


        displayBalance(
            userData.balance || 0
        );


    } catch (error) {

        console.error(
            "Balance loading error:",
            error
        );


        showError(
            "Unable to load your available balance. Please refresh the page."
        );

    }

}


/* =========================================
   AUTHENTICATION
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


        await loadUserBalance(user);

    }
);


/* =========================================
   FORM SUBMIT
========================================= */

if (withdrawForm) {

    withdrawForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            hideMessages();


            /* =====================================
               CHECK LOGIN
            ===================================== */

            if (!currentUser) {

                showError(
                    "Please log in before making a withdrawal."
                );

                return;

            }


            /* =====================================
               SELECT CRYPTO
            ===================================== */

            const selectedCrypto =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                );


            if (!selectedCrypto) {

                showError(
                    "Please select BTC, ETH, LTC, or USDT."
                );

                return;

            }


            /* =====================================
               GET AMOUNT
            ===================================== */

            const amount =
                Number(
                    amountInput.value
                );


            /* =====================================
               CHECK AMOUNT
            ===================================== */

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                showError(
                    "Please enter a valid withdrawal amount."
                );

                amountInput.focus();

                return;

            }


            /* =====================================
               MINIMUM WITHDRAWAL
            ===================================== */

            if (
                amount <
                MINIMUM_WITHDRAWAL
            ) {

                showError(
                    "Minimum withdrawal is $200.00."
                );

                amountInput.focus();

                return;

            }


            /* =====================================
               CHECK AVAILABLE BALANCE
            ===================================== */

            if (
                amount >
                currentBalance
            ) {

                showError(
                    `Insufficient balance. Your available balance is $${formatMoney(currentBalance)}. You cannot withdraw $${formatMoney(amount)}.`
                );

                amountInput.focus();

                return;

            }


            /* =====================================
               WALLET ADDRESS
            ===================================== */

            const walletAddress =
                walletInput.value.trim();


            if (!walletAddress) {

                showError(
                    "Please enter your wallet address."
                );

                walletInput.focus();

                return;

            }


            if (
                walletAddress.length <
                10
            ) {

                showError(
                    "Please enter a valid wallet address."
                );

                walletInput.focus();

                return;

            }


            /* =====================================
               DISABLE BUTTON
            ===================================== */

            withdrawButton.disabled =
                true;


            withdrawButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Processing...</span>
            `;


            try {

                /* =====================================
                   GET FRESH BALANCE FROM FIRESTORE

                   Important:
                   Do not rely only on the balance
                   displayed on the screen.
                ===================================== */

                const userRef =
                    doc(
                        db,
                        "users",
                        currentUser.uid
                    );


                const userSnapshot =
                    await getDoc(userRef);


                if (!userSnapshot.exists()) {

                    throw new Error(
                        "USER_NOT_FOUND"
                    );

                }


                const userData =
                    userSnapshot.data();


                const freshBalance =
                    Number(
                        userData.balance || 0
                    );


                /* =====================================
                   UPDATE PAGE BALANCE
                ===================================== */

                displayBalance(
                    freshBalance
                );


                /* =====================================
                   FRESH BALANCE CHECK
                ===================================== */

                if (
                    amount >
                    freshBalance
                ) {

                    showError(
                        `Insufficient balance. Your available balance is $${formatMoney(freshBalance)}.`
                    );

                    return;

                }


                /* =====================================
                   CALCULATE NEW BALANCE
                ===================================== */

                const newBalance =
                    freshBalance -
                    amount;


                /* =====================================
                   CREATE WITHDRAWAL REQUEST
                ===================================== */

                await addDoc(
                    collection(
                        db,
                        "withdrawals"
                    ),
                    {

                        userId:
                            currentUser.uid,

                        email:
                            currentUser.email || "",

                        cryptocurrency:
                            selectedCrypto.value,

                        amount:
                            amount,

                        walletAddress:
                            walletAddress,

                        status:
                            "pending",

                        createdAt:
                            serverTimestamp()

                    }
                );


                /* =====================================
                   DEDUCT BALANCE
                ===================================== */

                await updateDoc(
                    userRef,
                    {

                        balance:
                            newBalance,

                        totalWithdrawn:
                            Number(
                                userData.totalWithdrawn || 0
                            ) + amount,

                        updatedAt:
                            serverTimestamp()

                    }
                );


                /* =====================================
                   UPDATE LOCAL BALANCE
                ===================================== */

                displayBalance(
                    newBalance
                );


                /* =====================================
                   SUCCESS
                ===================================== */

                showSuccess(
                    `Your ${selectedCrypto.value} withdrawal request for $${formatMoney(amount)} has been submitted successfully.`
                );


                /* =====================================
                   CLEAR FORM
                ===================================== */

                amountInput.value =
                    "";

                walletInput.value =
                    "";


                document
                    .querySelectorAll(
                        'input[name="paymentMethod"]'
                    )
                    .forEach(
                        radio => {
                            radio.checked =
                                false;
                        }
                    );


            } catch (error) {

                console.error(
                    "Withdrawal error:",
                    error
                );


                if (
                    error.message ===
                    "USER_NOT_FOUND"
                ) {

                    showError(
                        "Your account information could not be found."
                    );

                } else {

                    showError(
                        "Unable to submit your withdrawal request. Please try again."
                    );

                }

            } finally {

                withdrawButton.disabled =
                    false;


                withdrawButton.innerHTML = `
                    <i class="fa-solid fa-money-bill-transfer"></i>
                    <span>Withdraw Funds</span>
                `;

            }

        }
    );

           }
