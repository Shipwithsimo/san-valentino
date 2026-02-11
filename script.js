const NO_MESSAGES_IT = [
    "Ne sei davvero sicura?",
    "Pensaci ancora un secondo...",
    "Prometto una serata bellissima.",
    "Dai, non lasciarmi in sospeso.",
    "Se dici no, mi spezzi il cuore.",
    "Ultima possibilita: riprova con il si.",
    "Ok, resto qui ad aspettare il tuo si."
];

const DESKTOP_MAX_YES_SCALE = 1.8;
const MOBILE_MAX_YES_SCALE = 1.35;
const YES_SCALE_STEP = 0.12;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_BREAKPOINT_QUERY = "(max-width: 680px)";
const EVASIVE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const EVASION_TRIGGER_DISTANCE = 120;
const EVASION_SAFE_DISTANCE = 100;
const EVASION_STEP_MIN = 24;
const EVASION_STEP_MAX = 54;
const EVASION_FORCED_STEP = 58;
const EVASION_HITBOX_PADDING = 12;
const EVASION_MAX_OFFSET_X = 92;
const EVASION_MAX_OFFSET_Y = 56;
const EVASION_COOLDOWN_MS = 24;
const NO_BUTTON_POINTER_LOCK_MS = 180;
const EVASION_PADDING = 8;
const NO_BUTTON_SAFE_GAP_FROM_YES = 10;
const HERO_GIF_RESET_MS = 900;
const NO_BUTTON_PUNCH_THRESHOLD = 8;
const NO_BUTTON_ATTEMPT_COOLDOWN_MS = 220;
const PUNCH_OVERLAY_DURATION_MS = 1150;
const PUNCH_OVERLAY_COOLDOWN_MS = 2200;

let messageIndex = 0;
let currentYesScale = 1;
let noOffset = { x: 0, y: 0 };
let lastEvasionAt = 0;
let noButtonPointerLockTimer = null;
let heroGifResetTimer = null;
let heroGifs = null;
let noButtonAttemptCount = 0;
let lastNoButtonAttemptAt = 0;
let punchOverlayHideTimer = null;
let punchOverlayCooldownTimer = null;
let punchOverlayLocked = false;
let punchElements = null;
let audioUnlocked = false;

