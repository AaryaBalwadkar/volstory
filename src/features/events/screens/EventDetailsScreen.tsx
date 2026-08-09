import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/features/auth/stores/auth.store";
import { clientStorage } from "@/src/lib/storage";

import { EventAboutSection } from "../components/EventAboutSection";
import {
  EventDetailsHeader,
  EventNotFound,
} from "../components/EventDetailsHeader";
import { EventInfoSection } from "../components/EventInfoSection";
import { EventSlotsSection } from "../components/EventSlotsSection";
import { EventTabBar } from "../components/EventTabBar";
import { JoinEventButton } from "../components/JoinEventButton";
import { ProgressCircle } from "../components/ProgressCircle";
import { useEventDetails } from "../hooks/useEventDetails";
import { useEventParticipants } from "../hooks/useEventParticipants";
import { useToggleInterest } from "../hooks/useToggleInterest";

interface EventDetailsScreenProps {
  eventId: string;
}

/**
 * Full event details screen matching the prev_vol design.
 * Section order: Header → TabBar → Info → Actions → About → Slots.
 *
 * Non-organizers see: join button, then an Interested + Share row
 * (only while joining is still open and event isn't full).
 *
 * Organizers see: Invite/Share + Clone (pre-event) or Mark Attendance +
 * Invite/Share/Clone (post-start), plus a View Participants shortcut.
 *
 * @param root0 - Component props.
 * @param root0.eventId - The MongoDB ObjectId string from route params.
 * @returns {JSX.Element} The rendered event details screen.
 */
