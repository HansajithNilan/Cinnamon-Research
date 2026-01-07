#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define WIFI_SSID "Divana 828"
#define WIFI_PASSWORD "Di0770224617"

#define API_KEY "AIzaSyCOsyFMxS7IVkXDKzhwvDa6K21SVaYPIrk"
#define DATABASE_URL "https://cinnamon-soil-default-rtdb.asia-southeast1.firebasedatabase.app/"

#define USER_EMAIL "myprolab222@gmail.com"
#define USER_PASSWORD "Abcd12345"

#define STATUS_LED 2
#define MEGA_RX 16
#define MEGA_TX 17

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool firebaseReady = false;
bool signupOK = false;
unsigned long lastReconnectAttempt = 0;
const unsigned long RECONNECT_INTERVAL = 30000;

struct SensorData {
  uint8_t measurement;
  float temperature;
  float moisture;
  float ec;
  float ph;
  uint16_t nitrogen;
  uint16_t phosphorus;
  uint16_t potassium;
  unsigned long timestamp;
  long baud;
  uint8_t address;
  uint16_t registerAddr;
  bool valid;
};

SensorData currentData;

void setup() {
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, MEGA_RX, MEGA_TX);
  
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);
  
  Serial.println("\n================================================");
  Serial.println("   SN-3002 ESP32 FIREBASE GATEWAY");
  Serial.println("================================================\n");
  
  connectToWiFi();
  
  setupFirebase();
  
  Serial2.println("ESP32:READY");
  
  Serial.println("\n✅ System Initialized Successfully!");
  Serial.println("📡 Listening for Arduino Mega data...");
  Serial.println("================================================\n");
}

void loop() {
  if (Serial2.available() > 0) {
    String incoming = Serial2.readStringUntil('\n');
    incoming.trim();
    processMegaData(incoming);
  }
  
  maintainFirebaseConnection();
  
  if (!signupOK) {
    checkFirebaseAuth();
  }
}

void connectToWiFi() {
  Serial.print("📶 Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) { 
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED)); 
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📱 IP Address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(STATUS_LED, HIGH);
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    digitalWrite(STATUS_LED, LOW);
    Serial.println("Please check WiFi credentials and try again.");
    while (1) delay(1000); 
  }
}

void setupFirebase() {
  Serial.println("\n🔥 Initializing Firebase...");
  
  config.api_key = API_KEY;
  
  config.database_url = DATABASE_URL;
  
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  
  config.token_status_callback = tokenStatusCallback;
  
  fbdo.setBSSLBufferSize(4096, 1024);
  
  fbdo.setResponseSize(2048);
  
  config.timeout.serverResponse = 30 * 1000; 
  
  Firebase.begin(&config, &auth);
  
  Firebase.reconnectWiFi(true);
  
  Serial.println("✅ Firebase configuration complete.");
  Serial.println("⏳ Waiting for authentication...");
}

void checkFirebaseAuth() {
  unsigned long authStart = millis();
  while (!signupOK && millis() - authStart < 60000) { 
    if (Firebase.ready()) {
      signupOK = true;
      firebaseReady = true;
      Serial.println("✅ Firebase Authentication Successful!");
      Serial.print("👤 User UID: ");
      Serial.println(auth.token.uid.c_str());
      break;
    }
    delay(500);
    Serial.print(".");
  }
  
  if (!signupOK) {
    Serial.println("\n❌ Firebase Authentication Failed!");
    Serial.println("Please check:");
    Serial.println("1. USER_EMAIL and USER_PASSWORD in code");
    Serial.println("2. User exists in Firebase Authentication console");
    Serial.println("3. API_KEY and DATABASE_URL are correct");
  }
}

void maintainFirebaseConnection() {
  static unsigned long lastCheck = 0;
  
  if (millis() - lastCheck > 10000) { 
    lastCheck = millis();
    
    if (!Firebase.ready() && signupOK) {
      Serial.println("⚠️  Firebase connection lost. Reconnecting...");
      firebaseReady = false;
      
      Firebase.begin(&config, &auth);
      
      unsigned long reconnectStart = millis();
      while (!Firebase.ready() && millis() - reconnectStart < 10000) {
        delay(500);
        Serial.print(".");
      }
      
      if (Firebase.ready()) {
        firebaseReady = true;
        Serial.println("\n✅ Firebase reconnected!");
      } else {
        Serial.println("\n❌ Firebase reconnection failed!");
      }
    }
  }
}

void processMegaData(String data) {
  if (data.length() == 0) return;
  
  Serial.print("📨 From Mega: ");
  Serial.println(data);
  
  if (data.startsWith("MEGA:FIREBASE:")) {
    String csvData = data.substring(14);
    if (parseCSVData(csvData)) {
      Serial.println("✅ Data parsed successfully");
      
      if (firebaseReady && currentData.valid) {
        sendToFirebase();
      } else {
        Serial.println("⚠️  Data valid but Firebase not ready");
      }
    } else {
      Serial.println("❌ Failed to parse CSV data");
    }
  }
  else if (data.startsWith("MEGA:HEARTBEAT")) {
    Serial2.println("ESP32:PONG"); 
  }
  else if (data.startsWith("MEGA:PING")) {
    Serial2.println("ESP32:PONG");
  }
  else if (data.startsWith("MEGA:RT_DATA")) {
  }
}

