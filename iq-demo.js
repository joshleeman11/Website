(function () {
    const demoData = {
        fileLabel: "living-room-walkthrough.mp4",
        transcript:
            "In the living room there's a reclining leather couch, two throw pillows, a wooden coffee table, and a 75-inch TV…",
        items: [
            {
                name: "Reclining leather couch",
                qty: 1,
                source: "Pottery Barn",
                price: "$1,000",
                thumb: "🛋️",
            },
            {
                name: "Throw pillow",
                qty: 2,
                source: "Target",
                price: "$25",
                thumb: "🛏️",
            },
            {
                name: "Wooden coffee table",
                qty: 1,
                source: "Crate & Barrel",
                price: "$169",
                thumb: "🪵",
            },
            {
                name: "Media console",
                qty: 1,
                source: "Ashley",
                price: "$599",
                thumb: "📺",
            },
            {
                name: 'Flat-screen TV, 75"',
                qty: 1,
                source: "Best Buy",
                price: "$599",
                thumb: "📺",
            },
        ],
    };

    function initDemo(demo) {
        if (demo.dataset.initialized === "true") return;

        const fileName = demo.querySelector(".iq-demo-file-name");
        const processBtn = demo.querySelector(".iq-demo-process");
        const pipeline = demo.querySelector(".iq-demo-pipeline");
        const output = demo.querySelector(".iq-demo-output");
        const transcript = demo.querySelector(".iq-demo-transcript");
        const tableBody = demo.querySelector(".iq-demo-table tbody");
        const imageStrip = demo.querySelector(".iq-demo-images");

        if (!processBtn) return;

        demo.dataset.initialized = "true";
        fileName.textContent = demoData.fileLabel;

        let running = false;

        function resetDemo() {
            running = false;
            processBtn.disabled = false;
            processBtn.textContent = "Run AI pipeline";
            pipeline.querySelectorAll(".iq-demo-step").forEach(function (step) {
                step.classList.remove("is-active", "is-done");
            });
            output.hidden = true;
            transcript.textContent = "";
            tableBody.innerHTML = "";
            imageStrip.innerHTML = "";
        }

        function renderResults() {
            transcript.textContent = demoData.transcript;
            imageStrip.innerHTML = demoData.items
                .map(function (item) {
                    return (
                        '<div class="iq-demo-thumb"><span aria-hidden="true">' +
                        item.thumb +
                        "</span><small>" +
                        item.name +
                        "</small></div>"
                    );
                })
                .join("");
            tableBody.innerHTML = demoData.items
                .map(function (item) {
                    return (
                        '<tr><td><span class="iq-demo-cell-thumb" aria-hidden="true">' +
                        item.thumb +
                        "</span> " +
                        item.name +
                        "</td><td>" +
                        item.qty +
                        "</td><td>" +
                        item.source +
                        "</td><td>" +
                        item.price +
                        "</td></tr>"
                    );
                })
                .join("");
            output.hidden = false;
        }

        function runPipeline() {
            if (running) return;
            running = true;
            processBtn.disabled = true;
            processBtn.textContent = "Running AI pipeline…";
            output.hidden = true;

            const stepEls = pipeline.querySelectorAll(".iq-demo-step");
            let index = 0;

            function nextStep() {
                if (index > 0) {
                    stepEls[index - 1].classList.remove("is-active");
                    stepEls[index - 1].classList.add("is-done");
                }
                if (index >= stepEls.length) {
                    renderResults();
                    processBtn.disabled = false;
                    processBtn.textContent = "Run AI pipeline";
                    running = false;
                    return;
                }
                stepEls[index].classList.add("is-active");
                index += 1;
                window.setTimeout(nextStep, 850);
            }

            stepEls.forEach(function (step) {
                step.classList.remove("is-active", "is-done");
            });
            nextStep();
        }

        processBtn.addEventListener("click", runPipeline);
        resetDemo();
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".iq-demo").forEach(initDemo);
    });
})();
