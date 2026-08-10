const withdrawButton =
    document.getElementById("withdrawButton");

const amountInput =
    document.getElementById("withdrawAmount");

const walletInput =
    document.getElementById("walletAddress");

const errorMessage =
    document.getElementById("errorMessage");

const successMessage =
    document.getElementById("successMessage");


function showError(message) {

    errorMessage.querySelector("span").textContent =
        message;

    errorMessage.classList.add("show");

    successMessage.classList.remove("show");

}


function hideMessages() {

    errorMessage.classList.remove("show");

    successMessage.classList.remove("show");

}


withdrawButton.addEventListener(
    "click",
    async () => {

        hideMessages();


        const selectedCrypto =
            document.querySelector(
                'input[name="crypto"]:checked'
            );


        const walletAddress =
            walletInput.value.trim();


        const amount =
            Number(amountInput.value);


        /* CRYPTO CHECK */

        if (!selectedCrypto) {

            showError(
                "Please select a withdrawal method."
            );

            return;

        }


        /* WALLET CHECK */

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


        /* AMOUNT CHECK */

        if (!amount || amount < 200) {

            showError(
                "You can only withdraw $200 or more."
            );

            amountInput.focus();

            return;

        }


        /*
         * NOTE:
         * The real available balance must come
         * from Firebase/backend.
         *
         * This frontend check is only temporary.
         */

        withdrawButton.disabled = true;

        withdrawButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Processing...
        `;


        /*
         * Simulate request submission.
         *
         * Later we will replace this with
         * Firebase/Firestore transaction creation.
         */

        await new Promise(
            resolve => setTimeout(resolve, 1200)
        );


        successMessage.classList.add("show");

        successMessage.querySelector("span").textContent =
            `Your ${selectedCrypto.value} withdrawal request for $${amount.toFixed(2)} has been submitted successfully.`;


        withdrawButton.disabled = false;

        withdrawButton.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            Request Submitted
        `;

    }
);
