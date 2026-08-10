/* =========================================
   GlobalEarn Withdrawal System
   withdraw.js
========================================= */

const withdrawForm = document.getElementById("withdrawForm");

const amountInput = document.getElementById("withdrawAmount");
const walletInput = document.getElementById("walletAddress");
const withdrawButton = document.getElementById("withdrawButton");

const errorMessage = document.getElementById("withdrawError");
const errorText = document.getElementById("withdrawErrorText");

const successMessage = document.getElementById("withdrawSuccess");

const MINIMUM_WITHDRAWAL = 200;


/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {

    if (errorMessage) {
        errorText.textContent = message;
        errorMessage.hidden = false;
    }

    if (successMessage) {
        successMessage.hidden = true;
    }
}


/* =========================================
   HIDE MESSAGES
========================================= */

function hideMessages() {

    if (errorMessage) {
        errorMessage.hidden = true;
    }

    if (successMessage) {
        successMessage.hidden = true;
    }
}


/* =========================================
   FORM SUBMIT
========================================= */

withdrawForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessages();


    /* =====================================
       SELECT CRYPTO
    ===================================== */

    const selectedCrypto = document.querySelector(
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

    const amount = Number(amountInput.value);


    /* =====================================
       MINIMUM WITHDRAWAL
    ===================================== */

    if (!amount || amount < MINIMUM_WITHDRAWAL) {

        showError(
            "You can only withdraw $200 or more."
        );

        amountInput.focus();

        return;
    }


    /* =====================================
       WALLET ADDRESS
    ===================================== */

    const walletAddress = walletInput.value.trim();


    if (!walletAddress) {

        showError(
            "Please enter your wallet address."
        );

        walletInput.focus();

        return;
    }


    if (walletAddress.length < 10) {

        showError(
            "Please enter a valid wallet address."
        );

        walletInput.focus();

        return;
    }


    /* =====================================
       DISABLE BUTTON
    ===================================== */

    withdrawButton.disabled = true;

    withdrawButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Processing...</span>
    `;


    /* =====================================
       DEMO PROCESSING
       
       IMPORTANT:
       Real withdrawals must be verified
       by Firebase/backend before processing.
    ===================================== */

    await new Promise(resolve => {
        setTimeout(resolve, 1200);
    });


    /* =====================================
       SUCCESS
    ===================================== */

    successMessage.hidden = false;

    const successText =
        successMessage.querySelector("span");

    if (successText) {

        successText.textContent =
            `Your ${selectedCrypto.value} withdrawal request for $${amount.toFixed(2)} has been submitted successfully.`;
    }


    /* =====================================
       BUTTON
    ===================================== */

    withdrawButton.disabled = false;

    withdrawButton.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <span>Withdrawal Submitted</span>
    `;

});
