/* =========================================
   GlobalEarn
   withdraw.js
========================================= */

const withdrawForm = document.getElementById("withdrawForm");

const amountInput = document.getElementById("withdrawAmount");
const walletInput = document.getElementById("walletAddress");
const withdrawBalance = document.getElementById("withdrawBalance");

const withdrawError = document.getElementById("withdrawError");
const withdrawErrorText = document.getElementById("withdrawErrorText");

const withdrawSuccess = document.getElementById("withdrawSuccess");

const withdrawButton = document.getElementById("withdrawButton");

const MINIMUM_WITHDRAWAL = 200;


/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {

    withdrawErrorText.textContent = message;

    withdrawError.hidden = false;

    withdrawSuccess.hidden = true;

}


/* =========================================
   HIDE MESSAGES
========================================= */

function clearMessages() {

    withdrawError.hidden = true;

    withdrawSuccess.hidden = true;

}


/* =========================================
   PAYMENT METHOD
========================================= */

const paymentMethods = document.querySelectorAll(
    'input[name="paymentMethod"]'
);

paymentMethods.forEach(method => {

    method.addEventListener("change", () => {

        clearMessages();

        const walletHelp =
            document.getElementById("walletHelp");

        if (!walletHelp) return;

        const selectedMethod = method.value;

        walletHelp.textContent =
            `Enter your ${selectedMethod} wallet address.`;

    });

});


/* =========================================
   FORM SUBMIT
========================================= */

withdrawForm.addEventListener("submit", function (event) {

    event.preventDefault();

    clearMessages();


    /* =====================================
       SELECT PAYMENT METHOD
    ===================================== */

    const selectedMethod =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (!selectedMethod) {

        showError(
            "Please select a cryptocurrency payment method."
        );

        return;

    }


    /* =====================================
       GET AMOUNT
    ===================================== */

    const amount =
        parseFloat(amountInput.value);


    if (
        isNaN(amount) ||
        amount <= 0
    ) {

        showError(
            "Please enter a valid withdrawal amount."
        );

        return;

    }


    /* =====================================
       MINIMUM WITHDRAWAL
    ===================================== */

    if (amount < MINIMUM_WITHDRAWAL) {

        showError(
            "You can only withdraw $200 or more."
        );

        amountInput.focus();

        return;

    }


    /* =====================================
       CHECK BALANCE
    ===================================== */

    const balanceText =
        withdrawBalance.textContent
            .replace("$", "")
            .replace(",", "")
            .trim();

    const balance =
        parseFloat(balanceText);


    if (
        !isNaN(balance) &&
        amount > balance
    ) {

        showError(
            `Insufficient balance. Your available balance is $${balance.toFixed(2)}.`
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
            `Please enter your ${selectedMethod.value} wallet address.`
        );

        walletInput.focus();

        return;

    }


    if (walletAddress.length < 20) {

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
       DEMO REQUEST PROCESSING
    ===================================== */

    setTimeout(() => {

        withdrawButton.disabled = false;

        withdrawButton.innerHTML = `
            <i class="fa-solid fa-money-bill-transfer"></i>
            <span>Request Withdrawal</span>
        `;


        /* =================================
           SHOW SUCCESS
        ================================= */

        withdrawSuccess.hidden = false;

        withdrawError.hidden = true;

        withdrawSuccess.querySelector("strong").textContent =
            "Withdrawal request submitted";

        withdrawSuccess.querySelector("span").textContent =
            `Your $${amount.toFixed(2)} ${selectedMethod.value} withdrawal request has been received and is pending review.`;


        /* =================================
           SAVE DEMO REQUEST
        ================================= */

        const withdrawal = {

            amount: amount,

            method: selectedMethod.value,

            walletAddress: walletAddress,

            status: "pending",

            createdAt: new Date().toISOString()

        };


        localStorage.setItem(
            "lastWithdrawal",
            JSON.stringify(withdrawal)
        );


        /* =================================
           RESET FORM
        ================================= */

        withdrawForm.reset();


    }, 1200);

});
