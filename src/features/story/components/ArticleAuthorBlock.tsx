import React from "react";
import { Text, View } from "react-native";

import { formatStoryDate } from "../utils/storyUtils";

interface Props {
  name: string;
  createdAt: string;
  eventTimeframe?: string;
}

/**
 * Renders the compact story author and timing metadata row.
 *
 * @param root0 - Author block props.
 * @param root0.name - Story author display name.
 * @param root0.createdAt - Story creation timestamp.
 * @param root0.eventTimeframe - Optional event timeframe label.
 * @returns The story article author block.
 */
export function ArticleAuthorBlock({ name, createdAt, eventTimeframe }: Props) {
  return (
    <View className="mb-6 mt-6 flex-row items-center gap-3">
      <View className="h-12 w-12 rounded-2xl bg-surface-gray" />
      <View>
        <Text className="font-nunito-semibold text-neutral">{name}</Text>
        <Text className="text-small text-neutral-gray">
          {[formatStoryDate(createdAt), eventTimeframe]
            .filter(Boolean)
            .join(", ")}
        </Text>
      </View>
    </View>
  );
}
