import React, { memo } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";

// Adjust import path based on your project structure (Global vs Feature)
import { colors } from "@/constants/theme";
import { TabIcon } from "@/src/components/icons/TabIcon";
import { ALL_COUNTRIES, Country } from "@/src/features/auth/data/countries";

// --- SUB-COMPONENTS ---

interface CountrySelectorBtnProps {
  /** The currently selected country object */
  selected: Country;
  /** Callback to open the modal */
  onPress: () => void;
}

/**
 * The trigger button that displays the flag and dial code.
 * Used in the Phone Number input field.
 *
 * @param {CountrySelectorBtnProps} props - Component properties.
 * @returns {JSX.Element} The touchable button with flag and code.
 */
export const CountrySelectorBtn = ({
  selected,
  onPress,
}: CountrySelectorBtnProps) => (
  <TouchableOpacity
    accessibilityRole="button"
    onPress={onPress}
    activeOpacity={0.7}
    className="mr-3 h-[52px] flex-row items-center rounded-xl border border-neutral-light bg-surface px-3"
  >
    <Text className="mr-2 text-2xl">{selected.flag}</Text>
    <Text className="text-base font-bold text-neutral">
      {selected.dialCode}
    </Text>
    <TabIcon name="chevronDown" size={14} color={colors.neutral.gray} />
  </TouchableOpacity>
);

interface CountryPickerModalProps {
  /** Controls visibility of the modal */
  visible: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Function called when a user taps a country */
  onSelect: (country: Country) => void;
}

/**
 * A specific modal to select a country from the supported list.
 * * Uses FlatList for performance optimization with large lists.
 */
export const CountryPickerModal = memo(
  ({ visible, onClose, onSelect }: CountryPickerModalProps) => {
    const renderItem = ({ item }: { item: Country }) => (
      <TouchableOpacity
        accessibilityRole="button"
        className="flex-row items-center border-b border-surface-gray py-4 active:bg-surface-gray"
        onPress={() => {
          onSelect(item);
          onClose();
        }}
      >
        <Text className="mr-4 text-3xl">{item.flag}</Text>

        <Text className="flex-1 text-base font-semibold text-neutral">
          {item.name}
        </Text>

        <Text className="font-bold text-neutral-gray">{item.dialCode}</Text>
      </TouchableOpacity>
    );

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="h-[70%] rounded-t-3xl bg-surface p-4">
            {/* Header */}
            <View className="mb-2 flex-row items-center justify-between border-b border-surface-gray pb-4">
              <Text className="text-xl font-bold text-neutral">
                Select Country
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close country picker"
                accessibilityHint="Closes the country selection modal"
                onPress={onClose}
                className="p-1"
              >
                <TabIcon
                  name="close"
                  size={24}
                  color={colors.neutral.DEFAULT}
                />
              </TouchableOpacity>
            </View>

            {/* List - Optimized with FlatList */}
            <FlatList
              data={ALL_COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              initialNumToRender={15}
              maxToRenderPerBatch={20}
              windowSize={5}
              contentContainerClassName="pb-10"
            />
          </View>
        </View>
      </Modal>
    );
  },
);

CountryPickerModal.displayName = "CountryPickerModal";
