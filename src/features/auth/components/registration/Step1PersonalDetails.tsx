// import React, { useEffect, useState } from "react";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";
// import { useAuthStore } from "@/src/features/auth/stores/auth.store";
// const GENDER_OPTIONS = ["Male", "Female", "Other"];
// /**
//  *
//  */
// export const Step1PersonalDetails = () => {
//   const {
//     registrationData,
//     setRegistrationData,
//     signupData,
//     validationErrors,
//   } = useAuthStore();
//   const [isGenderOpen, setIsGenderOpen] = useState(false);
//   const isGoogleAuth = !!signupData.googleData?.email;
//   const isPhoneAuth = !!signupData.firebaseUser?.phoneNumber;
//   useEffect(() => {
//     // Only pre-fill if empty to avoid overwriting user edits
//     if (!registrationData.email && signupData.googleData?.email) {
//       setRegistrationData({ email: signupData.googleData.email });
//     }
//     if (!registrationData.phone && signupData.firebaseUser?.phoneNumber) {
//       setRegistrationData({ phone: signupData.firebaseUser.phoneNumber });
//     }
//     if (!registrationData.profileImage && signupData.googleData?.photoURL) {
//       setRegistrationData({ profileImage: signupData.googleData.photoURL });
//     }
//   }, []);
//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.5,
//     });
//     if (!result.canceled) {
//       setRegistrationData({ profileImage: result.assets[0].uri });
//     }
//   };
//   // Helper to render error text
//   const ErrorText = ({ field }: { field: string }) => {
//     if (!validationErrors[field]) return null;
//     return (
//       <Text className="ml-1 mt-1 text-xs text-red-500">
//         {validationErrors[field]}
//       </Text>
//     );
//   };
//   // Helper for Input Border Color
//   const getBorderColor = (field: string) =>
//     validationErrors[field] ? "border-red-500" : "border-neutral-light";
//   return (
//     <ScrollView
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={{ paddingBottom: 100 }}
//       className="flex-1"
//       keyboardShouldPersistTaps="handled"
//     >
//       <View className="mb-8 items-center">
//         <Text className="mb-1 text-2xl font-bold text-primary">
//           Welcome to Volstory
//         </Text>
//         <Text className="mb-6 text-base text-neutral-gray">
//           Let's get you registered
//         </Text>
//         <TouchableOpacity
//           accessibilityRole="button"
//           onPress={pickImage}
//           activeOpacity={0.8}
//         >
//           <View
//             className={`h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-dashed bg-gray-100 ${getBorderColor("profileImage")}`}
//           >
//             {registrationData.profileImage ? (
//               <Image
//                 source={{ uri: registrationData.profileImage }}
//                 className="h-full w-full"
//               />
//             ) : (
//               <View className="items-center">
//                 <Ionicons name="camera" size={32} color="#8E8E93" />
//                 <Text className="mt-1 text-xs text-neutral-gray">
//                   Add Photo
//                 </Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>
//         <ErrorText field="profileImage" />
//       </View>
//       <View className="gap-4">
//         {/* ROW 1: Names */}
//         <View className="flex-row gap-4">
//           <View className="flex-1">
//             <TextInput
//               accessibilityLabel="Text input field"
//               placeholder="First Name"
//               className={`h-[52px] rounded-lg border bg-white px-4 text-neutral-black ${getBorderColor("firstName")}`}
//               value={registrationData.firstName}
//               onChangeText={(t) => setRegistrationData({ firstName: t })}
//             />
//             <ErrorText field="firstName" />
//           </View>
//           <View className="flex-1">
//             <TextInput
//               accessibilityLabel="Text input field"
//               placeholder="Last Name"
//               className={`h-[52px] rounded-lg border bg-white px-4 text-neutral-black ${getBorderColor("lastName")}`}
//               value={registrationData.lastName}
//               onChangeText={(t) => setRegistrationData({ lastName: t })}
//             />
//             <ErrorText field="lastName" />
//           </View>
//         </View>
//         {/* ROW 2: Age & Gender */}
//         <View className="z-50 flex-row gap-4">
//           <View className="flex-1">
//             <TextInput
//               accessibilityLabel="Text input field"
//               placeholder="Age"
//               keyboardType="number-pad"
//               className={`h-[52px] rounded-lg border bg-white px-4 text-neutral-black ${getBorderColor("age")}`}
//               value={registrationData.age}
//               onChangeText={(t) => setRegistrationData({ age: t })}
//             />
//             <ErrorText field="age" />
//           </View>
//           <View className="relative z-50 flex-1">
//             <TouchableOpacity
//               accessibilityRole="button"
//               activeOpacity={0.8}
//               onPress={() => setIsGenderOpen(!isGenderOpen)}
//               className={`h-[52px] flex-row items-center justify-between rounded-lg border bg-white px-4 ${getBorderColor("gender")}`}
//             >
//               <Text
//                 className={
//                   registrationData.gender
//                     ? "text-neutral-black"
//                     : "text-gray-400"
//                 }
//               >
//                 {registrationData.gender || "Gender"}
//               </Text>
//               <Ionicons name="chevron-down" size={16} color="#8E8E93" />
//             </TouchableOpacity>
//             <ErrorText field="gender" />
//             {isGenderOpen && (
//               <View className="absolute left-0 right-0 top-[56px] z-50 rounded-lg border border-neutral-light bg-white shadow-lg">
//                 {GENDER_OPTIONS.map((option) => (
//                   <TouchableOpacity
//                     accessibilityRole="button"
//                     key={option}
//                     onPress={() => {
//                       setRegistrationData({ gender: option });
//                       setIsGenderOpen(false);
//                     }}
//                     className="border-b border-gray-100 px-4 py-3"
//                   >
//                     <Text className="text-neutral-black">{option}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             )}
//           </View>
//         </View>
//         {/* City */}
//         <View>
//           <TextInput
//             accessibilityLabel="Text input field"
//             placeholder="City"
//             className={`-z-10 h-[52px] rounded-lg border bg-white px-4 text-neutral-black ${getBorderColor("city")}`}
//             value={registrationData.city}
//             onChangeText={(t) => setRegistrationData({ city: t })}
//           />
//           <ErrorText field="city" />
//         </View>
//         {/* Read-Only Fields */}
//         <View>
//           <TextInput
//             accessibilityLabel="Text input field"
//             placeholder="Phone Number"
//             editable={!isPhoneAuth}
//             className={`-z-20 h-[52px] rounded-lg border px-4 ${!isPhoneAuth ? "bg-white text-neutral-black" : "bg-gray-100 text-gray-500"} ${getBorderColor("phone")}`}
//             value={registrationData.phone}
//             onChangeText={
//               !isPhoneAuth
//                 ? (t) => setRegistrationData({ phone: t })
//                 : undefined
//             }
//           />
//           <ErrorText field="phone" />
//         </View>
//         <View>
//           <TextInput
//             accessibilityLabel="Text input field"
//             placeholder="Email"
//             editable={!isGoogleAuth}
//             className={`-z-20 h-[52px] rounded-lg border px-4 ${!isGoogleAuth ? "bg-white text-neutral-black" : "bg-gray-100 text-gray-500"} ${getBorderColor("email")}`}
//             value={registrationData.email}
//             onChangeText={
//               !isGoogleAuth
//                 ? (t) => setRegistrationData({ email: t })
//                 : undefined
//             }
//           />
//           <ErrorText field="email" />
//         </View>
//         {/* Optional Website */}
//         <View>
//           <TextInput
//             accessibilityLabel="Text input field"
//             placeholder="Website (Optional)"
//             className={`-z-20 h-[52px] rounded-lg border bg-white px-4 text-neutral-black ${getBorderColor("website")}`}
//             value={registrationData.website}
//             onChangeText={(t) => setRegistrationData({ website: t })}
//           />
//           <ErrorText field="website" />
//         </View>
//       </View>
//     </ScrollView>
//   );
// };
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "@/src/features/auth/stores/auth.store";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

