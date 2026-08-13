/* =========================================
   GlobalEarn Withdrawal System
   withdraw.js

   Rules:
   - Minimum withdrawal: $200
   - Uses Firestore "balance" field
   - Cannot withdraw more than available balance
   - Deducts balance when request is submitted
   - Creates a pending withdrawal record
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
    collection,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


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

const errorMessage =
    document.getElementById("withdrawError");

const errorText =
    document.getElementById("withdrawErrorText");

const successMessage =
    document.getElementById("withdrawSuccess");


/* =========================================
   SETTINGS
========================================= */

const MINIMUM_WITHDRAWAL = 200;


/* =========================================
   USER BALANCE
========================================= */

let currentUser = null;

let currentBalance = 0;


/* =========================================
   MONEY FORMAT
========================================= */

function formatMoney(value) {

    return "$" +
        Number(value || 0).toFixed(2);

}


/* =========================================
   UPDATE BALANCE ON PAGE
========================================= */

function updateBalanceDisplay(balance) {

    currentBalance =
        Number(balance) || 0;


    /*
     * Your withdraw.html should have
     * an element with id="availableBalance".
     */

    const balanceElement =
        document.getElementById(
            "availableBalance"
        );


    if (balanceElement) {

        balanceElement.textContent =
            formatMoney(currentBalance);

    }


    /*
     * Also support walletBalance
     * if that ID exists on the page.
     */

    const walletBalance =
        document.getElementById(
            "walletBalance"
        );


    if (
        walletBalance &&
        walletBalance !== balanceElement
    ) {

        walletBalance.textContent =
            formatMoney(currentBalance);

    }

}