bool parseCSVData(String csv) {
  memset(&currentData, 0, sizeof(currentData));
  currentData.valid = false;
  
  int values[12];
  int valueCount = 0;
  int startIdx = 0;
  
  while (startIdx < csv.length() && valueCount < 12) {
    int commaIdx = csv.indexOf(',', startIdx);
    if (commaIdx == -1) commaIdx = csv.length();
    
    String valueStr = csv.substring(startIdx, commaIdx);
    
    switch (valueCount) {
      case 0: 
        currentData.measurement = valueStr.toInt();
        break;
      case 1: 
        currentData.temperature = valueStr.toFloat();
        break;
      case 2: 
        currentData.moisture = valueStr.toFloat();
        break;
      case 3: 
        currentData.ec = valueStr.toFloat();
        break;
      case 4: 
        currentData.ph = valueStr.toFloat();
        break;
      case 5: 
        currentData.nitrogen = valueStr.toInt();
        break;
      case 6: 
        currentData.phosphorus = valueStr.toInt();
        break;
      case 7: 
        currentData.potassium = valueStr.toInt();
        break;
      case 8: 
        currentData.timestamp = valueStr.toInt();
        break;
      case 9: 
        currentData.baud = valueStr.toInt();
        break;
      case 10: 
        currentData.address = valueStr.toInt();
        break;
      case 11: 
        if (valueStr.startsWith("0x")) {
          currentData.registerAddr = strtoul(valueStr.c_str(), NULL, 16);
        } else {
          currentData.registerAddr = valueStr.toInt();
        }
        break;
    }
    
    startIdx = commaIdx + 1;
    valueCount++;
  }
  
  if (valueCount >= 9) { 
    currentData.valid = true;
    
    Serial.println("📊 Parsed Sensor Data:");
    Serial.printf("   Measurement: %d\n", currentData.measurement);
    Serial.printf("   Temperature: %.1f°C\n", currentData.temperature);
    Serial.printf("   Moisture: %.1f%%\n", currentData.moisture);
    Serial.printf("   EC: %.1f mS/cm\n", currentData.ec);
    Serial.printf("   pH: %.1f\n", currentData.ph);
    Serial.printf("   N-P-K: %d-%d-%d mg/kg\n", 
                  currentData.nitrogen, 
                  currentData.phosphorus, 
                  currentData.potassium);
    Serial.printf("   Config: %d baud, addr %d, reg 0x%04X\n",
                  currentData.baud, currentData.address, currentData.registerAddr);
    
    return true;
  }
  
  return false;
}

void sendToFirebase() {
  if (!currentData.valid) {
    Serial.println("❌ Cannot send: Invalid data");
    return;
  }
  
  if (!firebaseReady) {
    Serial.println("❌ Cannot send: Firebase not ready");
    return;
  }
  
  FirebaseJson json;
  FirebaseJson jsonConfig;
  
  json.set("measurement", currentData.measurement);
  json.set("temperature", currentData.temperature);
  json.set("moisture", currentData.moisture);
  json.set("ec", currentData.ec);
  json.set("ph", currentData.ph);
  json.set("nitrogen", currentData.nitrogen);
  json.set("phosphorus", currentData.phosphorus);
  json.set("potassium", currentData.potassium);
  json.set("timestamp", currentData.timestamp);
  json.set("device_timestamp", millis());
  
  jsonConfig.set("baud_rate", currentData.baud);
  jsonConfig.set("address", currentData.address);
  jsonConfig.set("register", currentData.registerAddr);
  json.set("config", jsonConfig);
  
  json.set("device_id", "SN-3002_Professional");
  json.set("firmware_version", "2.1");
  json.set("upload_time", millis());
  
  String path = "/sensor_data/";
  path += String(currentData.measurement);
  path += "_";
  path += String(millis());
  
  String latestPath = "/latest_reading";
  
  Serial.print("📤 Sending to Firebase: ");
  Serial.println(path);
  
  if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
    Serial.println("✅ Data sent to Firebase successfully!");
    
    if (Firebase.RTDB.setJSON(&fbdo, latestPath.c_str(), &json)) {
      Serial.println("✅ Latest reading updated!");
    }
    
    digitalWrite(STATUS_LED, LOW);
    delay(100);
    digitalWrite(STATUS_LED, HIGH);
    
    Serial2.println("ESP32:DATA_SENT");
    
  } else {
    Serial.print("❌ Failed to send data: ");
    Serial.println(fbdo.errorReason());
    
    if (fbdo.errorReason().indexOf("Permission denied") >= 0) {
      Serial.println("⚠️  Check Firebase Database Rules!");
      Serial.println("   Temporary rule for testing: {\"rules\":{\".read\":true,\".write\":true}}");
    }
    
    if (fbdo.errorReason().indexOf("not connected") >= 0) {
      firebaseReady = false;
      Serial.println("⚠️  Firebase connection lost. Will retry...");
    }
  }
}