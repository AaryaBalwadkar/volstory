import React, { useMemo, useRef, useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { colors } from "@/constants/theme";

import { useCreateEventStore } from "../../stores/createEvent.store";
import type { SkillGroup, TimeSlot } from "../../types/event.types";
import {
  deriveEventCapacity,
  withDerivedSlotCapacity,
} from "../../utils/capacity";
import { SkillGroupBottomSheet } from "../skillGroup/SkillGroupBottomSheet";

/**
 * A standard set of volunteer benefits/perks options displayed to event creators.
 */
const PRESET_PERKS = [
  "Certificate",
  "Meals",
  "Stipend",
  "Conveyance",
  "Snacks",
  "Water",
];

/**
 * A visually styled read-only counter component used to represent computed participation statistics
 * (minimum and maximum volunteers allowed/required).
 *
 * @param props The component props.
 * @param props.label The label string descriptive of what is being counted (e.g. "Min" or "Max").
 * @param props.value The numeric value to render.
 * @returns {React.JSX.Element} A static counter row with styled control buttons.
 */
const ReadOnlyCounter = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <View className="flex-row items-center">
    <Text className="mr-2 font-nunito text-[12px] text-neutral-light">
      {label}
    </Text>
    <View className="h-8 w-8 items-center justify-center rounded-l-md border border-r-0 border-neutral-lightest bg-surface-gray">
      <Ionicons name="remove" size={16} color={colors.primary.DEFAULT} />
    </View>
    <View className="h-8 min-w-[42px] items-center justify-center border border-neutral-lightest bg-white px-2">
      <Text className="font-nunito text-[13px] text-neutral">{value}</Text>
    </View>
    <View className="h-8 w-8 items-center justify-center rounded-r-md border border-l-0 border-neutral-lightest bg-surface-gray">
      <Ionicons name="add" size={16} color={colors.primary.DEFAULT} />
    </View>
  </View>
);

/**
 * Step3Participation is a wizard step component collecting participation, capacity, and benefits details:
 * - Minimum & Maximum participants limits (calculated automatically based on shift capacities)
 * - Required skills list (summarized from added skill groups)
 * - Skill groups configuration mapping (allows creating separate groups with specialized roles per shift)
 * - Participant benefits/perks selection (preset list selectable toggle buttons)
 * - Access request mode ("Join by Request" switch toggle)
 *
 * @returns {React.JSX.Element} A ScrollView layout containing the participation and capacity fields.
 */
