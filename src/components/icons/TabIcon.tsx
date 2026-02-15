import React from "react";
import Svg, { Path } from "react-native-svg";

import { D_VALUES } from "@/src/data/icons";

interface TabIconProps {
  name: keyof typeof D_VALUES;
  color: string;
  size?: number;
  focused?: boolean;
}

/**
 * **Tab Bar Icon Component**
 *
 * A specialized SVG renderer designed for the application's bottom navigation.
 * It handles the visual transition between "Active" (Filled) and "Inactive" (Outlined) states.
 *
 * **Key Logic:**
 * - **Standard Icons:** Render as an outline (`stroke`) when inactive, and solid (`fill`) when focused.
 * - **Menu Icon:** Always renders as a stroke (hamburger menu style).
 * - **Create Icon:** Contains special logic to invert colors for the inner "Plus" sign when active.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {keyof typeof D_VALUES} props.name - The unique identifier for the icon path (must exist in `D_VALUES`).
 * @param {string} props.color - The tint color passed by the Tab Navigator (Active/Inactive color).
 * @param {number} [props.size=28] - The width and height of the icon in pixels. Defaults to 28.
 * @param {boolean} [props.focused=false] - Determines if the tab is currently selected, triggering the Fill style.
 *
 * @returns {JSX.Element | null} The rendered SVG icon or null if the path is invalid.
 */
export const TabIcon = ({
  name,
  color,
  size = 28,
  focused = false,
}: TabIconProps) => {
  const paths = D_VALUES[name];

  if (!paths) return null;

  // 1. Identify Icon Type
  const isMenu = name === "menu";
  const isCreate = name === "create";

  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {paths.map((d, index) => {
        // --- COLOR LOGIC START ---

        // A. STROKE COLOR (Outline)
        // If it's Menu: Always stroke with color.
        // If it's Others: Stroke ONLY when inactive (to show outline).
        let strokeColor = isMenu ? color : focused ? "none" : color;

        // B. FILL COLOR (Body)
        // If it's Menu: Never fill.
        // If it's Others: Fill ONLY when focused (Active).
        let fillColor = isMenu ? "none" : focused ? color : "none";

        // C. SPECIAL CASE: Create Button (Plus Sign)
        // The Plus sign is the 2nd path (index 1) of the 'create' icon.
        if (isCreate && index === 1) {
          if (focused) {
            fillColor = "#FFFFFF"; // Active: White Plus on Teal Box
            strokeColor = "none";
          } else {
            fillColor = "none"; // Inactive: Hollow Plus
            strokeColor = color; // Gray Outline
          }
        }

        // --- COLOR LOGIC END ---

        return (
          <Path
            key={index}
            d={d}
            fill={fillColor}
            fillRule="evenodd"
            clipRule="evenodd"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
};
