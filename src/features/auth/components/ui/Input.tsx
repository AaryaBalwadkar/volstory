import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

import { colors } from "@/constants/theme";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

/**
 * **Generic Labeled Input**
 *
 * A flexible text input component that includes an optional label and error message display.
 * It is designed for general use cases where a label is required above the field.
 *
 * **Key Features:**
 * - **Layout:** Stacks content vertically: Label -> Input -> Error Message.
 * - **Visual Feedback:** Automatically applies red styling (border & background) when an `error` is present.
 * - **Focus State:** Defaults to a blue border on focus (overridden by error state).
 *
 * @component
 * @example
 * <Input
 * label="Username"
 * placeholder="Enter username"
 * error={errors.username}
 * onChangeText={setName}
 * />
 *
 * @param {Props} props - Extended TextInput properties.
 * @returns {JSX.Element} The complete input block with label and validation text.
 */
export const Input: React.FC<Props> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <View className="mb-4 w-full">
      {label && (
        <Text className="mb-1.5 ml-1 font-medium text-neutral-dark">
          {label}
        </Text>
      )}
      <TextInput
        className={`w-full rounded-xl border border-neutral-lightest bg-surface-gray px-4 py-3.5 text-base text-neutral ${
          error ? "border-error bg-error/10" : "focus:border-primary"
        } ${className}`}
        placeholderTextColor={colors.neutral.light}
        {...props}
      />
      {error && <Text className="ml-1 mt-1 text-xs text-error">{error}</Text>}
    </View>
  );
};
