(function () {
    const SCENE_IMAGE = { width: 612, height: 408 };
    const VIEW_ASPECT = 4 / 3;
    const SCENE_CALIBRATION = { left: 5, top: -5 };

    const demoData = {
        fileLabel: "bedroom-walkthrough.mp4",
        sceneDuration: 18,
        transcript:
            "I'm in the bedroom here and I see a twin bed with a stuffed teddy bear to its side. Above the bed, there are three poster drawings and two pendant lamps. Next item is a desk chair. One ladder and one bookshelf.",
        extractionMs: 1600,
        extractions: [
            {
                name: "Twin bed",
                thumb: "images/iq-demo/thumb_bed.png",
                label: "Twin bed",
                imageBox: { left: 9, top: 44.5, width: 44, height: 53.5 },
            },
            {
                name: "Teddy bear",
                thumb: "images/iq-demo/thumb_teddy.png",
                label: "Teddy bear",
                imageBox: { left: 8.5, top: 72, width: 17.5, height: 28 },
            },
            {
                name: "Posters",
                thumb: "images/iq-demo/thumb_posters.png",
                label: "Posters",
                imageBox: { left: 7, top: 5.5, width: 31, height: 36.5 },
            },
            {
                name: "Pendant lamps",
                thumb: "images/iq-demo/thumb_lamps.png",
                label: "Pendant lamps",
                imageBox: { left: 28.5, top: 0, width: 28.5, height: 25.5 },
                tagBelow: true,
            },
            {
                name: "Desk chair",
                thumb: "images/iq-demo/thumb_chair.png",
                label: "Desk chair",
                imageBox: { left: 50.5, top: 52, width: 14.5, height: 28 },
            },
            {
                name: "Ladder",
                thumb: "images/iq-demo/thumb_ladder.png",
                label: "Wooden ladder",
                imageBox: { left: 66, top: 18.5, width: 13, height: 68.5 },
            },
            {
                name: "Bookshelf",
                thumb: "images/iq-demo/thumb_bookshelf.png",
                label: "Bookshelf",
                imageBox: { left: 75, top: 6, width: 15, height: 94 },
            },
        ],
        items: [
            {
                name: "Twin bed",
                qty: 1,
                source: "Pottery Barn Kids",
                price: "$649",
                thumb: "images/iq-demo/thumb_bed.png",
            },
            {
                name: "Stuffed teddy bear",
                qty: 1,
                source: "Build-A-Bear",
                price: "$28",
                thumb: "images/iq-demo/thumb_teddy.png",
            },
            {
                name: "Framed poster",
                qty: 3,
                source: "Target",
                price: "$24",
                thumb: "images/iq-demo/thumb_posters.png",
            },
            {
                name: "Pendant lamp",
                qty: 2,
                source: "CB2",
                price: "$89",
                thumb: "images/iq-demo/thumb_lamps.png",
            },
            {
                name: "Desk chair",
                qty: 1,
                source: "IKEA",
                price: "$79",
                thumb: "images/iq-demo/thumb_chair.png",
            },
            {
                name: "Wooden ladder",
                qty: 1,
                source: "West Elm",
                price: "$129",
                thumb: "images/iq-demo/thumb_ladder.png",
            },
            {
                name: "Bookshelf",
                qty: 1,
                source: "IKEA",
                price: "$149",
                thumb: "images/iq-demo/thumb_bookshelf.png",
            },
        ],
        focusSteps: [
            {
                label: "Bookshelf detected",
                imageBox: { left: 75, top: 6, width: 15, height: 94 },
            },
        ],
        statusByStep: [
            "Transcribing speech to line items…",
            "Pulling frames for each item…",
            "Finding replacement prices…",
        ],
    };

    function renderThumb(thumb, className) {
        if (/\.(png|jpe?g|webp|gif|svg)$/i.test(thumb)) {
            return (
                '<img class="' +
                className +
                '" src="' +
                thumb +
                '" alt="" aria-hidden="true">'
            );
        }
        return (
            '<span class="' +
            className +
            '" aria-hidden="true">' +
            thumb +
            "</span>"
        );
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return (
            String(mins).padStart(2, "0") +
            ":" +
            String(secs).padStart(2, "0")
        );
    }

    function toViewBox(imageBox) {
        const imageAspect = SCENE_IMAGE.width / SCENE_IMAGE.height;
        let left;
        let top;
        let width;
        let height;

        if (imageAspect > VIEW_ASPECT) {
            const visible = VIEW_ASPECT / imageAspect;
            const crop = (1 - visible) / 2;
            left =
                ((imageBox.left / 100 - crop) / visible) * 100 +
                SCENE_CALIBRATION.left;
            top = imageBox.top + SCENE_CALIBRATION.top;
            width = (imageBox.width / 100 / visible) * 100;
            height = imageBox.height;
        } else {
            const visible = imageAspect / VIEW_ASPECT;
            const crop = (1 - visible) / 2;
            left = imageBox.left + SCENE_CALIBRATION.left;
            top =
                ((imageBox.top / 100 - crop) / visible) * 100 +
                SCENE_CALIBRATION.top;
            width = imageBox.width;
            height = (imageBox.height / 100 / visible) * 100;
        }

        left = Math.max(0, left);
        top = Math.max(0, top);
        width = Math.min(width, 100 - left);
        height = Math.min(height, 100 - top);

        return { left: left, top: top, width: width, height: height };
    }

    function resolveBox(focusConfig) {
        if (focusConfig.imageBox) {
            return toViewBox(focusConfig.imageBox);
        }
        return focusConfig.box;
    }

    function tagBelowForBox(box) {
        return box.top < 14;
    }

    function setFocus(focusEl, labelEl, focusConfig) {
        if (!focusConfig) {
            focusEl.hidden = true;
            return;
        }
        const tagBelow =
            focusConfig.tagBelow !== undefined
                ? focusConfig.tagBelow
                : tagBelowForBox(resolveBox(focusConfig));

        focusEl.hidden = false;
        const box = resolveBox(focusConfig);
        focusEl.style.left = box.left + "%";
        focusEl.style.top = box.top + "%";
        focusEl.style.width = box.width + "%";
        focusEl.style.height = box.height + "%";
        labelEl.textContent = focusConfig.label;
        labelEl.style.top = tagBelow ? "calc(100% + 4px)" : "auto";
        labelEl.style.bottom = tagBelow ? "auto" : "calc(100% + 4px)";
    }

    function initDemo(demo) {
        if (demo.dataset.initialized === "true") return;

        const fileName = demo.querySelector(".iq-demo-file-name");
        const processBtn = demo.querySelector(".iq-demo-process");
        const pauseBtn = demo.querySelector(".iq-demo-pause");
        const pipeline = demo.querySelector(".iq-demo-pipeline");
        const transcript = demo.querySelector(".iq-demo-transcript");
        const transcriptSizer = demo.querySelector(".iq-demo-transcript-sizer");
        const imagesEl = demo.querySelector(".iq-demo-images");
        const extractEmpty = demo.querySelector(".iq-demo-extract-empty");
        const table = demo.querySelector(".iq-demo-table");
        const tableEmpty = demo.querySelector(".iq-demo-table-empty");
        const tableBody = demo.querySelector(".iq-demo-table tbody");
        const transcriptPanel = demo.querySelector(
            '.iq-demo-step-panel[aria-label="Transcript"]'
        );
        const extractPanel = demo.querySelector(
            '.iq-demo-step-panel[aria-label="Extracted photos"]'
        );
        const pricePanel = demo.querySelector(
            '.iq-demo-step-panel[aria-label="Priced inventory"]'
        );
        const statusEl = demo.querySelector(".iq-demo-status");
        const timerEl = demo.querySelector(".iq-demo-timer");
        const focusEl = demo.querySelector(".iq-demo-focus");
        const focusLabel = demo.querySelector(".iq-demo-focus-label");
        const stage = demo.querySelector(".iq-demo-stage");

        if (!processBtn) return;

        demo.dataset.initialized = "true";
        fileName.textContent = demoData.fileLabel;
        if (transcriptSizer) {
            transcriptSizer.textContent = demoData.transcript;
        }

        const transcriptPlaceholder = "Speech-to-text appears here…";

        function setPanelEmpty(panel, isEmpty) {
            if (panel) {
                panel.classList.toggle("is-empty", isEmpty);
            }
        }

        function resetTranscriptPlaceholder() {
            transcript.textContent = transcriptPlaceholder;
            transcript.classList.add("iq-demo-placeholder");
            setPanelEmpty(transcriptPanel, true);
        }

        function resetExtractPlaceholder() {
            imagesEl.innerHTML = "";
            if (extractEmpty) {
                extractEmpty.hidden = false;
            }
            setPanelEmpty(extractPanel, true);
        }

        function resetTablePlaceholder() {
            tableBody.innerHTML = "";
            if (table) {
                table.hidden = true;
            }
            if (tableEmpty) {
                tableEmpty.hidden = false;
            }
            setPanelEmpty(pricePanel, true);
        }

        let running = false;
        let paused = false;
        let statusBeforePause = "";
        let timerId = null;
        let typewriterId = null;
        let extractionTimeoutId = null;
        let stepTimeoutId = null;
        let elapsedSeconds = demoData.sceneDuration;
        let pipelineStepIndex = 0;
        let transcribeDone = false;
        let stepEls = pipeline.querySelectorAll(".iq-demo-step");
        let stepWait = { fn: null, remaining: 0, started: 0 };
        let transcribeState = null;
        let extractionState = null;
        let extractionWait = { pending: false, remaining: 0, started: 0 };
        let advancePipeline = null;

        function setPauseUi(isPaused) {
            if (!pauseBtn) return;
            pauseBtn.textContent = isPaused ? "Resume" : "Pause";
            pauseBtn.setAttribute("aria-pressed", isPaused ? "true" : "false");
            stage.classList.toggle("is-paused", isPaused);
        }

        function setControlsRunning(isRunning) {
            processBtn.disabled = isRunning;
            if (pauseBtn) {
                pauseBtn.disabled = !isRunning;
            }
        }

        function clearStepWait() {
            if (stepTimeoutId) {
                window.clearTimeout(stepTimeoutId);
                stepTimeoutId = null;
            }
            stepWait.fn = null;
            stepWait.remaining = 0;
            stepWait.started = 0;
        }

        function beginStepWait(fn, ms) {
            clearStepWait();
            stepWait.fn = fn;
            stepWait.remaining = ms;
            stepWait.started = Date.now();
            if (paused) return;
            stepTimeoutId = window.setTimeout(function () {
                stepTimeoutId = null;
                stepWait.fn = null;
                fn();
            }, ms);
        }

        function pauseStepWait() {
            if (!stepWait.fn) return;
            if (stepTimeoutId) {
                window.clearTimeout(stepTimeoutId);
                stepTimeoutId = null;
            }
            stepWait.remaining = Math.max(
                0,
                stepWait.remaining - (Date.now() - stepWait.started)
            );
        }

        function resumeStepWait() {
            if (!stepWait.fn) return;
            if (stepWait.remaining <= 0) {
                const fn = stepWait.fn;
                stepWait.fn = null;
                fn();
                return;
            }
            stepWait.started = Date.now();
            stepTimeoutId = window.setTimeout(function () {
                stepTimeoutId = null;
                const fn = stepWait.fn;
                stepWait.fn = null;
                fn();
            }, stepWait.remaining);
        }

        function stopTimer() {
            if (timerId) {
                window.clearInterval(timerId);
                timerId = null;
            }
        }

        function stopExtraction() {
            if (extractionTimeoutId) {
                window.clearTimeout(extractionTimeoutId);
                extractionTimeoutId = null;
            }
        }

        function stopTypewriter() {
            if (typewriterId) {
                window.clearTimeout(typewriterId);
                typewriterId = null;
            }
            transcript.classList.remove("is-typing");
        }

        function syncTimer() {
            timerEl.textContent = formatTime(elapsedSeconds);
        }

        function transcribeDuration() {
            return Math.max(4200, demoData.transcript.length * 34);
        }

        function startSceneTimer() {
            stopTimer();
            if (paused) return;
            timerId = window.setInterval(function () {
                if (paused) return;
                elapsedSeconds = Math.min(
                    elapsedSeconds + 1,
                    demoData.sceneDuration
                );
                syncTimer();
                if (elapsedSeconds >= demoData.sceneDuration) {
                    stopTimer();
                }
            }, 180);
        }

        function tickTypewriter() {
            if (!transcribeState || !transcribeState.active || paused) return;

            if (transcribeState.charIndex >= demoData.transcript.length) {
                stopTypewriter();
                transcript.textContent = demoData.transcript;
                transcribeDone = true;
                if (transcribeState.onComplete) {
                    transcribeState.onComplete();
                }
                transcribeState.active = false;
                return;
            }

            transcribeState.charIndex += 1;
            transcript.textContent = demoData.transcript.slice(
                0,
                transcribeState.charIndex
            );
            typewriterId = window.setTimeout(
                tickTypewriter,
                transcribeState.msPerChar
            );
        }

        function startTranscriptAnimation(onComplete) {
            stopTypewriter();
            transcript.textContent = "";
            transcript.classList.remove("iq-demo-placeholder");
            setPanelEmpty(transcriptPanel, false);
            transcript.classList.add("is-typing");

            const msPerChar = Math.max(
                24,
                Math.floor(transcribeDuration() / demoData.transcript.length)
            );

            transcribeState = {
                active: true,
                charIndex: 0,
                msPerChar: msPerChar,
                onComplete: onComplete,
            };
            tickTypewriter();
        }

        function scheduleExtractionDelay() {
            if (!extractionState || !extractionState.active || paused) return;
            extractionTimeoutId = window.setTimeout(function () {
                extractionTimeoutId = null;
                extractionWait.pending = false;
                extractNext();
            }, extractionWait.remaining);
        }

        function extractNext() {
            if (!extractionState || !extractionState.active || paused) return;

            const total = demoData.extractions.length;
            if (extractionState.index >= total) {
                extractionState.active = false;
                extractionWait.pending = false;
                if (extractionState.onComplete) {
                    extractionState.onComplete();
                }
                return;
            }

            const extraction = demoData.extractions[extractionState.index];
            setFocus(focusEl, focusLabel, {
                label: extraction.label,
                imageBox: extraction.imageBox,
                tagBelow: extraction.tagBelow,
            });
            statusEl.textContent =
                "Pulling frame " +
                (extractionState.index + 1) +
                " of " +
                total +
                " — " +
                extraction.name;
            statusBeforePause = statusEl.textContent;

            const thumb = document.createElement("div");
            thumb.className = "iq-demo-thumb";
            thumb.title = extraction.name;
            thumb.innerHTML =
                '<img class="iq-demo-thumb-media" src="' +
                extraction.thumb +
                '" alt="">' +
                "<small>" +
                extraction.name +
                "</small>";
            imagesEl.appendChild(thumb);
            window.requestAnimationFrame(function () {
                thumb.classList.add("is-visible");
            });

            extractionState.index += 1;
            if (extractionState.index >= total) {
                extractionWait.pending = true;
                extractionWait.remaining = demoData.extractionMs;
                extractionWait.started = Date.now();
                scheduleExtractionDelay();
                return;
            }

            extractionWait.pending = true;
            extractionWait.remaining = demoData.extractionMs;
            extractionWait.started = Date.now();
            scheduleExtractionDelay();
        }

        function runExtraction(onComplete) {
            stopExtraction();
            setPanelEmpty(extractPanel, false);
            if (extractEmpty) {
                extractEmpty.hidden = true;
            }
            imagesEl.innerHTML = "";

            extractionState = {
                active: true,
                index: 0,
                onComplete: onComplete,
            };
            extractNext();
        }

        function pauseDemo() {
            if (!running || paused) return;
            paused = true;
            statusBeforePause = statusEl.textContent;
            statusEl.textContent = "Paused.";
            setPauseUi(true);
            pauseStepWait();
            stopTimer();
            if (typewriterId) {
                window.clearTimeout(typewriterId);
                typewriterId = null;
            }
            if (extractionTimeoutId) {
                window.clearTimeout(extractionTimeoutId);
                extractionTimeoutId = null;
            }
            if (extractionWait.pending) {
                extractionWait.remaining = Math.max(
                    0,
                    extractionWait.remaining -
                        (Date.now() - extractionWait.started)
                );
            }
        }

        function resumeDemo() {
            if (!running || !paused) return;
            paused = false;
            statusEl.textContent = statusBeforePause || statusEl.textContent;
            setPauseUi(false);
            startSceneTimer();
            if (transcribeState && transcribeState.active) {
                tickTypewriter();
            }
            if (extractionState && extractionState.active) {
                if (extractionWait.pending) {
                    extractionWait.started = Date.now();
                    scheduleExtractionDelay();
                } else {
                    extractNext();
                }
            }
            if (stepWait.fn) {
                resumeStepWait();
            }
        }

        function togglePause() {
            if (paused) {
                resumeDemo();
            } else {
                pauseDemo();
            }
        }

        function resetDemo() {
            running = false;
            paused = false;
            pipelineStepIndex = 0;
            transcribeDone = false;
            transcribeState = null;
            extractionState = null;
            extractionWait = { pending: false, remaining: 0, started: 0 };
            advancePipeline = null;
            processBtn.textContent = "Run pipeline";
            setControlsRunning(false);
            setPauseUi(false);
            clearStepWait();
            pipeline.querySelectorAll(".iq-demo-step").forEach(function (step) {
                step.classList.remove("is-active", "is-done");
            });
            resetTranscriptPlaceholder();
            resetExtractPlaceholder();
            resetTablePlaceholder();
            statusEl.textContent = "";
            stage.classList.remove("is-processing", "is-complete");
            setFocus(focusEl, focusLabel, null);
            stopTimer();
            stopExtraction();
            stopTypewriter();
            elapsedSeconds = demoData.sceneDuration;
            syncTimer();
        }

        function renderResults() {
            tableBody.innerHTML = demoData.items
                .map(function (item) {
                    return (
                        "<tr><td>" +
                        renderThumb(item.thumb, "iq-demo-cell-thumb") +
                        " " +
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
            setPanelEmpty(pricePanel, false);
            if (tableEmpty) {
                tableEmpty.hidden = true;
            }
            if (table) {
                table.hidden = false;
            }
            statusEl.textContent =
                demoData.items.length + " items priced and ready to export";
            stage.classList.add("is-complete");
            stage.classList.remove("is-processing");
            setFocus(focusEl, focusLabel, null);
            stopTimer();
            stopExtraction();
        }

        function finishPipeline() {
            elapsedSeconds = demoData.sceneDuration;
            syncTimer();
            renderResults();
            running = false;
            paused = false;
            processBtn.disabled = false;
            processBtn.textContent = "Run again";
            if (pauseBtn) {
                pauseBtn.disabled = true;
            }
            setPauseUi(false);
            clearStepWait();
        }

        function nextStep() {
            if (!running || paused) return;

            stopExtraction();

            if (pipelineStepIndex > 0) {
                stepEls[pipelineStepIndex - 1].classList.remove("is-active");
                stepEls[pipelineStepIndex - 1].classList.add("is-done");
            }
            if (pipelineStepIndex >= stepEls.length) {
                finishPipeline();
                return;
            }

            stepEls[pipelineStepIndex].classList.add("is-active");
            statusEl.textContent = demoData.statusByStep[pipelineStepIndex];
            statusBeforePause = statusEl.textContent;

            const current = pipelineStepIndex;
            pipelineStepIndex += 1;

            if (current === 0) {
                setFocus(focusEl, focusLabel, null);
                transcribeDone = false;
                startTranscriptAnimation(function () {
                    transcribeDone = true;
                });
                beginStepWait(function () {
                    if (!transcribeDone) {
                        stopTypewriter();
                        transcript.textContent = demoData.transcript;
                        transcribeDone = true;
                    }
                    nextStep();
                }, transcribeDuration() + 250);
                return;
            }

            if (current === 1) {
                runExtraction(function () {
                    nextStep();
                });
                return;
            }

            if (current === 2) {
                setFocus(focusEl, focusLabel, demoData.focusSteps[0]);
                beginStepWait(nextStep, 1100);
                return;
            }

            beginStepWait(nextStep, 1100);
        }

        function runPipeline() {
            if (running) return;
            running = true;
            paused = false;
            processBtn.textContent = "Running…";
            setControlsRunning(true);
            setPauseUi(false);
            resetTranscriptPlaceholder();
            resetExtractPlaceholder();
            resetTablePlaceholder();
            transcript.textContent = "";
            transcript.classList.remove("iq-demo-placeholder");
            stage.classList.add("is-processing");
            stage.classList.remove("is-complete");
            elapsedSeconds = 0;
            syncTimer();
            stopTimer();
            stopExtraction();
            stopTypewriter();
            clearStepWait();
            pipelineStepIndex = 0;
            transcribeDone = false;
            transcribeState = null;
            extractionState = null;
            extractionWait = { pending: false, remaining: 0, started: 0 };
            advancePipeline = nextStep;
            startSceneTimer();

            stepEls.forEach(function (step) {
                step.classList.remove("is-active", "is-done");
            });
            nextStep();
        }

        processBtn.addEventListener("click", runPipeline);
        if (pauseBtn) {
            pauseBtn.addEventListener("click", togglePause);
        }
        resetDemo();
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".iq-demo").forEach(initDemo);
    });
})();