/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {

    if (
        errorMessage &&
        errorText
    ) {

        errorText.textContent =
            message;

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

    if (errorMessage) {

        errorMessage.hidden =
            true;

    }


    if (successMessage) {

        successMessage.hidden =
            false;


        const successText =
            successMessage.querySelector(
                "span"
            );


        if (successText) {

            successText.textContent =
                message;

        }

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


        const snapshot =
            await getDoc(userRef);


        if (!snapshot.exists()) {

            showError(
                "Your account information could not be found."
            );

            return false;

        }


        const userData =
            snapshot.data();


        /*
         * IMPORTANT:
         *
         * We use "balance",
         * NOT "welcomeBonus".
         */

        const balance =
            Number(
                userData.balance
            ) || 0;


        updateBalanceDisplay(
            balance
        );


        console.log(
            "GlobalEarn withdrawal balance:",
            balance
        );


        return true;


    } catch (error) {

        console.error(
            "Balance loading error:",
            error
        );


        showError(
            "Unable to load your available balance. Please refresh the page."
        );


        return false;

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


        await loadUserBalance(
            user
        );

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
                    "Please login to continue."
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
                    amountInput?.value
                );


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
                    "You can only withdraw $200 or more."
                );

                amountInput.focus();

                return;

            }


            /* =====================================
               CHECK AVAILABLE BALANCE
            ===================================== */

            /*
             * Example:
             *
             * Balance = $71
             * Request  = $200
             *
             * This must be rejected.
             */

            if (
                amount >
                currentBalance
            ) {

                showError(
                    `Insufficient balance. Your available balance is ${formatMoney(currentBalance)}. You cannot withdraw ${formatMoney(amount)}.`
                );

                amountInput.focus();

                return;

            }


            /* =====================================
               WALLET ADDRESS
            ===================================== */

            const walletAddress =
                walletInput?.value
                    .trim();


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

            if (withdrawButton) {

                withdrawButton.disabled =
                    true;


                withdrawButton.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Processing...</span>
                `;

            }


            /* =====================================
               FIRESTORE TRANSACTION
            ===================================== */

            try {

                const userRef =
                    doc(
                        db,
                        "users",
                        currentUser.uid
                    );


                /*
                 * Create a new withdrawal
                 * document with an automatic ID.
                 */

                const withdrawalRef =
                    doc(
                        collection(
                            db,
                            "withdrawals"
                        )
                    );


                await runTransaction(
                    db,
                    async (transaction) => {

                        /*
                         * Read the latest balance
                         * INSIDE the transaction.
                         *
                         * This prevents an old
                         * browser balance from being
                         * trusted.
                         */

                        const userSnapshot =
                            await transaction.get(
                                userRef
                            );


                        if (
                            !userSnapshot.exists()
                        ) {

                            throw new Error(
                                "ACCOUNT_NOT_FOUND"
                            );

                        }


                        const userData =
                            userSnapshot.data();


                        const latestBalance =
                            Number(
                                userData.balance
                            ) || 0;


                        /*
                         * FINAL SERVER-SIDE
                         * TRANSACTION CHECK
                         */

                        if (
                            amount >
                            latestBalance
                        ) {

                            throw new Error(
                                "INSUFFICIENT_BALANCE"
                            );

                        }


                        if (
                            latestBalance <
                            MINIMUM_WITHDRAWAL
                        ) {

                            throw new Error(
                                "BALANCE_BELOW_MINIMUM"
                            );

                        }


                        /*
                         * Calculate new balance.
                         */

                        const newBalance =
                            Number(
                                (
                                    latestBalance -
                                    amount
                                ).toFixed(2)
                            );


                        /*
                         * Deduct the withdrawal
                         * amount from balance.
                         */

                        transaction.update(
                            userRef,
                            {

                                balance:
                                    newBalance,

                                updatedAt:
                                    serverTimestamp()

                            }
                        );


                        /*
                         * Create withdrawal request.
                         */

                        transaction.set(
                            withdrawalRef,
                            {

                                uid:
                                    currentUser.uid,

                                email:
                                    currentUser.email ||
                                    userData.email ||
                                    "",

                                username:
                                    userData.username ||
                                    "",

                                amount:
                                    amount,

                                cryptocurrency:
                                    selectedCrypto.value,

                                walletAddress:
                                    walletAddress,

                                status:
                                    "pending",

                                createdAt:
                                    serverTimestamp(),

                                updatedAt:
                                    serverTimestamp()

                            }
                        );

                    }
                );


                /* =====================================
                   UPDATE PAGE BALANCE
                ===================================== */

                const newBalance =
                    Number(
                        (
                            currentBalance -
                            amount
                        ).toFixed(2)
                    );


                updateBalanceDisplay(
                    newBalance
                );


                /* =====================================
                   SUCCESS
                ===================================== */

                showSuccess(
                    `Your ${selectedCrypto.value} withdrawal request for ${formatMoney(amount)} has been submitted successfully and is pending review.`
                );


                /* =====================================
                   BUTTON
                ===================================== */

                if (withdrawButton) {

                    withdrawButton.disabled =
                        true;


                    withdrawButton.innerHTML = `
                        <i class="fa-solid fa-circle-check"></i>
                        <span>Withdrawal Submitted</span>
                    `;

                }


                /*
                 * Prevent submitting the
                 * same form again.
                 */

                if (amountInput) {

                    amountInput.value =
                        "";

                }


                if (walletInput) {

                    walletInput.value =
                        "";

                }


            } catch (error) {

                console.error(
                    "Withdrawal error:",
                    error
                );


                /* =====================================
                   SPECIFIC ERRORS
                ===================================== */

                if (
                    error.message ===
                    "INSUFFICIENT_BALANCE"
                ) {

                    /*
                     * Refresh balance before
                     * showing the final message.
                     */

                    await loadUserBalance(
                        currentUser
                    );


                    showError(
                        `Insufficient balance. Your available balance is ${formatMoney(currentBalance)}.`
                    );

                } else if (
                    error.message ===
                    "BALANCE_BELOW_MINIMUM"
                ) {

                    showError(
                        "Your balance is below the $200 minimum withdrawal requirement."
                    );

                } else if (
                    error.message ===
                    "ACCOUNT_NOT_FOUND"
                ) {

                    showError(
                        "Your account information could not be found."
                    );

                } else {

                    showError(
                        "Unable to submit your withdrawal request. Please try again."
                    );

                }


                /* =====================================
                   RESTORE BUTTON
                ===================================== */

                if (withdrawButton) {

                    withdrawButton.disabled =
                        false;


                    withdrawButton.innerHTML = `
                        <i class="fa-solid fa-money-bill-transfer"></i>
                        <span>Withdraw Funds</span>
                    `;

                }

            }

        }
    );

}


/* =========================================
   INITIAL BALANCE STATE
========================================= */

const balanceElement =
    document.getElementById(
        "availableBalance"
    );


if (balanceElement) {

    balanceElement.textContent =
        "$0.00";

}