export function EventDetailsScreen({
  eventId,
}: EventDetailsScreenProps): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const { data: event, isLoading, isError } = useEventDetails(eventId);
  const { data: participantsData } = useEventParticipants(eventId);

  // Local optimistic toggle — null means "use server value"
  const [localIsInterested, setLocalIsInterested] = useState<boolean | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const toggleInterestMutation = useToggleInterest(eventId);

  // Organizer one-time tooltip — shown 1.5 s after load, once per event
  const isOrganizer =
    !!event?.createdBy && String(event.createdBy.userId) === String(user?.userId);

  useEffect(() => {
    if (!event || !isOrganizer) return;
    const tooltipKey = `tooltip_shown_event_${eventId}`;
    const hasShown = clientStorage.getItem(tooltipKey);
    if (hasShown) return;
    const timer = setTimeout(() => setShowTooltip(true), 1500);
    return () => clearTimeout(timer);
  }, [event, isOrganizer, eventId]);

  const dismissTooltip = useCallback(() => {
    clientStorage.setItem(`tooltip_shown_event_${eventId}`, "true");
    setShowTooltip(false);
  }, [eventId]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#01A39F" />
      </View>
    );
  }

  if (isError || !event) {
    return <EventNotFound />;
  }

  /* ── Derived state ── */
  const isJoined = event.isJoined ?? false;
  const isPending = event.isPending ?? false;
  const hasAccess = isOrganizer || isJoined;
  const isStarted = event.fromDateTime
    ? new Date() >= new Date(event.fromDateTime)
    : false;
  const registeredCount = event.numberOfVolunteers ?? 0;
  const maxVolunteers = event.reqMaxVolunteers ?? 0;
  const isFull = maxVolunteers > 0 && registeredCount >= maxVolunteers;
  const isJoiningClosed = event.lastDateOfJoining
    ? new Date(event.lastDateOfJoining) < new Date()
    : false;

  // Interested state: local override takes priority over server value
  const isInterested =
    localIsInterested !== null ? localIsInterested : (event.isInterested ?? false);

  // User's registered slot — found by matching current user's _id in participants list
  const userId = user?.id ?? user?.userId ?? "";
  const userRegistration = participantsData?.registeredUsers.find(
    (p) => String(p._id) === String(userId),
  );

  /* ── Handlers ── */
  const handleInterested = () => {
    setLocalIsInterested((prev) =>
      !(prev !== null ? prev : (event.isInterested ?? false)),
    );
    toggleInterestMutation.mutate();
  };

  const handleMoreOptions = () => {
    Alert.alert("Event Options", undefined, [
      {
        text: "View Participants",
        onPress: () =>
          router.push(
            `/(drawer)/event/${eventId}/participants` as unknown as Href,
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Organizer one-time tooltip */}
      <Modal
        visible={showTooltip}
        transparent
        animationType="fade"
        onRequestClose={dismissTooltip}
      >
        <View className="flex-1 items-end justify-start bg-black/70">
          <View className="mt-[272px] flex-col items-end pr-2">
            {/* Ghost of the ProgressCircle to orient the user */}
            <View className="flex-row items-center px-2 py-1">
              <ProgressCircle
                radius={24}
                curr={registeredCount}
                total={maxVolunteers || 1}
              />
              <Text className="pl-2 text-[12px] text-white">Joined</Text>
            </View>
            {/* Tooltip bubble with upward-pointing tail */}
            <View className="relative mr-9 mt-2 min-w-[180px] rounded-lg bg-white p-3 shadow-lg">
              <View className="absolute -top-1.5 right-10 h-0 w-0 border-b-[6px] border-l-[6px] border-r-[6px] border-b-white border-l-transparent border-r-transparent" />
              <View className="items-end">
                <Text className="mb-3 text-sm text-neutral-black">
                  Tap to view participants
                </Text>
                <TouchableOpacity
                  onPress={dismissTooltip}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss tooltip"
                >
                  <Text className="font-nunito-semibold text-sm text-primary">
                    Got it
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Top bar + image + overlay bar */}
        <EventDetailsHeader
          photoURL={event.photoURL}
          registeredUsersCount={registeredCount}
          reqMaxVolunteers={maxVolunteers}
          interestedUsersCount={event.interestedUsersCount ?? 0}
          isOrganizer={isOrganizer}
          onMoreOptions={handleMoreOptions}
          onPressParticipants={() =>
            router.push(
              `/(drawer)/event/${eventId}/participants` as unknown as Href,
            )
          }
        />

        {/* Tab bar (Details / Instructions / Q&A) */}
        <EventTabBar eventId={eventId} hasAccess={hasAccess} />

        {/* Title, category, location, organizer, dates */}
        <EventInfoSection event={event} />

        {/* ── Action buttons — after info, before about (matches prev_vol order) ── */}
        {!isOrganizer ? (
          <>
            {/* Join / Requested / Joined / Full / Period-ended */}
            <JoinEventButton event={event} />

            {/* Interested + Share row — only when joining is still possible */}
            {!isJoined && !isJoiningClosed && !isFull && (
              <View className="mb-4 flex-row justify-between gap-3 px-4">
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center rounded-md border border-primary py-2 ${
                    isInterested ? "bg-primary" : ""
                  }`}
                  onPress={handleInterested}
                  disabled={toggleInterestMutation.isPending}
                >
                  <Feather
                    name="star"
                    size={20}
                    color={isInterested ? "white" : "#01A39F"}
                  />
                  <Text
                    className={`mx-2 font-nunito-semibold text-base ${
                      isInterested ? "text-white" : "text-primary"
                    }`}
                  >
                    {isInterested ? "Uninterested" : "Interested"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-md border border-primary py-2">
                  <Feather name="share-2" size={20} color="#01A39F" />
                  <Text className="mx-4 font-nunito-semibold text-base text-primary">
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {isStarted ? (
              <>
                {/* Mark Attendance */}
                <TouchableOpacity
                  className="mx-4 mb-2 mt-9 flex-row items-center justify-center rounded-md bg-primary py-2"
                  onPress={() =>
                    router.push(
                      `/(drawer)/event/${eventId}/participants` as unknown as Href,
                    )
                  }
                >
                  <Text className="font-nunito-semibold text-[18px] text-white">
                    Mark Attendance
                  </Text>
                </TouchableOpacity>

                {/* Invite / Share / Clone */}
                <View className="mb-4 flex-row justify-between gap-2 px-4">
                  <TouchableOpacity className="flex-1 flex-col items-center justify-center rounded-md border border-primary py-2">
                    <Feather name="user-plus" size={22} color="#01A39F" />
                    <Text className="mt-1 font-nunito-semibold text-xs text-primary">
                      Invite
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 flex-col items-center justify-center rounded-md border border-primary py-2">
                    <Feather name="share-2" size={22} color="#01A39F" />
                    <Text className="mt-1 font-nunito-semibold text-xs text-primary">
                      Share
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 flex-col items-center justify-center rounded-md border border-primary py-2">
                    <MaterialIcons
                      name="control-point-duplicate"
                      size={22}
                      color="#01A39F"
                    />
                    <Text className="mt-1 font-nunito-semibold text-xs text-primary">
                      Clone
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Info note */}
                <View className="flex-row gap-2 px-6 pb-3">
                  <AntDesign name="infocirlceo" size={17} color="#01A39F" />
                  <Text className="text-sm text-neutral-light">
                    Mark attendance for volunteers who have arrived at the event.
                  </Text>
                </View>
              </>
            ) : (
              <>
                {/* Invite + Share */}
                <View className="mb-4 mt-9 flex-row justify-between gap-3 px-4">
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-md border border-primary py-2">
                    <Feather name="user-plus" size={20} color="#01A39F" />
                    <Text className="mx-2 font-nunito-semibold text-xl text-primary">
                      Invite
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-md border border-primary py-2">
                    <Feather name="share-2" size={20} color="#01A39F" />
                    <Text className="mx-4 font-nunito-semibold text-xl text-primary">
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Clone Event */}
                <TouchableOpacity className="mx-4 mb-4 flex-row items-center justify-center rounded-md border border-primary py-2">
                  <MaterialIcons
                    name="control-point-duplicate"
                    size={20}
                    color="#01A39F"
                  />
                  <Text className="mx-2 py-2 font-nunito-semibold text-xl text-primary">
                    Clone Event
                  </Text>
                </TouchableOpacity>

                {/* Info note */}
                <View className="flex-row gap-2 px-6 pb-3">
                  <AntDesign name="infocirlceo" size={17} color="#01A39F" />
                  <Text className="text-sm text-neutral-light">
                    Cloning saves time in creating multiple events whose details
                    or settings might be similar. Changes can be made to the
                    cloned event before publishing it.
                  </Text>
                </View>
              </>
            )}

            {/* View Participants shortcut */}
            <TouchableOpacity
              className="mx-4 mb-3 flex-row items-center justify-between rounded-xl border border-neutral-lightest bg-surface-gray px-4 py-3"
              onPress={() =>
                router.push(
                  `/(drawer)/event/${eventId}/participants` as unknown as Href,
                )
              }
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <MaterialIcons name="group" size={20} color="white" />
                </View>
                <Text className="font-nunito-semibold text-[15px] text-neutral-black">
                  View Participants
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#8E8E93" />
            </TouchableOpacity>
          </>
        )}

        {/* Description, tags, facilities */}
        <EventAboutSection
          description={event.description}
          tags={event.tags}
          facilities={event.facilities}
        />

        {/* ── Your Time Slot (shown to joined volunteers) ── */}
        {isJoined && userRegistration?.slotId && (
          <View className="mx-4 mt-4">
            <Text className="font-nunito-bold text-lg text-neutral-black">
              Your Time Slot
            </Text>
            <View className="mt-3 flex-row items-center">
              {/* Start time */}
              <View className="flex-col items-center rounded-l-md border border-neutral-lightest p-4">
                <Text className="font-nunito-semibold text-sm text-neutral-black">
                  {userRegistration.slotStartTime
                    ? new Date(userRegistration.slotStartTime).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—"}
                </Text>
                <Text className="font-nunito text-sm text-neutral-black">to</Text>
                <Text className="font-nunito-semibold text-sm text-neutral-black">
                  {userRegistration.slotEndTime
                    ? new Date(userRegistration.slotEndTime).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—"}
                </Text>
              </View>
              {/* Slot details */}
              {userRegistration.slotTitle && (
                <View className="grow rounded-r-md border border-neutral-lightest p-4">
                  <Text className="font-nunito-semibold text-lg text-neutral-black">
                    {userRegistration.slotTitle}
                  </Text>
                </View>
              )}
            </View>
            <View className="mt-2 flex-row gap-2 pb-3">
              <AntDesign name="infocirlceo" size={15} color="#01A39F" />
              <Text className="text-sm text-neutral-light">
                To change your time slot, leave the event and rejoin with your
                preferred slot selected.
              </Text>
            </View>
          </View>
        )}

        {/* Time slots and skill groups */}
        <EventSlotsSection
          timeSlotsGroup={event.timeSlotsGroup}
          skillsGroup={event.skillsGroup}
          skillsRequired={event.skillsRequired}
        />

        {/* Bottom spacing */}
        <View className="py-5" />
      </ScrollView>
    </SafeAreaView>
  );
}

