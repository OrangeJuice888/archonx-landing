const host = document.querySelector("[data-consulting-orb]");

if (host) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: true });
    host.appendChild(canvas);

    let size = 0;
    let dpr = 1;
    let points = [];
    let frameId = 0;
    let lastFrame = 0;
    let isVisible = true;
    let spin = 0;

    const target = { x: -0.18, y: 0.2 };
    const current = { x: -0.18, y: 0.2 };
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frameInterval = 1000 / 24;

    const createPoints = () => {
        const count = size < 330 ? 340 : 520;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));

        points = Array.from({ length: count }, (_, i) => {
            const y = 1 - (i / (count - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = goldenAngle * i;

            return {
                x: Math.cos(theta) * radius,
                y,
                z: Math.sin(theta) * radius
            };
        });
    };

    const resize = () => {
        size = Math.max(220, Math.round(host.getBoundingClientRect().width));
        dpr = Math.min(window.devicePixelRatio || 1, 1.25);

        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr);
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        createPoints();
        draw();
    };

    const setPointerTarget = (clientX, clientY) => {
        const rect = host.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((clientY - rect.top) / rect.height - 0.5) * 2;

        target.y = x * 0.42;
        target.x = -0.18 + y * 0.28;
    };

    const hero = host.closest(".consulting-hero");

    hero?.addEventListener("pointermove", (event) => {
        setPointerTarget(event.clientX, event.clientY);
    }, { passive: true });

    hero?.addEventListener("pointerleave", () => {
        target.x = -0.18;
        target.y = 0.2;
    });

    const draw = () => {
        const center = size / 2;
        const radius = size * 0.36;
        const cosX = Math.cos(current.x);
        const sinX = Math.sin(current.x);
        const cosY = Math.cos(spin + current.y);
        const sinY = Math.sin(spin + current.y);

        ctx.clearRect(0, 0, size, size);

        ctx.strokeStyle = "rgba(29, 29, 31, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(center, center, radius * 1.04, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(center, center, radius * 1.04, radius * 0.26, 0.08, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 113, 227, 0.10)";
        ctx.stroke();

        for (const point of points) {
            const y1 = point.y * cosX - point.z * sinX;
            const z1 = point.y * sinX + point.z * cosX;
            const x2 = point.x * cosY + z1 * sinY;
            const z2 = -point.x * sinY + z1 * cosY;
            const depth = (z2 + 1) / 2;
            const px = center + x2 * radius;
            const py = center + y1 * radius;
            const dot = 0.65 + depth * 1.05;

            ctx.globalAlpha = 0.18 + depth * 0.58;
            ctx.fillStyle = "rgb(29, 45, 56)";
            ctx.fillRect(px, py, dot, dot);
        }

        ctx.globalAlpha = 1;
    };

    const tick = (time = 0) => {
        if (time - lastFrame >= frameInterval) {
            lastFrame = time;
            current.x += (target.x - current.x) * 0.08;
            current.y += (target.y - current.y) * 0.08;
            spin += 0.006;
            draw();
        }

        if (isVisible) {
            frameId = requestAnimationFrame(tick);
        }
    };

    const start = () => {
        if (prefersReducedMotion || frameId) return;
        isVisible = true;
        frameId = requestAnimationFrame(tick);
    };

    const stop = () => {
        isVisible = false;
        if (frameId) {
            cancelAnimationFrame(frameId);
            frameId = 0;
        }
    };

    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !document.hidden) {
            start();
        } else {
            stop();
        }
    }, { threshold: 0.05 });

    observer.observe(host);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });

    resize();
    window.addEventListener("resize", resize, { passive: true });

    if (prefersReducedMotion) {
        draw();
    } else {
        start();
    }
}
