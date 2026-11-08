
import { Colors } from "@/styles/shared";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowUpRightFromSquare,
  faBell,
  faBookmark,
  faBoxArchive,
  faCalendarDay,
  faCalendarDays,
  faChalkboardUser,
  faChevronRight,
  faCircleCheck,
  faCircleQuestion,
  faCircleUser,
  faClipboardList,
  faChevronDown,
  faChevronUp,
  faGear,
  faGraduationCap,
  faHourglassHalf,
  faHouse,
  faList,
  faLocationDot,
  faMessage,
  faPen,
  faPlus,
  faRightFromBracket,
  faSquare,
  faSquareCheck,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

const icons: Record<string, IconDefinition> = {
  "fa-arrow-up-right-from-square": faArrowUpRightFromSquare,
  "fa-bell": faBell,
  "fa-bookmark": faBookmark,
  "fa-box-archive": faBoxArchive,
  "fa-calendar-day": faCalendarDay,
  "fa-calendar-days": faCalendarDays,
  "fa-chalkboard-user": faChalkboardUser,
  "fa-chevron-right": faChevronRight,
  "fa-chevron-down": faChevronDown,
  "fa-chevron-up": faChevronUp,
  "fa-circle-check": faCircleCheck,
  "fa-circle-user": faCircleUser,
  "fa-clipboard-list": faClipboardList,
  "fa-graduation-cap": faGraduationCap,
  "fa-gear": faGear,
  "fa-house": faHouse,
  "fa-hourglass-half": faHourglassHalf,
  "fa-list": faList,
  "fa-location-dot": faLocationDot,
  "fa-message": faMessage,
  "fa-pen": faPen,
  "fa-plus": faPlus,
  "fa-right-from-bracket": faRightFromBracket,
  "fa-square": faSquare,
  "fa-square-check": faSquareCheck,
  "fa-user": faUser,
  "fa-xmark": faXmark,
};

function normalizeIconName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^(fa-solid|fa-regular|fa-brands|fas|far|fab)\s+/, "");
}

export function AppIcon({
  name,
  size = 18,
  color = Colors.textPrimary,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const normalizedName = normalizeIconName(name);

  return (
    <FontAwesomeIcon
      icon={icons[normalizedName] ?? faBookmark}
      size={size}
      color={color}
    />
  );
}

export function IconLabel({
  name,
  label,
  size = 20,
  color = Colors.textPrimary,
  containerStyle,
  labelStyle,
}: {
  name: string;
  label: string;
  size?: number;
  color?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      <AppIcon name={name} size={size} color={color} />
      <Text style={[styles.label, { color }, labelStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
});
