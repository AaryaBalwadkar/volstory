import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { colors, fonts } from "@/constants/theme";
import {
  approveEventApi,
  fetchPendingApprovalEventsApi,
} from "@/src/features/createEvent/api/event.api";
import type { Event } from "@/src/features/createEvent/types/event.types";
import { useSessionStore } from "@/src/stores/session.store";

/**
 *
 */
export default function AdminApprovalScreen() {
  const { user } = useSessionStore();
  const queryClient = useQueryClient();

  const {
    data: events,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin-pending-events"],
    queryFn: fetchPendingApprovalEventsApi,
    enabled:
      user?.role === "superadmin" ||
      user?.permissions.includes("event:approve"),
  });

  const approveMutation = useMutation({
    mutationFn: approveEventApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-events"] });
      Alert.alert("Success", "Event approved and published.");
    },
    onError: () => {
      Alert.alert("Error", "Failed to approve event.");
    },
  });

  if (
    user?.role !== "superadmin" &&
    !user?.permissions.includes("event:approve")
  ) {
    return <Redirect href="/(drawer)/(tabs)" />;
  }

  const renderEvent = ({ item }: { item: Event }) => {
    const startDate = new Date(item.fromDateTime).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.badgeText}>Pending</Text>
        </View>
        <Text style={styles.organizerText}>
          By: {item.createdBy?.name || "Unknown"}
        </Text>
        <Text style={styles.dateText}>Start: {startDate}</Text>
        <Text style={styles.descriptionText} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            style={[
              styles.approveBtn,
              approveMutation.isPending && styles.disabled,
            ]}
            onPress={() => approveMutation.mutate(item._id)}
            disabled={approveMutation.isPending}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={20}
              color="#fff"
            />
            <Text style={styles.approveText}>Approve Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Approval Queue</Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={renderEvent}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary.DEFAULT]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="check-all"
                size={64}
                color={colors.neutral.lightest}
              />
              <Text style={styles.emptyText}>No pending events.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.DEFAULT },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.lightest,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.neutral.DEFAULT,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral.lightest,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.neutral.DEFAULT,
    marginRight: 12,
  },
  badgeText: {
    backgroundColor: colors.warning,
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: fonts.semibold,
    overflow: "hidden",
  },
  organizerText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.neutral.gray,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.neutral.light,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.neutral.DEFAULT,
    marginBottom: 16,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral.lightest,
    paddingTop: 12,
  },
  approveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  approveText: {
    color: "#fff",
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.neutral.light,
  },
});
