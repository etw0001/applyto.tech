import { useState, useEffect, useRef } from "react";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
}

export default function AnimatedCounter({ value, duration = 1 }: AnimatedCounterProps) {
    const [count, setCount] = useState(value);
    const prevValueRef = useRef(value);

    useEffect(() => {
        // If value hasn't changed, don't animate
        if (value === prevValueRef.current) {
            return;
        }

        const startValue = prevValueRef.current;
        const endValue = value;
        const difference = endValue - startValue;

        // Update the ref immediately
        prevValueRef.current = value;

        // If the difference is 0, just set the value
        if (difference === 0) {
            setCount(value);
            return;
        }

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const currentCount = Math.floor(startValue + (difference * progress));
            setCount(currentCount);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                // Ensure we end at the exact value
                setCount(endValue);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <span>{count}</span>;
}
