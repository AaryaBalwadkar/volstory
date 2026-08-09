import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { FlashList } from "@shopify/flash-list";

import { colors } from "@/constants/theme";
import { fetchEventsFeedApi } from "@/src/features/createEvent/api/event.api";
import { EventCard } from "@/src/features/createEvent/components/EventCard";
import { EventSearch } from "@/src/features/createEvent/components/EventSearch";
import { PeopleSearch } from "@/src/features/createEvent/components/PeopleSearch";
import type { Event } from "@/src/features/createEvent/types/event.types";

type ActiveTab = "events" | "people";

/**
 *
 */
export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bottomLoading, setBottomLoading] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("events");

  const fetchEvents = async (reset = false) => {
    try {
      const currentCursor = reset ? undefined : cursor;
      const data = await fetchEventsFeedApi({
        cursor: currentCursor,
        limit: 10,
      });

      if (data.length === 0 || data.length < 10) {
        setHasMore(false);
      }

      if (reset) {
        setEvents(data);
      } else {
        setEvents((prev) => {
          const existingIds = new Set(prev.map((e) => e._id));
          return [...prev, ...data.filter((e) => !existingIds.has(e._id))];
        });
      }

      if (data.length > 0) {
        setCursor(data[data.length - 1].fromDateTime);
      }
    } catch {
      setError("Some error occurred. Please try again.");
    }
  };

  useEffect(() => {
    fetchEvents(true).finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setCursor(undefined);
    setHasMore(true);
    setError(null);
    await fetchEvents(true);
    setRefreshing(false);
  };

  const onEndReached = async () => {
    if (!hasMore || bottomLoading || loading) return;
    setBottomLoading(true);
    await fetchEvents(false);
    setBottomLoading(false);
  };

  const isSearchActive = search.trim().length > 0;

  return (
    <View className="flex-1 bg-surface-gray">
      <View className="bg-surface px-4 pb-2 pt-3">
        <TextInput
          accessibilityLabel="Text input field"
          className="rounded-xl bg-surface-gray px-4 py-2.5 font-nunito text-[15px] text-neutral"
          placeholder="Search events or people..."
          placeholderTextColor={colors.neutral.light}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {isSearchActive && (
        <View className="flex-row border-b border-neutral-lightest bg-surface">
          {(["events", "people"] as ActiveTab[]).map((tab) => (
            <TouchableOpacity
              accessibilityRole="button"
              key={tab}
              className={`flex-1 items-center border-b-2 py-3 ${activeTab === tab ? "border-primary" : "border-transparent"}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`font-nunito-semibold text-[14px] capitalize ${activeTab === tab ? "text-primary" : "text-neutral-light"}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isSearchActive ? (
        <View className="flex-1">
          {activeTab === "events" ? (
            <EventSearch search={search} />
          ) : (
            <PeopleSearch search={search} />
          )}
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-nunito-semibold text-[16px] text-error">
            {error}
          </Text>
        </View>
      ) : (
        <FlashList
          data={events}
          keyExtractor={(item, index) => item._id || `event-${index}`}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
          estimatedItemSize={160}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary.DEFAULT}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            bottomLoading ? (
              <View className="py-5">
                <ActivityIndicator
                  size="small"
                  color={colors.primary.DEFAULT}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="font-nunito-semibold text-[16px] text-neutral-light">
                No events yet
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