export function Step3Participation() {
  const { formData, updateData } = useCreateEventStore();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [showPerks, setShowPerks] = useState(formData.perks.length > 0);
  const [editing, setEditing] = useState<{
    slotId: string;
    group: SkillGroup;
  } | null>(null);

  const derived = useMemo(() => deriveEventCapacity(formData), [formData]);

  /**
   * Recalculates slot capacities and event-wide totals, then persists them to the global store.
   * Maps slot skill groups to calculate derived minimum/maximum limits and compile all required skill tags.
   *
   * @param {TimeSlot[]} slots The list of timeslots with potentially updated skill groups.
   * @returns {void}
   */
  const persistSlots = (slots: TimeSlot[]) => {
    const derivedSlots = slots.map(withDerivedSlotCapacity);
    const next = deriveEventCapacity({ ...formData, slots: derivedSlots });
    updateData({
      slots: derivedSlots,
      minParticipants: next.minParticipants,
      maxParticipants: next.maxParticipants,
      skills: next.skills,
    });
  };

  /**
   * Saves or updates a {@link SkillGroup} configuration inside a specific {@link TimeSlot}.
   * Filters out any preexisting group instance by ID, inserts the new group object, updates the store,
   * and closes the bottom sheet.
   *
   * @param {string} slotId The unique ID of the target timeslot.
   * @param {SkillGroup} group The skill group configuration to add or update.
   * @returns {void}
   */
  const handleSaveGroup = (slotId: string, group: SkillGroup) => {
    const slots = formData.slots.map((slot) => {
      const cleanGroups = (slot.skillGroups || []).filter(
        (g) => g.id !== group.id,
      );
      return slot.id === slotId
        ? { ...slot, skillGroups: [...cleanGroups, group] }
        : { ...slot, skillGroups: cleanGroups };
    });
    persistSlots(slots);
    sheetRef.current?.dismiss();
  };

  /**
   * Deletes a {@link SkillGroup} by its ID from a specific {@link TimeSlot}.
   * Triggers capacity recalculation and dismisses the bottom sheet.
   *
   * @param {string} slotId The unique ID of the timeslot containing the group.
   * @param {string} groupId The unique ID of the skill group to remove.
   * @returns {void}
   */
  const handleDeleteGroup = (slotId: string, groupId: string) => {
    const slots = formData.slots.map((s) =>
      s.id === slotId
        ? {
            ...s,
            skillGroups: (s.skillGroups || []).filter((g) => g.id !== groupId),
          }
        : s,
    );
    persistSlots(slots);
    sheetRef.current?.dismiss();
  };

  return (
    <>
      <ScrollView
        className="flex-1 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="border-b border-neutral-lightest px-4 pb-5">
          <Text className="mb-4 font-nunito-bold text-[15px] text-neutral">
            Number of Participants
          </Text>
          <View className="flex-row justify-between">
            <ReadOnlyCounter label="Min" value={derived.minParticipants} />
            <ReadOnlyCounter label="Max" value={derived.maxParticipants} />
          </View>
          <Text className="mt-2 font-nunito text-[11px] text-neutral-light">
            Calculated from skill groups inside time slots.
          </Text>
        </View>

        <View className="border-b border-neutral-lightest px-4 py-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-nunito-bold text-[15px] text-neutral">
              Required skills
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                setEditing(null);
                sheetRef.current?.present();
              }}
            >
              <Text className="font-nunito-semibold text-[13px] text-primary">
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {derived.skills.length === 0 ? (
              <Text className="font-nunito text-[13px] text-neutral-light">
                Add skill groups to calculate required skills.
              </Text>
            ) : (
              derived.skills.map((s) => (
                <View key={s} className="rounded-full bg-primary px-3 py-1.5">
                  <Text className="font-nunito-semibold text-[12px] text-white">
                    {s}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View className="border-b border-neutral-lightest px-4 py-5">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="font-nunito-bold text-[15px] text-neutral">
                Skill Groups
              </Text>
              <Text className="ml-1 font-nunito text-[11px] text-neutral-light">
                (optional)
              </Text>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.primary.DEFAULT}
                style={{ marginLeft: 4 }}
              />
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                setEditing(null);
                sheetRef.current?.present();
              }}
            >
              <Text className="font-nunito-semibold text-[13px] text-primary">
                Add
              </Text>
            </TouchableOpacity>
          </View>

          {formData.slots.length === 0 ? (
            <Text className="font-nunito text-[13px] text-neutral-light">
              Create time slots in Step 2 to add skill groups.
            </Text>
          ) : (
            formData.slots.map((slot) => (
              <View key={slot.id} className="mb-4">
                <Text className="mb-2 font-nunito-semibold text-[13px] text-neutral-light">
                  {slot.title}
                </Text>
                {(slot.skillGroups || []).length === 0 ? (
                  <View className="rounded-xl border border-dashed border-neutral-lightest p-3">
                    <Text className="font-nunito text-[13px] text-neutral-light">
                      No skill groups yet.
                    </Text>
                  </View>
                ) : (
                  slot.skillGroups!.map((g) => (
                    <View
                      key={g.id}
                      className="mb-2 flex-row items-center justify-between rounded-xl border border-neutral-lightest bg-white p-3"
                    >
                      <View>
                        <Text className="font-nunito-semibold text-[15px] text-neutral">
                          {g.title}
                        </Text>
                        <Text className="mt-1 font-nunito text-[12px] text-neutral-light">
                          Capacity: {g.minParticipants}-{g.maxParticipants}{" "}
                          people
                        </Text>
                      </View>
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => {
                          setEditing({ slotId: slot.id, group: g });
                          sheetRef.current?.present();
                        }}
                      >
                        <Text className="font-nunito-semibold text-[13px] text-primary">
                          Edit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            ))
          )}
        </View>

        <View className="border-b border-neutral-lightest px-4 py-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="font-nunito-bold text-[15px] text-neutral">
                Perks for participants
              </Text>
              <Text className="ml-1 font-nunito text-[11px] text-neutral-light">
                (optional)
              </Text>
            </View>
            <Switch
              trackColor={{
                false: colors.neutral.lightest,
                true: colors.primary.DEFAULT,
              }}
              thumbColor="#fff"
              value={showPerks}
              onValueChange={setShowPerks}
            />
          </View>
          {showPerks && (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {PRESET_PERKS.map((p) => {
                const sel = formData.perks.includes(p);
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    key={p}
                    onPress={() =>
                      updateData({
                        perks: sel
                          ? formData.perks.filter((i) => i !== p)
                          : [...formData.perks, p],
                      })
                    }
                    className={`rounded-full border px-3 py-1.5 ${sel ? "border-primary bg-primary" : "border-neutral-lightest bg-white"}`}
                  >
                    <Text
                      className={`font-nunito-semibold text-[12px] ${sel ? "text-white" : "text-neutral-light"}`}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View className="px-4 pb-10 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="font-nunito text-[15px] text-neutral">
              Join by Request
            </Text>
            <Switch
              trackColor={{
                false: colors.neutral.lightest,
                true: colors.primary.DEFAULT,
              }}
              thumbColor="#fff"
              value={formData.allowJoiningRequests}
              onValueChange={(v) => updateData({ allowJoiningRequests: v })}
            />
          </View>
        </View>
      </ScrollView>

      <SkillGroupBottomSheet
        ref={sheetRef}
        slots={formData.slots}
        initialData={editing}
        onSave={handleSaveGroup}
        onDelete={handleDeleteGroup}
        onClose={() => sheetRef.current?.dismiss()}
      />
    </>
  );
}