/**
 * **Registration Step 1: Personal Details**
 *
 * This component handles the collection of the user's core identity information.
 * It is the first screen in the multi-step registration wizard.
 *
 * **Key Features:**
 * - **Auto-Population:** Automatically pre-fills Email (if Google Auth) or Phone (if OTP Auth) to prevent editing of verified credentials.
 * - **Media Handling:** Integrates `expo-image-picker` for profile photo selection.
 * - **Validation Feedback:** Displays inline error messages using the shared `validationErrors` store.
 * - **Custom Inputs:** Features a custom dropdown implementation for Gender selection.
 *
 * @component
 * @example
 * // Rendered within the Registration Wizard
 * {currentStep === 1 && <Step1PersonalDetails />}
 *
 * @returns {JSX.Element} The scrollable form for personal information.
 */
export const Step1PersonalDetails = () => {
  const {
    registrationData,
    setRegistrationData,
    signupData,
    validationErrors,
  } = useAuthStore();
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const isGoogleAuth = !!signupData.googleData?.email;
  const isPhoneAuth = !!signupData.firebaseUser?.phoneNumber;

  // Fix: Added dependencies to satisfy linter
  useEffect(() => {
    if (!registrationData.email && signupData.googleData?.email) {
      setRegistrationData({ email: signupData.googleData.email });
    }
    if (!registrationData.phone && signupData.firebaseUser?.phoneNumber) {
      setRegistrationData({ phone: signupData.firebaseUser.phoneNumber });
    }
    if (!registrationData.profileImage && signupData.googleData?.photoURL) {
      setRegistrationData({ profileImage: signupData.googleData.photoURL });
    }
  }, [
    registrationData.email,
    registrationData.phone,
    registrationData.profileImage,
    signupData.googleData,
    signupData.firebaseUser,
    setRegistrationData,
  ]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setRegistrationData({ profileImage: result.assets[0].uri });
    }
  };

  const getBorderColor = (field: string) =>
    validationErrors[field] ? "border-red-500" : "border-neutral-light";

  // Refactored to save lines
  const renderError = (field: string) =>
    validationErrors[field] ? (
      <Text className="ml-1 mt-1 text-xs text-red-500">
        {validationErrors[field]}
      </Text>
    ) : null;

  // Helper to reduce repetition and fix Accessibility Errors
  const renderInput = (
    field: keyof typeof registrationData,
    placeholder: string,
    options: { keyboard?: "default" | "number-pad"; editable?: boolean } = {},
  ) => (
    <View className="mb-4">
      <TextInput
        accessibilityLabel={placeholder}
        accessibilityHint={`Enter your ${placeholder}`}
        placeholder={placeholder}
        keyboardType={options.keyboard || "default"}
        editable={options.editable !== false}
        className={`h-[52px] rounded-lg border px-4 text-neutral-black ${
          options.editable === false ? "bg-gray-100 text-gray-500" : "bg-white"
        } ${getBorderColor(field)}`}
        value={registrationData[field] as string}
        onChangeText={(t) => setRegistrationData({ [field]: t })}
      />
      {renderError(field)}
    </View>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-24"
      className="flex-1"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-8 items-center">
        <Text className="mb-1 text-2xl font-bold text-primary">
          Welcome to Volstory
        </Text>
        <Text className="mb-6 text-base text-neutral-gray">
          Let&apos;s get you registered
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Profile Photo"
          accessibilityHint="Opens gallery to select a profile photo"
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <View
            className={`h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-dashed bg-gray-100 ${getBorderColor("profileImage")}`}
          >
            {registrationData.profileImage ? (
              <Image
                source={{ uri: registrationData.profileImage }}
                className="h-full w-full"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="camera" size={32} color="#8E8E93" />
                <Text className="mt-1 text-xs text-neutral-gray">
                  Add Photo
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {renderError("profileImage")}
      </View>

      <View className="gap-2">
        {/* ROW 1: Names */}
        <View className="flex-row gap-4">
          <View className="flex-1">
            {renderInput("firstName", "First Name")}
          </View>
          <View className="flex-1">{renderInput("lastName", "Last Name")}</View>
        </View>

        {/* ROW 2: Age & Gender */}
        <View className="z-50 flex-row gap-4">
          <View className="flex-1">
            {renderInput("age", "Age", { keyboard: "number-pad" })}
          </View>

          <View className="relative z-50 flex-1">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Gender Selector"
              accessibilityHint="Opens a dropdown to select gender"
              activeOpacity={0.8}
              onPress={() => setIsGenderOpen(!isGenderOpen)}
              className={`h-[52px] flex-row items-center justify-between rounded-lg border bg-white px-4 ${getBorderColor("gender")}`}
            >
              <Text
                className={
                  registrationData.gender
                    ? "text-neutral-black"
                    : "text-gray-400"
                }
              >
                {registrationData.gender || "Gender"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#8E8E93" />
            </TouchableOpacity>
            {renderError("gender")}

            {isGenderOpen && (
              <View className="absolute left-0 right-0 top-[56px] z-50 rounded-lg border border-neutral-light bg-white shadow-lg">
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={option}
                    accessibilityHint={`Selects ${option} as gender`}
                    key={option}
                    onPress={() => {
                      setRegistrationData({ gender: option });
                      setIsGenderOpen(false);
                    }}
                    className="border-b border-gray-100 px-4 py-3"
                  >
                    <Text className="text-neutral-black">{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {renderInput("city", "City")}

        {/* Read-Only Fields */}
        {renderInput("phone", "Phone Number", { editable: !isPhoneAuth })}
        {renderInput("email", "Email", { editable: !isGoogleAuth })}
        {renderInput("website", "Website (Optional)")}
      </View>
    </ScrollView>
  );
};
