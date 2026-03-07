import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../styles/colors";
import { db, auth } from "../config/vacant/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  onSnapshot,
  doc
} from "firebase/firestore";

const ChatScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      // Fallback message if not logged in
      setMessages([{
        id: 'welcome',
        text: "Hello! Please log in to use the AI Assistant and view your history.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
      return;
    }

    // Load existing chat history with fallback for missing index
    const fetchChats = () => {
      try {
        const q = query(
          collection(db, "chats"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "asc")
        );

        return onSnapshot(q, (snapshot) => {
          const chatMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          updateMessagesState(chatMessages);
        }, (error) => {
          if (error.code === 'failed-precondition') {
            console.warn("Index not ready yet, falling back to manual sort.");
            fallbackFetch();
          }
        });
      } catch (e) {
        fallbackFetch();
      }
    };

    const fallbackFetch = () => {
      const qBasic = query(
        collection(db, "chats"),
        where("userId", "==", user.uid)
      );

      return onSnapshot(qBasic, (snapshot) => {
        const chatMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Manual sort by createdAt
        chatMessages.sort((a, b) => {
          const t1 = a.createdAt?.seconds || 0;
          const t2 = b.createdAt?.seconds || 0;
          return t1 - t2;
        });
        updateMessagesState(chatMessages);
      });
    };

    const updateMessagesState = (chatMessages) => {
      if (chatMessages.length === 0) {
        setMessages([{
          id: 'welcome',
          text: "Hello! I'm your Cinnamon Assistant. How can I help you regarding your cultivation today?",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
      } else {
        setMessages(chatMessages);
      }
    };

    const unsubscribe = fetchChats();
    return () => unsubscribe && unsubscribe();
  }, []);

  const parseDatesFromText = (text) => {
    const lowerText = text.toLowerCase();
    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];

    const results = [];

    // Split by "and" or "&" to find multiple potential date phrases
    const segments = text.split(/\s+and\s+|\s+&\s+/i);

    segments.forEach(segment => {
      let foundYear = null;
      let foundMonth = null;
      let foundDay = null;

      const yearMatch = segment.match(/20\d{2}/);
      if (yearMatch) foundYear = parseInt(yearMatch[0]);

      monthNames.forEach((month, index) => {
        if (segment.toLowerCase().includes(month)) foundMonth = index + 1;
      });

      const digitMatches = segment.match(/\b\d{1,2}\b/g);
      if (digitMatches) {
        const possibleDays = digitMatches.filter(d => parseInt(d) <= 31);
        if (possibleDays.length > 0) foundDay = parseInt(possibleDays[0]);
      }

      // If year is missing in this segment, try to find it in the whole text (for cases like "March 6 and 7, 2026")
      if (!foundYear) {
        const fullYearMatch = text.match(/20\d{2}/);
        if (fullYearMatch) foundYear = parseInt(fullYearMatch[0]);
      }

      // Similarly for month
      if (!foundMonth) {
        monthNames.forEach((month, index) => {
          if (text.toLowerCase().includes(month)) foundMonth = index + 1;
        });
      }

      if (foundYear && foundMonth && foundDay) {
        const dStr = new Date(foundYear, foundMonth - 1, foundDay).toLocaleDateString();
        if (!results.includes(dStr)) results.push(dStr);
      }
    });

    return results;
  };

  const fetchLandDetailsFromDate = async (dateStr) => {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      const q = query(
        collection(db, "analyses"),
        where("userId", "==", user.uid),
        where("analysisDate", "==", dateStr)
      );
      const querySnapshot = await getDocs(q);
      const analyses = [];
      querySnapshot.forEach((doc) => analyses.push(doc.data()));
      return analyses;
    } catch (error) {
      console.error("Error fetching analysis: ", error);
      return [];
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload images."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageMessage = {
        id: Date.now().toString(),
        image: result.assets[0].uri,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, imageMessage]);

      setTimeout(() => {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: "I received your image! I'm analyzing it now...",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 1000);
    }
  };

  const sendMessage = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to chat.");
      return;
    }
    if (!inputText.trim()) return;

    const userMessageText = inputText;
    const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setInputText("");

    try {
      await addDoc(collection(db, "chats"), {
        userId: user.uid,
        text: userMessageText,
        isUser: true,
        timestamp: timestampStr,
        createdAt: serverTimestamp(),
      });

      const dates = parseDatesFromText(userMessageText);
      const lowerInput = userMessageText.toLowerCase();
      const isComparison = lowerInput.includes("comparison") || lowerInput.includes("compare");

      if (dates.length >= 2 && isComparison) {
        const date1 = dates[0];
        const date2 = dates[1];

        const details1 = await fetchLandDetailsFromDate(date1);
        const details2 = await fetchLandDetailsFromDate(date2);

        let comparisonReply = `Comparison between ${date1} and ${date2}:\n\n`;

        if (details1.length > 0 && details2.length > 0) {
          // Take the first record for simplicity in comparison
          const rec1 = details1[0];
          const rec2 = details2[0];

          const diffArea = (parseFloat(rec1.vacantArea) - parseFloat(rec2.vacantArea)).toFixed(2);
          const diffPlants = parseInt(rec1.requiredPlants) - parseInt(rec2.requiredPlants);

          comparisonReply += `• Area Change: ${diffArea > 0 ? '+' : ''}${diffArea} Sqm\n`;
          comparisonReply += `• Plant Count Change: ${diffPlants > 0 ? '+' : ''}${diffPlants}\n`;
          comparisonReply += `• Recent Status: ${date1} had ${rec1.vacantSpotsCount} spots vs ${date2} with ${rec2.vacantSpotsCount} spots.\n\n`;

          if (diffArea < 0) {
            comparisonReply += "Great! Your vacant area is decreasing. 🌱";
          } else if (diffArea > 0) {
            comparisonReply += "Notice: Vacant area has increased between these dates. ⚠️";
          } else {
            comparisonReply += "No significant change in vacant area detected.";
          }
        } else {
          comparisonReply = `I found records for ${dates.join(", ")} but couldn't get enough data to compare. Make sure both dates have saved analyses.`;
        }

        await addDoc(collection(db, "chats"), {
          userId: user.uid,
          text: comparisonReply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          createdAt: serverTimestamp(),
        });

      } else if (dates.length > 0) {
        const searchedDate = dates[0];
        const details = await fetchLandDetailsFromDate(searchedDate);
        let botReplyText = "";
        if (details && details.length > 0) {
          botReplyText = `I found ${details.length} analysis record(s) for ${searchedDate}:\n\n`;
          details.forEach((item, index) => {
            botReplyText += `Record ${index + 1}:\n• Vacant Spots: ${item.vacantSpotsCount}\n• Vacant Area: ${item.vacantArea}\n• Plants Needed: ${item.requiredPlants}\n• Estimated Cost: Rs ${item.totalCost}\n\n`;
          });
        } else {
          botReplyText = `I couldn't find any analysis records for ${searchedDate}. Please check if you added land details on that day.`;
        }
        await addDoc(collection(db, "chats"), {
          userId: user.uid,
          text: botReplyText,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          createdAt: serverTimestamp(),
        });
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        await addDoc(collection(db, "chats"), {
          userId: user.uid,
          text: "Hello! How can I help you today? You can ask for land details by date.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          createdAt: serverTimestamp(),
        });
      } else {
        setTimeout(async () => {
          await addDoc(collection(db, "chats"), {
            userId: user.uid,
            text: "I can help you retrieve your land analysis history. Try asking: 'give me 2026 march 7 records'",
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            createdAt: serverTimestamp(),
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Chat Error: ", error);
      Alert.alert("Error", "Message failed to send. Check your Firestore Rules.");
    }
  };

  const renderMessage = ({ item }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {!item.isUser && (
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.avatarGradient}
            >
              <Ionicons name="leaf" size={14} color={colors.white} />
            </LinearGradient>
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            item.isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          {item.image ? (
            <Image
              source={typeof item.image === 'string' ? { uri: item.image } : item.image}
              style={styles.messageImage}
            />
          ) : (
            <Text
              style={[
                styles.messageText,
                item.isUser ? styles.userMessageText : styles.botMessageText,
              ]}
            >
              {item.text}
            </Text>
          )}
          <Text
            style={[
              styles.timestamp,
              item.isUser ? styles.userTimestamp : styles.botTimestamp,
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[colors.primary, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>AI Assistant</Text>
            </View>
            <View style={styles.onlineBadgeContainer}>
              <View style={styles.onlineBadge} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Input Area */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <Ionicons name="add-circle-outline" size={28} color={colors.secondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Ask something..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={
                inputText.trim()
                  ? [colors.primary, colors.primaryDark]
                  : [colors.border, colors.border]
              }
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={18} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: colors.primary,
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
  },
  onlineBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  onlineBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50", // Bright green for online status
    marginRight: 6,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  onlineText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "600",
  },
  messageList: {
    padding: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userBubble: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: colors.primary,
  },
  botBubble: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: colors.white,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.white,
  },
  botMessageText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255,255,255,0.7)",
  },
  botTimestamp: {
    color: colors.textSecondary,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 5,
  },
  inputWrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
