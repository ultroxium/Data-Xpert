import { useState } from "react";

// Define the custom hook
export function useChartConfigHook() {
    const [gridOn, setGridOn] = useState(true); 
    const [borderOn, setBorderOn] = useState(true); // Default to false for border
    const [shadowOn, setShadowOn] = useState(false); // Default to false for shadow
    // Return the state values and setters
    return {
        gridOn,
        setGridOn,
        borderOn,
        setBorderOn,
        shadowOn,
        setShadowOn
    };
}