function motionAllowed() {
    return !window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function currentMaxScale() {
    return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches ? MOBILE_MAX_YES_SCALE : DESKTOP_MAX_YES_SCALE;
}

function evasiveModeEnabled() {
    return motionAllowed() && window.matchMedia(EVASIVE_POINTER_QUERY).matches;
}

function applyYesScale(yesButton, scale) {
    currentYesScale = scale;
    yesButton.style.setProperty("--yes-scale", String(currentYesScale));
}

function setNoOffset(noButton, x, y) {
    noOffset = { x, y };
    noButton.style.setProperty("--no-tx", `${x}px`);
    noButton.style.setProperty("--no-ty", `${y}px`);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function pointInsideRect(x, y, rect, padding = 0) {
    return (
        x >= rect.left - padding &&
        x <= rect.right + padding &&
        y >= rect.top - padding &&
        y <= rect.bottom + padding
    );
}

function distancePointToRect(x, y, rect) {
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    return Math.hypot(dx, dy);
}

function getHeroGifs() {
    if (heroGifs) {
        return heroGifs;
    }

    const defaultGif = document.querySelector("#hero-gif-default");
    const alertGif = document.querySelector("#hero-gif-alert");

    if (!defaultGif || !alertGif) {
        return null;
    }

    heroGifs = { defaultGif, alertGif };
    return heroGifs;
}

function getPunchElements() {
    if (punchElements) {
        return punchElements;
    }

    const overlay = document.querySelector("#punch-overlay");
    const overlayImage = overlay ? overlay.querySelector(".punch-gif") : null;
    const audio = document.querySelector("#punch-audio");

    if (!overlay || !overlayImage) {
        return null;
    }

    punchElements = { overlay, overlayImage, audio };
    return punchElements;
}

function setHeroGifState(state) {
    const gifs = getHeroGifs();

    if (!gifs) {
        return;
    }

    const showAlert = state === "alert";
    gifs.defaultGif.classList.toggle("is-visible", !showAlert);
    gifs.alertGif.classList.toggle("is-visible", showAlert);
}

function triggerNoButtonGifReaction() {
    setHeroGifState("alert");

    if (heroGifResetTimer) {
        clearTimeout(heroGifResetTimer);
    }

    heroGifResetTimer = window.setTimeout(() => {
        setHeroGifState("default");
        heroGifResetTimer = null;
    }, HERO_GIF_RESET_MS);
}

function resetHeroGifToDefault() {
    if (heroGifResetTimer) {
        clearTimeout(heroGifResetTimer);
        heroGifResetTimer = null;
    }

    setHeroGifState("default");
}

function hidePunchOverlay() {
    const elements = getPunchElements();

    if (!elements) {
        return;
    }

    // Stop audio FIRST
    if (elements.audio && !elements.audio.paused) {
        elements.audio.pause();
        elements.audio.currentTime = 0;
    }

    // Then hide overlay
    elements.overlay.classList.remove("is-active");
    elements.overlay.setAttribute("aria-hidden", "true");
}

function unlockAudio() {
    if (audioUnlocked) {
        return;
    }

    const elements = getPunchElements();

    if (elements && elements.audio) {
        // Function to actually unlock once audio is ready
        const doUnlock = () => {
            elements.audio.volume = 0.01; // Very low volume for unlock
            elements.audio.muted = false;

            const unlockPromise = elements.audio.play();

            if (unlockPromise && typeof unlockPromise.then === "function") {
                unlockPromise.then(() => {
                    elements.audio.pause();
                    elements.audio.currentTime = 0;
                    elements.audio.volume = 1.0;
                    audioUnlocked = true;
                    console.log("Audio unlocked successfully");
                }).catch((error) => {
                    console.warn("Could not unlock audio:", error);
                });
            }
        };

        // If audio is already loaded, unlock immediately
        if (elements.audio.readyState >= 2) {
            doUnlock();
        } else {
            // Wait for audio to be loaded
            elements.audio.addEventListener('canplay', doUnlock, { once: true });
        }
    }
}

function triggerPunchOverlay() {
    if (punchOverlayLocked) {
        return;
    }

    const elements = getPunchElements();

    if (!elements) {
        return;
    }

    punchOverlayLocked = true;

    // Start audio FIRST, before showing overlay
    if (elements.audio) {
        console.log("🎵 Attempting to play punch audio...");

        // CRITICAL: Unlock audio if not already unlocked
        // This must happen synchronously in the user gesture context
        if (!audioUnlocked) {
            console.log("🔓 Unlocking audio context...");
            try {
                // Force a synchronous play to unlock the audio context
                elements.audio.volume = 0.01;
                elements.audio.play();
                elements.audio.pause();
                elements.audio.currentTime = 0;
                elements.audio.volume = 1.0;
                audioUnlocked = true;
                console.log("✅ Audio context unlocked");
            } catch (e) {
                console.warn("⚠️ Could not unlock audio:", e);
            }
        }

        try {
            // Now play the actual audio
            elements.audio.currentTime = 0;
            elements.audio.volume = 1.0;
            elements.audio.muted = false;

            // Play audio synchronously
            const playback = elements.audio.play();

            if (playback && typeof playback.then === "function") {
                playback.then(() => {
                    console.log("✅ Audio playing successfully!");
                }).catch((error) => {
                    console.error("❌ Audio playback failed:", error.message);
                });
            }
        } catch (error) {
            console.error("❌ Audio playback error:", error);
        }
    }

    // Show overlay
    elements.overlay.classList.add("is-active");
    elements.overlay.setAttribute("aria-hidden", "false");

    if (punchOverlayHideTimer) {
        clearTimeout(punchOverlayHideTimer);
    }

    punchOverlayHideTimer = window.setTimeout(() => {
        hidePunchOverlay();
        punchOverlayHideTimer = null;
    }, PUNCH_OVERLAY_DURATION_MS);

    if (punchOverlayCooldownTimer) {
        clearTimeout(punchOverlayCooldownTimer);
    }

    punchOverlayCooldownTimer = window.setTimeout(() => {
        punchOverlayLocked = false;
        punchOverlayCooldownTimer = null;
    }, PUNCH_OVERLAY_COOLDOWN_MS);
}

function registerNoButtonAttempt() {
    const now = Date.now();

    if (now - lastNoButtonAttemptAt < NO_BUTTON_ATTEMPT_COOLDOWN_MS) {
        return;
    }

    lastNoButtonAttemptAt = now;
    noButtonAttemptCount += 1;

    if (noButtonAttemptCount >= NO_BUTTON_PUNCH_THRESHOLD) {
        noButtonAttemptCount = 0;
        triggerPunchOverlay();
    }
}

function lockNoButtonPointer(noButton) {
    noButton.style.pointerEvents = "none";

    if (noButtonPointerLockTimer) {
        clearTimeout(noButtonPointerLockTimer);
    }

    noButtonPointerLockTimer = window.setTimeout(() => {
        noButton.style.pointerEvents = "";
    }, NO_BUTTON_POINTER_LOCK_MS);
}

function clampNoOffsetToContainer(nextX, nextY, containerRect, buttonRect, yesButtonRect = null) {
    const baseLeft = buttonRect.left - noOffset.x;
    const baseTop = buttonRect.top - noOffset.y;

    let minAllowedLeft = containerRect.left + EVASION_PADDING;

    if (yesButtonRect) {
        minAllowedLeft = Math.max(minAllowedLeft, yesButtonRect.right + NO_BUTTON_SAFE_GAP_FROM_YES);
    }

    const minX = minAllowedLeft - baseLeft;
    const maxX = containerRect.right - buttonRect.width - EVASION_PADDING - baseLeft;
    const minY = containerRect.top + EVASION_PADDING - baseTop;
    const maxY = containerRect.bottom - buttonRect.height - EVASION_PADDING - baseTop;

    return {
        x: clamp(nextX, minX, maxX),
        y: clamp(nextY, minY, maxY)
    };
}

function rectForOffset(baseLeft, baseTop, width, height, offsetX, offsetY) {
    return {
        left: baseLeft + offsetX,
        right: baseLeft + offsetX + width,
        top: baseTop + offsetY,
        bottom: baseTop + offsetY + height
    };
}

function evadeNoButtonFromPointer(clientX, clientY, forcedStep = null) {
    const container = document.querySelector(".buttons");
    const noButton = document.querySelector(".no-button");
    const yesButton = document.querySelector(".yes-button");

    if (!container || !noButton) {
        return false;
    }

    const containerRect = container.getBoundingClientRect();
    const buttonRect = noButton.getBoundingClientRect();
    const yesButtonRect = yesButton ? yesButton.getBoundingClientRect() : null;
    const baseLeft = buttonRect.left - noOffset.x;
    const baseTop = buttonRect.top - noOffset.y;
    const currentDistanceToButton = distancePointToRect(clientX, clientY, buttonRect);

    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    const dx = centerX - clientX;
    const dy = centerY - clientY;
    const distance = Math.hypot(dx, dy);
    const pointerOnOrNearButton = pointInsideRect(clientX, clientY, buttonRect, EVASION_HITBOX_PADDING);
    const pointerInsideButton = pointInsideRect(clientX, clientY, buttonRect, 0);

    if (forcedStep === null && !pointerOnOrNearButton && currentDistanceToButton >= EVASION_TRIGGER_DISTANCE) {
        return false;
    }

    const intensity = clamp((EVASION_TRIGGER_DISTANCE - distance) / EVASION_TRIGGER_DISTANCE, 0, 1);
    let step = forcedStep === null ? EVASION_STEP_MIN + (EVASION_STEP_MAX - EVASION_STEP_MIN) * intensity : forcedStep;

    if (pointerInsideButton) {
        step = Math.max(step, EVASION_FORCED_STEP);
    }

    let normX = dx / Math.max(distance, 1);
    let normY = dy / Math.max(distance, 1);

    if (distance < 1) {
        const angle = Math.random() * Math.PI * 2;
        normX = Math.cos(angle);
        normY = Math.sin(angle);
    }

    const pushCandidate = {
        x: clamp(noOffset.x + normX * step, -EVASION_MAX_OFFSET_X, EVASION_MAX_OFFSET_X),
        y: clamp(noOffset.y + normY * step, -EVASION_MAX_OFFSET_Y, EVASION_MAX_OFFSET_Y)
    };

    const candidateOffsets = [
        pushCandidate,
        { x: EVASION_MAX_OFFSET_X, y: EVASION_MAX_OFFSET_Y },
        { x: EVASION_MAX_OFFSET_X, y: -EVASION_MAX_OFFSET_Y },
        { x: -EVASION_MAX_OFFSET_X, y: EVASION_MAX_OFFSET_Y },
        { x: -EVASION_MAX_OFFSET_X, y: -EVASION_MAX_OFFSET_Y },
        { x: EVASION_MAX_OFFSET_X, y: 0 },
        { x: -EVASION_MAX_OFFSET_X, y: 0 },
        { x: 0, y: EVASION_MAX_OFFSET_Y },
        { x: 0, y: -EVASION_MAX_OFFSET_Y }
    ];

    let bestOffset = noOffset;
    let bestDistance = currentDistanceToButton;

    for (const candidate of candidateOffsets) {
        const bounded = clampNoOffsetToContainer(candidate.x, candidate.y, containerRect, buttonRect, yesButtonRect);
        const rect = rectForOffset(baseLeft, baseTop, buttonRect.width, buttonRect.height, bounded.x, bounded.y);
        const distanceToCandidate = distancePointToRect(clientX, clientY, rect);

        if (distanceToCandidate > bestDistance) {
            bestDistance = distanceToCandidate;
            bestOffset = bounded;
        }
    }

    const mustEvade = pointerInsideButton || pointerOnOrNearButton || currentDistanceToButton < EVASION_SAFE_DISTANCE;

    if (!mustEvade && bestDistance <= currentDistanceToButton) {
        return false;
    }

    setNoOffset(noButton, bestOffset.x, bestOffset.y);
    lockNoButtonPointer(noButton);
    lastEvasionAt = Date.now();
    return true;
}

function evadeOnDirectTarget(event) {
    if (!evasiveModeEnabled()) {
        return;
    }

    registerNoButtonAttempt();
    triggerNoButtonGifReaction();

    if (Date.now() - lastEvasionAt < EVASION_COOLDOWN_MS) {
        return;
    }

    evadeNoButtonFromPointer(event.clientX, event.clientY, EVASION_FORCED_STEP);
}

function evadeOnApproach(event) {
    if (!evasiveModeEnabled()) {
        return;
    }

    const noButton = document.querySelector(".no-button");

    if (!noButton) {
        return;
    }

    const rect = noButton.getBoundingClientRect();
    const isNearNoButton = pointInsideRect(event.clientX, event.clientY, rect, EVASION_TRIGGER_DISTANCE);

    if (!isNearNoButton) {
        return;
    }

    if (Date.now() - lastEvasionAt < EVASION_COOLDOWN_MS) {
        return;
    }

    const moved = evadeNoButtonFromPointer(event.clientX, event.clientY);

    if (moved) {
        registerNoButtonAttempt();
        triggerNoButtonGifReaction();
    }
}

function blockNoButtonMouseClick(event) {
    if (!evasiveModeEnabled() || event.detail === 0) {
        return;
    }

    registerNoButtonAttempt();
    triggerNoButtonGifReaction();
    event.preventDefault();
    event.stopImmediatePropagation();
    evadeNoButtonFromPointer(event.clientX, event.clientY, EVASION_FORCED_STEP);
}

function resetNoButtonPosition() {
    const noButton = document.querySelector(".no-button");

    if (!noButton) {
        return;
    }

    if (noOffset.x !== 0 || noOffset.y !== 0) {
        setNoOffset(noButton, 0, 0);
    }
}

function initNoButtonEvasion() {
    const noButton = document.querySelector(".no-button");
    const yesButton = document.querySelector(".yes-button");
    const gifs = getHeroGifs();

    if (!noButton) {
        return;
    }

    if (gifs) {
        const preload = new Image();
        preload.src = gifs.alertGif.getAttribute("src") || "";
    }

    const punch = getPunchElements();

    if (punch) {
        const punchPreload = new Image();
        punchPreload.src = punch.overlayImage.getAttribute("src") || "";

        if (punch.audio) {
            punch.audio.load();
        }
    }

    // Unlock audio on first user interaction - MUST be synchronous
    const unlockOnce = () => {
        if (audioUnlocked) {
            return;
        }

        if (punch && punch.audio) {
            // Try immediate unlock
            punch.audio.volume = 0.01;
            const playPromise = punch.audio.play();

            if (playPromise && typeof playPromise.then === "function") {
                playPromise.then(() => {
                    punch.audio.pause();
                    punch.audio.currentTime = 0;
                    punch.audio.volume = 1.0;
                    audioUnlocked = true;
                    console.log("✅ Audio unlocked on first interaction");
                }).catch((error) => {
                    console.warn("⚠️ Could not unlock audio on this interaction:", error.message);
                });
            }
        }
    };

    // Add listeners that will try to unlock on any interaction
    document.addEventListener("click", unlockOnce, { passive: true });
    document.addEventListener("touchstart", unlockOnce, { passive: true });
    document.addEventListener("keydown", unlockOnce, { passive: true });

    noButton.addEventListener("focus", resetNoButtonPosition);
    document.addEventListener("mousemove", evadeOnApproach, { passive: true });
    noButton.addEventListener("pointerenter", evadeOnDirectTarget);
    noButton.addEventListener("pointermove", evadeOnDirectTarget);
    noButton.addEventListener("pointerdown", evadeOnDirectTarget);
    noButton.addEventListener("click", blockNoButtonMouseClick, true);

    if (yesButton) {
        yesButton.addEventListener("click", handleYesClick);
        yesButton.addEventListener("pointerenter", resetHeroGifToDefault);
        yesButton.addEventListener("focus", resetHeroGifToDefault);
    }
}

function refreshPulse(button, className) {
    if (!motionAllowed()) {
        return;
    }

    button.classList.remove(className);
    // Force reflow so animation can restart.
    void button.offsetWidth;
    button.classList.add(className);
}

function handleNoClick(event) {
    // Prevent double-firing on touch devices
    if (event && event.type === 'touchend') {
        event.preventDefault();
    }

    const noButton = document.querySelector(".no-button");
    const yesButton = document.querySelector(".yes-button");
    const feedback = document.querySelector("#no-feedback");

    if (!noButton || !yesButton) {
        return;
    }

    // Unlock audio on first interaction
    unlockAudio();

    registerNoButtonAttempt();

    noButton.textContent = NO_MESSAGES_IT[messageIndex];
    messageIndex = (messageIndex + 1) % NO_MESSAGES_IT.length;

    const nextScale = Math.min(currentMaxScale(), +(currentYesScale + YES_SCALE_STEP).toFixed(2));
    applyYesScale(yesButton, nextScale);
    refreshPulse(yesButton, "pulse");

    if (feedback) {
        feedback.textContent = `Messaggio aggiornato. Intensita del pulsante si: ${Math.round(currentYesScale * 100)}%.`;
    }
}

function handleYesClick() {
    resetHeroGifToDefault();
    hidePunchOverlay();
    window.location.href = "yes_page.html";
}

function syncScaleOnResize() {
    const yesButton = document.querySelector(".yes-button");

    if (!yesButton) {
        return;
    }

    if (currentYesScale > currentMaxScale()) {
        applyYesScale(yesButton, currentMaxScale());
    }

    if (!evasiveModeEnabled()) {
        resetNoButtonPosition();
    }
}

window.addEventListener("resize", syncScaleOnResize);
initNoButtonEvasion();
resetHeroGifToDefault();
