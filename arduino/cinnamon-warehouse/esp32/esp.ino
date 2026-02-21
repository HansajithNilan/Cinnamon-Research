#include <Wire.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <U8g2lib.h>
#include <DHT.h>
#include <Preferences.h>
#include <time.h>

constexpr char WIFI_SSID[] = "DELL 8855";
constexpr char WIFI_PASSWORD[] = "11111111";
constexpr uint16_t WIFI_TIMEOUT_MS = 20000;
constexpr uint8_t MAX_WIFI_RETRIES = 3;

constexpr char FIREBASE_HOST[] = "cinnamon-warehouse-default-rtdb.asia-southeast1.firebasedatabase.app";
constexpr char FIREBASE_API_KEY[] = "AIzaSyDUFvbL5N39Jt_eAOf-X1RrDhkWOzBD0Fk";
constexpr char FIREBASE_DB_SECRET[] = "3mUMtHqpwRsj54UA0rTHVBEuNpMQdpKBxpTbJ5yv";

constexpr char NTP_SERVER1[] = "pool.ntp.org";
constexpr char NTP_SERVER2[] = "time.nist.gov";
constexpr long GMT_OFFSET_SEC = 19800;
constexpr int DAYLIGHT_OFFSET_SEC = 0;

constexpr uint8_t DHT_PIN = 4;
constexpr uint8_t DHT_TYPE = DHT22;
constexpr uint8_t MQ135_PIN = 39;
constexpr uint8_t LDR_ANALOG_PIN = 34;
constexpr uint8_t LDR_DIGITAL_PIN = 27;
constexpr uint8_t PIR_PIN = 26;
constexpr uint8_t OLED_SDA = 21;
constexpr uint8_t OLED_SCL = 22;
constexpr uint8_t BUZZER_PIN = 25;

constexpr uint16_t LDR_MIN_DARK = 2000;
constexpr uint16_t LDR_MAX_BRIGHT = 500;
constexpr float MQ135_RZERO = 76.63f;
constexpr float MQ135_RLOAD = 10.0f;

constexpr uint16_t ADC_MAX_VALUE = 4095;
constexpr float ADC_REF_VOLTAGE = 3.3f;

constexpr unsigned long SENSOR_READ_INTERVAL = 2000;
constexpr unsigned long DISPLAY_UPDATE_INTERVAL = 500;
constexpr unsigned long FIREBASE_UPDATE_INTERVAL = 30000;
constexpr unsigned long SCREEN_CHANGE_INTERVAL = 5000;

constexpr float TEMP_HIGH_THRESHOLD = 30.0f;
constexpr float TEMP_LOW_THRESHOLD = 15.0f;
constexpr float HUMIDITY_HIGH_THRESHOLD = 80.0f;
constexpr float HUMIDITY_LOW_THRESHOLD = 30.0f;
constexpr float CO2_THRESHOLD = 1000.0f;
constexpr float CO2_DANGER_THRESHOLD = 2000.0f;
constexpr float VOC_THRESHOLD = 500.0f;
constexpr float LUX_DARK_THRESHOLD = 50.0f;

U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE, OLED_SCL, OLED_SDA);
DHT dht(DHT_PIN, DHT_TYPE);
Preferences preferences;
FirebaseData fbdo;
FirebaseConfig fb_config;
FirebaseAuth fb_auth;
FirebaseJson fb_json;

float temperature = 0.0f;
float humidity = 0.0f;
float heat_index = 0.0f;
float dew_point = 0.0f;
float co2_ppm = 0.0f;
float corrected_co2 = 0.0f;
float voc_ppm = 0.0f;
float ammonia_ppm = 0.0f;
float benzene_ppm = 0.0f;
uint16_t light_raw = 0;
uint8_t brightness_percent = 0;
float lux = 0.0f;
bool light_is_bright = false;
bool motion_detected = false;
uint8_t motion_confidence = 0;

bool dht_valid = false;
bool wifi_connected = false;
bool firebase_connected = false;
bool display_available = true;
bool sensors_ok = false;
uint32_t uptime_seconds = 0;
uint32_t total_restarts = 0;
uint32_t successful_readings = 0;
uint32_t failed_readings = 0;
uint32_t free_heap = 0;
int8_t wifi_rssi = 0;
float cpu_temperature = 0.0f;

uint8_t alert_count = 0;
unsigned long last_alert_time = 0;
bool alert_active = false;
char active_alert[50] = "";
bool alert_indicator_on = false;

uint8_t current_screen = 0;
bool manual_screen_change = false;
char current_time_str[20] = "N/A";
char current_date_str[20] = "N/A";
char display_buffer[64];

unsigned long last_sensor_read = 0;
unsigned long last_display_update = 0;
unsigned long last_firebase_update = 0;
unsigned long last_screen_change = 0;
unsigned long last_watchdog_reset = 0;
unsigned long last_alert_blink = 0;
unsigned long last_cleanup_check = 0;

unsigned long last_detection_time = 0;
uint32_t total_detections = 0;
uint32_t detection_rate_5min = 0;

float mq135_baseline_resistance = 0.0f;
uint16_t ldr_dark_calibration = 2000;
uint16_t ldr_bright_calibration = 500;

void setup() {
    Serial.begin(115200);
    delay(2000);
    
    Serial.println("\n\n=========================================");
    Serial.println("ENVIRONMENTAL MONITORING SYSTEM v7.0");
    Serial.println("Professional Complete Edition");
    Serial.println("=========================================");
    
    initializeGPIO();
    
    initializePreferences();
    
    Serial.printf("Device ID: %s\n", getDeviceID().c_str());
    Serial.printf("ESP32 Chip: %s\n", ESP.getChipModel());
    Serial.printf("CPU Frequency: %d MHz\n", ESP.getCpuFreqMHz());
    Serial.printf("Flash Size: %d MB\n", ESP.getFlashChipSize() / (1024 * 1024));
    
    initializeDisplay();
    
    displaySplashScreen("EnvMon v7.0", "Initializing...");
    
    loadCalibrationData();
    
    initializeWiFi();
    
    if (wifi_connected) {
        initializeTime();
    }
    
    if (wifi_connected) {
        initializeFirebase();
    }
    
    initializeSensors();
    
    calibrateSensors();
    
    systemInitialized();
}

void initializeGPIO() {
    pinMode(LDR_DIGITAL_PIN, INPUT);
    pinMode(PIR_PIN, INPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
    
    analogReadResolution(12);
    analogSetAttenuation(ADC_11db);
    analogSetPinAttenuation(LDR_ANALOG_PIN, ADC_11db);
    analogSetPinAttenuation(MQ135_PIN, ADC_11db);
    
    Serial.println("GPIO initialized");
}

void initializePreferences() {
    preferences.begin("env_monitor", false);
    total_restarts = preferences.getUInt("restarts", 0) + 1;
    preferences.putUInt("restarts", total_restarts);
    Serial.printf("Restart Count: %u\n", total_restarts);
}

void initializeDisplay() {
    Wire.begin(OLED_SDA, OLED_SCL);
    Wire.setClock(100000);
    
    if (u8g2.begin()) {
        u8g2.setPowerSave(0);
        u8g2.setFont(u8g2_font_6x10_tr);
        u8g2.setFontRefHeightExtendedText();
        u8g2.setDrawColor(1);
        u8g2.setFontPosTop();
        u8g2.setFontDirection(0);
        u8g2.setContrast(150);
        Serial.println("OLED display initialized");
    } else {
        display_available = false;
        Serial.println("OLED display initialization failed");
    }
}

void initializeWiFi() {
    Serial.println("Connecting to WiFi...");
    displaySplashScreen("WiFi Connecting", WIFI_SSID);
    
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    WiFi.persistent(true);
    
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    unsigned long start_time = millis();
    uint8_t retries = 0;
    
    while (WiFi.status() != WL_CONNECTED && retries < MAX_WIFI_RETRIES) {
        if (millis() - start_time > WIFI_TIMEOUT_MS) {
            retries++;
            Serial.printf("WiFi timeout, retry %d/%d\n", retries, MAX_WIFI_RETRIES);
            WiFi.disconnect();
            delay(1000);
            WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
            start_time = millis();
        }
        delay(100);
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        wifi_connected = true;
        wifi_rssi = WiFi.RSSI();
        Serial.printf("WiFi connected. IP: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("Signal Strength: %d dBm\n", wifi_rssi);
    } else {
        Serial.println("WiFi connection failed");
    }
}

void initializeTime() {
    configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER1, NTP_SERVER2);
    
    Serial.println("Waiting for time synchronization...");
    for (int i = 0; i < 10; i++) {
        struct tm timeinfo;
        if (getLocalTime(&timeinfo)) {
            updateTimeStrings();
            Serial.println("Time synchronized with NTP");
            return;
        }
        delay(1000);
    }
    Serial.println("Time synchronization failed");
}

void initializeFirebase() {
    fb_config.host = FIREBASE_HOST;
    fb_config.api_key = FIREBASE_API_KEY;
    fb_config.signer.tokens.legacy_token = FIREBASE_DB_SECRET;
    
    fbdo.setResponseSize(2048);
    fbdo.setBSSLBufferSize(4096, 1024);
    
    Firebase.begin(&fb_config, &fb_auth);
    Firebase.reconnectWiFi(true);
    
    delay(2000);
    
    if (Firebase.ready()) {
        firebase_connected = true;
        Serial.println("Firebase connected successfully");
        
        sendDeviceInfoToFirebase();
    } else {
        Serial.printf("Firebase error: %s\n", fbdo.errorReason().c_str());
    }
}

void initializeSensors() {
    dht.begin();
    delay(2000);
    
    float test_temp = dht.readTemperature();
    float test_hum = dht.readHumidity();
    
    if (isnan(test_temp) || isnan(test_hum)) {
        Serial.println("DHT sensor test: ERROR");
    } else {
        Serial.printf("DHT test OK: %.1f°C, %.1f%%\n", test_temp, test_hum);
    }
    
    Serial.println("All sensors initialized");
}

void calibrateSensors() {
    Serial.println("Calibrating sensors...");
    displaySplashScreen("Calibrating", "Sensors...");
    
    calibrateMQ135();
    
    if (Serial.available() > 0) {
        String command = Serial.readStringUntil('\n');
        command.trim();
        if (command == "calibrate") {
            calibrateLDR();
        }
    }
}

void loadCalibrationData() {
    ldr_dark_calibration = preferences.getUInt("ldr_dark", 2000);
    ldr_bright_calibration = preferences.getUInt("ldr_bright", 500);
    
    if (ldr_dark_calibration > 0 && ldr_bright_calibration < 4095) {
        Serial.printf("LDR calibration loaded: Dark=%d, Bright=%d\n", 
                      ldr_dark_calibration, ldr_bright_calibration);
    }
}

void systemInitialized() {
    free_heap = ESP.getFreeHeap();
    cpu_temperature = temperatureRead();
    
    Serial.println("=== SYSTEM INITIALIZATION COMPLETE ===");
    Serial.printf("Free Heap: %u bytes\n", free_heap);
    Serial.printf("WiFi: %s\n", wifi_connected ? "Connected" : "Disconnected");
    Serial.printf("Firebase: %s\n", firebase_connected ? "Connected" : "Disconnected");
    Serial.printf("Internal Temp: %.1f°C\n", cpu_temperature);
    Serial.println("======================================");
    
    if (display_available) {
        displaySplashScreen("System Ready", "Monitoring...");
        delay(1000);
    }
}

void loop() {
    unsigned long current_time = millis();
    
    if (current_time - last_watchdog_reset > 300000) {
        Serial.println("Watchdog timeout! Restarting...");
        ESP.restart();
    }
    last_watchdog_reset = current_time;
    
    handleSerialCommands();
    
    if (current_time - last_sensor_read >= SENSOR_READ_INTERVAL) {
        last_sensor_read = current_time;
        readAllSensors();
        checkAlerts();
        updateSystemStatus(current_time);
    }
    
    if (display_available && current_time - last_display_update >= DISPLAY_UPDATE_INTERVAL) {
        last_display_update = current_time;
        updateDisplay(current_time);
    }
    
    if (!manual_screen_change && current_time - last_screen_change >= SCREEN_CHANGE_INTERVAL) {
        last_screen_change = current_time;
        current_screen = (current_screen + 1) % 5;
    }
    
    if (wifi_connected && firebase_connected &&
        current_time - last_firebase_update >= FIREBASE_UPDATE_INTERVAL) {
        last_firebase_update = current_time;
        sendToFirebase();
    }
    
    if (current_time % 30000 == 0) {
        manageConnections();
        checkSystemHealth();
    }
    
    if (alert_active && current_time - last_alert_blink >= 500) {
        last_alert_blink = current_time;
        alert_indicator_on = !alert_indicator_on;
    }
    
    if (current_time - last_cleanup_check >= 3600000) {
        last_cleanup_check = current_time;
        manageFirebaseData();
    }
    
    delay(10);
}

void readAllSensors() {
    bool dht_success = readTemperatureHumidity();
    readAirQuality();
    readLightCondition();
    readMotion();
    calculateDerivedValues();
    
    sensors_ok = dht_success;
    if (dht_success) {
        successful_readings++;
    } else {
        failed_readings++;
    }
}

bool readTemperatureHumidity() {
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    
    if (isnan(temp) || isnan(hum)) {
        delay(250);
        temp = dht.readTemperature();
        hum = dht.readHumidity();
    }
    
    if (isnan(temp) || isnan(hum)) {
        dht_valid = false;
        return false;
    }
    
    if (temp < -40 || temp > 80 || hum < 0 || hum > 100) {
        dht_valid = false;
        return false;
    }
    
    temperature = temp;
    humidity = hum;
    dht_valid = true;
    return true;
}

void readAirQuality() {
    uint32_t sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += analogRead(MQ135_PIN);
        delay(2);
    }
    
    int raw_adc = sum / 5;
    
    if (raw_adc <= 10 || raw_adc >= ADC_MAX_VALUE - 10) {
        corrected_co2 = 417.0f;
        voc_ppm = 0.0f;
        return;
    }
    
    float voltage = (raw_adc * ADC_REF_VOLTAGE) / ADC_MAX_VALUE;
    float resistance = ((ADC_REF_VOLTAGE - voltage) / voltage) * MQ135_RLOAD;
    
    float resistance_ratio = resistance / MQ135_RZERO;
    
    co2_ppm = 116.6020682f * pow(resistance_ratio, -2.769034857f);
    voc_ppm = 1000.0f / pow(resistance_ratio, 2.0f);
    ammonia_ppm = 100.0f / pow(resistance_ratio, 1.5f);
    benzene_ppm = 50.0f / pow(resistance_ratio, 1.8f);
    
    if (dht_valid) {
        float temp_corr = 1.0f + ((temperature - 25.0f) * 0.01f);
        float hum_corr = 1.0f + ((humidity - 50.0f) * 0.005f);
        corrected_co2 = co2_ppm * temp_corr * hum_corr;
    } else {
        corrected_co2 = co2_ppm;
    }
    
    corrected_co2 = constrain(corrected_co2, 300.0f, 5000.0f);
    voc_ppm = constrain(voc_ppm, 0.0f, 2000.0f);
    ammonia_ppm = constrain(ammonia_ppm, 0.0f, 100.0f);
    benzene_ppm = constrain(benzene_ppm, 0.0f, 50.0f);
}

void readLightCondition() {
    uint32_t sum = 0;
    for (int i = 0; i < 3; i++) {
        sum += analogRead(LDR_ANALOG_PIN);
        delay(1);
    }
    
    light_raw = sum / 3;
    light_is_bright = digitalRead(LDR_DIGITAL_PIN) == HIGH;
    
    if (light_raw >= ldr_dark_calibration) {
        brightness_percent = 0;
    } else if (light_raw <= ldr_bright_calibration) {
        brightness_percent = 100;
    } else {
        brightness_percent = map(light_raw, ldr_dark_calibration, ldr_bright_calibration, 0, 100);
    }
    
    lux = 500.0f / (brightness_percent / 100.0f);
}

void readMotion() {
    static uint8_t detection_history = 0;
    static unsigned long last_state_change = 0;
    
    detection_history = (detection_history << 1) | (digitalRead(PIR_PIN) == HIGH ? 1 : 0);
    
    uint8_t high_count = 0;
    for (int i = 0; i < 4; i++) {
        if (detection_history & (1 << i)) high_count++;
    }
    
    bool new_detection = (high_count >= 3);
    
    if (new_detection != motion_detected) {
        last_state_change = millis();
    }
    
    if (millis() - last_state_change > 150) {
        motion_detected = new_detection;
        motion_confidence = (high_count * 100) / 4;
        
        if (new_detection) {
            last_detection_time = millis();
            total_detections++;
        }
    }
}

void calculateDerivedValues() {
    if (dht_valid) {
        if (temperature < 27.0f || humidity < 40.0f) {
            heat_index = temperature;
        } else {
            heat_index = temperature + 0.5f * (temperature - 27.0f) * (humidity - 40.0f) / 100.0f;
        }
        
        float a = 17.27f;
        float b = 237.7f;
        float alpha = ((a * temperature) / (b + temperature)) + log(humidity / 100.0f);
        dew_point = (b * alpha) / (a - alpha);
    }
}

void calibrateMQ135() {
    Serial.println("Calibrating MQ135...");
    
    for (int i = 0; i < 30; i++) {
        analogRead(MQ135_PIN);
        delay(50);
    }
    
    uint32_t sum = 0;
    for (int i = 0; i < 50; i++) {
        sum += analogRead(MQ135_PIN);
        delay(10);
    }
    
    int baseline_adc = sum / 50;
    float baseline_resistance = ((ADC_REF_VOLTAGE - (baseline_adc * ADC_REF_VOLTAGE / ADC_MAX_VALUE)) / 
                                 (baseline_adc * ADC_REF_VOLTAGE / ADC_MAX_VALUE)) * MQ135_RLOAD;
    
    mq135_baseline_resistance = baseline_resistance;
    Serial.printf("MQ135 calibrated: R0 = %.2f\n", baseline_resistance);
}

void displaySplashScreen(const char* line1, const char* line2) {
    if (!display_available) return;
    
    u8g2.clearBuffer();
    u8g2.setFont(u8g2_font_6x10_tr);
    
    int line1_width = u8g2.getStrWidth(line1);
    int line2_width = u8g2.getStrWidth(line2);
    
    u8g2.drawStr((128 - line1_width) / 2, 20, line1);
    u8g2.drawStr((128 - line2_width) / 2, 40, line2);
    
    u8g2.sendBuffer();
}

void updateDisplay(unsigned long current_time) {
    if (!display_available) return;
    
    u8g2.clearBuffer();
    
    drawHeader(current_time);
    
    switch (current_screen) {
        case 0: displayMainScreen(); break;
        case 1: displayTemperatureHumidityScreen(); break;
        case 2: displayAirQualityScreen(); break;
        case 3: displayLightScreen(); break;
        case 4: displayMotionScreen(); break;
    }
    
    drawFooter();
    
    u8g2.sendBuffer();
}

void drawHeader(unsigned long current_time) {
    u8g2.setFont(u8g2_font_5x7_tr);
    
    updateTimeStrings();
    u8g2.drawStr(0, 0, current_time_str);
    
    if (wifi_connected) {
        u8g2.drawStr(70, 0, "WiFi");
        if (wifi_rssi > -60) {
            u8g2.drawStr(95, 0, "▇");
        } else if (wifi_rssi > -70) {
            u8g2.drawStr(95, 0, "▆");
        } else {
            u8g2.drawStr(95, 0, "▂");
        }
    } else {
        u8g2.drawStr(70, 0, "No WiFi");
    }
    
    if (firebase_connected) {
        u8g2.drawStr(110, 0, "☁");
    }
    
    if (alert_active && alert_indicator_on) {
        u8g2.drawStr(120, 0, "!");
    }
    
    u8g2.drawHLine(0, 8, 128);
}

void drawFooter() {
    u8g2.setFont(u8g2_font_5x7_tr);
    u8g2.drawHLine(0, 56, 128);
    
    snprintf(display_buffer, sizeof(display_buffer), "Screen %d/5", current_screen + 1);
    u8g2.drawStr(0, 58, display_buffer);
    
    if (manual_screen_change) {
        u8g2.drawStr(90, 58, "Manual");
    } else {
        u8g2.drawStr(90, 58, "Auto");
    }
}

void displayMainScreen() {
    u8g2.setFont(u8g2_font_6x10_tr);
    
    u8g2.drawStr(0, 10, "Dashboard");
    u8g2.drawHLine(0, 20, 128);
    
    if (dht_valid) {
        snprintf(display_buffer, sizeof(display_buffer), "T:%.1f°C H:%.0f%%", temperature, humidity);
    } else {
        snprintf(display_buffer, sizeof(display_buffer), "T:--- H:---");
    }
    u8g2.drawStr(0, 22, display_buffer);
    
    snprintf(display_buffer, sizeof(display_buffer), "CO2:%.0f ppm", corrected_co2);
    u8g2.drawStr(0, 34, display_buffer);
    
    snprintf(display_buffer, sizeof(display_buffer), "Light:%d%%", brightness_percent);
    u8g2.drawStr(0, 46, display_buffer);
    
    snprintf(display_buffer, sizeof(display_buffer), "Motion:%s", motion_detected ? "YES" : "NO");
    u8g2.drawStr(70, 46, display_buffer);
}

void displayTemperatureHumidityScreen() {
    u8g2.setFont(u8g2_font_6x10_tr);
    u8g2.drawStr(0, 10, "Temperature & Humidity");
    u8g2.drawHLine(0, 20, 128);
    
    if (!dht_valid) {
        u8g2.drawStr(10, 30, "Sensor Error!");
        return;
    }
    
    u8g2.drawStr(0, 22, "Temperature:");
    snprintf(display_buffer, sizeof(display_buffer), "%5.1f °C", temperature);
    u8g2.drawStr(80, 22, display_buffer);
    
    u8g2.drawStr(0, 34, "Humidity:");
    snprintf(display_buffer, sizeof(display_buffer), "%5.1f %%", humidity);
    u8g2.drawStr(80, 34, display_buffer);
    
    u8g2.drawStr(0, 46, "Air Moisture:");
    snprintf(display_buffer, sizeof(display_buffer), "%5.1f %%", humidity);
    u8g2.drawStr(80, 46, display_buffer);
}

void displayAirQualityScreen() {
    u8g2.setFont(u8g2_font_6x10_tr);
    u8g2.drawStr(0, 10, "Air Quality");
    u8g2.drawHLine(0, 20, 128);
    
    u8g2.drawStr(0, 22, "CO2:");
    snprintf(display_buffer, sizeof(display_buffer), "%5.0f ppm", corrected_co2);
    u8g2.drawStr(40, 22, display_buffer);
    
    if (corrected_co2 <= 450) {
        u8g2.drawStr(90, 22, "✓");
    } else if (corrected_co2 <= 1000) {
        u8g2.drawStr(90, 22, "⚠");
    } else {
        u8g2.drawStr(90, 22, "✗");
    }
    
    u8g2.drawStr(0, 34, "VOC:");
    snprintf(display_buffer, sizeof(display_buffer), "%5.0f ppm", voc_ppm);
    u8g2.drawStr(40, 34, display_buffer);
    
    if (corrected_co2 <= 450) {
        u8g2.drawStr(0, 46, "Air Quality: Excellent");
    } else if (corrected_co2 <= 600) {
        u8g2.drawStr(0, 46, "Air Quality: Good");
    } else if (corrected_co2 <= 1000) {
        u8g2.drawStr(0, 46, "Air Quality: Moderate");
    } else if (corrected_co2 <= 1500) {
        u8g2.drawStr(0, 46, "Air Quality: Poor");
    } else {
        u8g2.drawStr(0, 46, "Air Quality: Hazardous");
    }
}

void displayLightScreen() {
    u8g2.setFont(u8g2_font_6x10_tr);
    u8g2.drawStr(0, 10, "Light Condition");
    u8g2.drawHLine(0, 20, 128);
    
    u8g2.drawStr(0, 22, "Brightness:");
    snprintf(display_buffer, sizeof(display_buffer), "%3d %%", brightness_percent);
    u8g2.drawStr(80, 22, display_buffer);
    
    u8g2.drawStr(0, 34, "Lux:");
    snprintf(display_buffer, sizeof(display_buffer), "%5.0f", lux);
    u8g2.drawStr(80, 34, display_buffer);
    
    u8g2.drawStr(0, 46, "Status:");
    snprintf(display_buffer, sizeof(display_buffer), "%s", light_is_bright ? "BRIGHT" : "DARK");
    u8g2.drawStr(80, 46, display_buffer);
}

void displayMotionScreen() {
    u8g2.setFont(u8g2_font_6x10_tr);
    u8g2.drawStr(0, 10, "Motion Detection");
    u8g2.drawHLine(0, 20, 128);
    
    u8g2.drawStr(0, 22, "Status:");
    if (motion_detected) {
        u8g2.drawStr(40, 22, "MOTION DETECTED");
    } else {
        u8g2.drawStr(40, 22, "NO MOTION");
    }
    
    u8g2.drawStr(0, 34, "Confidence:");
    snprintf(display_buffer, sizeof(display_buffer), "%3d %%", motion_confidence);
    u8g2.drawStr(80, 34, display_buffer);
    
    u8g2.drawStr(0, 46, "Total:");
    snprintf(display_buffer, sizeof(display_buffer), "%5lu", total_detections);
    u8g2.drawStr(80, 46, display_buffer);
}

void sendToFirebase() {
    if (!firebase_connected || !Firebase.ready()) {
        return;
    }
    
    String device_id = getDeviceID();
    unsigned long timestamp = millis();
    
    sendMainReading(device_id, timestamp);
    
    updateCurrentReading(device_id);
    
    storeSeparateData(device_id, timestamp);
}

void sendMainReading(String device_id, unsigned long timestamp) {
    FirebaseJson reading_json;
    
    reading_json.set("device_id", device_id);
    reading_json.set("timestamp", timestamp);
    reading_json.set("date", current_date_str);
    reading_json.set("time", current_time_str);
    
    if (dht_valid) {
        reading_json.set("temperature_c", temperature);
        reading_json.set("humidity_percent", humidity);
        reading_json.set("air_moisture_percent", humidity);
        reading_json.set("heat_index_c", heat_index);
        reading_json.set("dew_point_c", dew_point);
    }
    
    reading_json.set("co2_ppm", corrected_co2);
    reading_json.set("voc_ppm", voc_ppm);
    reading_json.set("ammonia_ppm", ammonia_ppm);
    reading_json.set("benzene_ppm", benzene_ppm);
    
    if (corrected_co2 <= 450) {
        reading_json.set("air_quality", "Excellent");
    } else if (corrected_co2 <= 600) {
        reading_json.set("air_quality", "Good");
    } else if (corrected_co2 <= 1000) {
        reading_json.set("air_quality", "Moderate");
    } else if (corrected_co2 <= 1500) {
        reading_json.set("air_quality", "Poor");
    } else {
        reading_json.set("air_quality", "Hazardous");
    }
    
    reading_json.set("light_raw", light_raw);
    reading_json.set("brightness_percent", brightness_percent);
    reading_json.set("lux", lux);
    reading_json.set("light_digital", light_is_bright);
    
    reading_json.set("motion_detected", motion_detected);
    reading_json.set("motion_confidence", motion_confidence);
    
    reading_json.set("wifi_rssi", wifi_rssi);
    reading_json.set("uptime_seconds", uptime_seconds);
    reading_json.set("free_heap", free_heap);
    
    String path = "devices/" + device_id + "/readings/" + String(timestamp);
    
    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &reading_json)) {
        Serial.println("Main reading sent to Firebase");
    } else {
        Serial.printf("Error sending main reading: %s\n", fbdo.errorReason().c_str());
    }
}

void updateCurrentReading(String device_id) {
    FirebaseJson current_json;
    
    if (dht_valid) {
        current_json.set("temperature", temperature);
        current_json.set("humidity", humidity);
        current_json.set("air_moisture", humidity);
    }
    
    current_json.set("co2", corrected_co2);
    current_json.set("voc", voc_ppm);
    
    if (corrected_co2 <= 450) {
        current_json.set("air_quality", "Excellent");
    } else if (corrected_co2 <= 600) {
        current_json.set("air_quality", "Good");
    } else if (corrected_co2 <= 1000) {
        current_json.set("air_quality", "Moderate");
    } else if (corrected_co2 <= 1500) {
        current_json.set("air_quality", "Poor");
    } else {
        current_json.set("air_quality", "Hazardous");
    }
    
    current_json.set("brightness", brightness_percent);
    current_json.set("lux", lux);
    current_json.set("motion", motion_detected);
    current_json.set("last_update", current_time_str);
    
    String path = "devices/" + device_id + "/current";
    
    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &current_json)) {
    }
}

void storeSeparateData(String device_id, unsigned long timestamp) {
    FirebaseJson temp_json;
    temp_json.set("value", temperature);
    temp_json.set("timestamp", timestamp);
    temp_json.set("date_time", String(current_date_str) + " " + String(current_time_str));
    temp_json.set("unit", "°C");
    
    String temp_path = "devices/" + device_id + "/temperature_data/" + current_date_str + "/" + String(timestamp);
    Firebase.RTDB.setJSON(&fbdo, temp_path.c_str(), &temp_json);
    
    FirebaseJson hum_json;
    hum_json.set("value", humidity);
    hum_json.set("timestamp", timestamp);
    hum_json.set("date_time", String(current_date_str) + " " + String(current_time_str));
    hum_json.set("unit", "%");
    
    String hum_path = "devices/" + device_id + "/humidity_data/" + current_date_str + "/" + String(timestamp);
    Firebase.RTDB.setJSON(&fbdo, hum_path.c_str(), &hum_json);
    
    FirebaseJson air_json;
    air_json.set("co2", corrected_co2);
    air_json.set("voc", voc_ppm);
    air_json.set("timestamp", timestamp);
    air_json.set("date_time", String(current_date_str) + " " + String(current_time_str));
    
    String air_path = "devices/" + device_id + "/air_quality_data/" + current_date_str + "/" + String(timestamp);
    Firebase.RTDB.setJSON(&fbdo, air_path.c_str(), &air_json);
    
    FirebaseJson light_json;
    light_json.set("brightness", brightness_percent);
    light_json.set("lux", lux);
    light_json.set("raw", light_raw);
    light_json.set("timestamp", timestamp);
    light_json.set("date_time", String(current_date_str) + " " + String(current_time_str));
    
    String light_path = "devices/" + device_id + "/light_data/" + current_date_str + "/" + String(timestamp);
    Firebase.RTDB.setJSON(&fbdo, light_path.c_str(), &light_json);
    
    if (motion_detected) {
        FirebaseJson motion_json;
        motion_json.set("detected", true);
        motion_json.set("timestamp", timestamp);
        motion_json.set("date_time", String(current_date_str) + " " + String(current_time_str));
        
        String motion_path = "devices/" + device_id + "/motion_data/" + current_date_str + "/" + String(timestamp);
        Firebase.RTDB.setJSON(&fbdo, motion_path.c_str(), &motion_json);
    }
}

void sendDeviceInfoToFirebase() {
    FirebaseJson device_info;
    
    device_info.set("device_id", getDeviceID());
    device_info.set("device_name", "Cinnamon Warehouse Monitor");
    device_info.set("location", "Cinnamon Warehouse");
    device_info.set("firmware_version", "7.0.0");
    device_info.set("esp32_model", ESP.getChipModel());
    device_info.set("mac_address", WiFi.macAddress());
    device_info.set("ip_address", WiFi.localIP().toString());
    device_info.set("first_boot", getDateTimeString());
    device_info.set("last_seen", getDateTimeString());
    
    FirebaseJson sensors;
    sensors.set("temperature_humidity", "DHT22");
    sensors.set("air_quality", "MQ135");
    sensors.set("light", "LDR");
    sensors.set("motion", "PIR");
    
    device_info.set("sensors", sensors);
    
    String path = "devices/" + getDeviceID() + "/device_info";
    
    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &device_info)) {
        Serial.println("Device info sent to Firebase");
    }
}

void manageFirebaseData() {
    if (firebase_connected) {
        String device_id = getDeviceID();
        String path = "devices/" + device_id + "/readings";
        
        Serial.println("Firebase data management check completed");
    }
}

void checkAlerts() {
    if (millis() - last_alert_time < 10000) return;
    
    bool new_alert = false;
    char alert_message[50];
    
    if (dht_valid) {
        if (temperature > TEMP_HIGH_THRESHOLD) {
            snprintf(alert_message, sizeof(alert_message), "High Temp: %.1f°C", temperature);
            triggerAlert("Temperature", alert_message);
            new_alert = true;
        } else if (temperature < TEMP_LOW_THRESHOLD) {
            snprintf(alert_message, sizeof(alert_message), "Low Temp: %.1f°C", temperature);
            triggerAlert("Temperature", alert_message);
            new_alert = true;
        }
        
        if (humidity > HUMIDITY_HIGH_THRESHOLD) {
            snprintf(alert_message, sizeof(alert_message), "High Humidity: %.1f%%", humidity);
            triggerAlert("Humidity", alert_message);
            new_alert = true;
        } else if (humidity < HUMIDITY_LOW_THRESHOLD) {
            snprintf(alert_message, sizeof(alert_message), "Low Humidity: %.1f%%", humidity);
            triggerAlert("Humidity", alert_message);
            new_alert = true;
        }
    }
    
    if (corrected_co2 > CO2_DANGER_THRESHOLD) {
        snprintf(alert_message, sizeof(alert_message), "Dangerous CO2: %.0f ppm", corrected_co2);
        triggerAlert("Air Quality", alert_message);
        new_alert = true;
    } else if (corrected_co2 > CO2_THRESHOLD) {
        snprintf(alert_message, sizeof(alert_message), "High CO2: %.0f ppm", corrected_co2);
        triggerAlert("Air Quality", alert_message);
        new_alert = true;
    }
    
    if (voc_ppm > VOC_THRESHOLD) {
        snprintf(alert_message, sizeof(alert_message), "High VOC: %.0f ppm", voc_ppm);
        triggerAlert("Air Quality", alert_message);
        new_alert = true;
    }
    
    if (lux < LUX_DARK_THRESHOLD) {
        snprintf(alert_message, sizeof(alert_message), "Very Dark: %.0f lux", lux);
        triggerAlert("Light", alert_message);
        new_alert = true;
    }
    
    alert_active = new_alert;
}

void triggerAlert(const char* sensor, const char* message) {
    alert_count++;
    last_alert_time = millis();
    strncpy(active_alert, message, sizeof(active_alert) - 1);
    
    Serial.printf("[ALERT #%d] %s: %s\n", alert_count, sensor, message);
    
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    
    if (firebase_connected) {
        sendAlertToFirebase(sensor, message);
    }
}

void sendAlertToFirebase(const char* alert_type, const char* message) {
    FirebaseJson alert_json;
    alert_json.set("device_id", getDeviceID());
    alert_json.set("timestamp", millis());
    alert_json.set("date_time", getDateTimeString());
    alert_json.set("alert_type", alert_type);
    alert_json.set("message", message);
    alert_json.set("temperature", temperature);
    alert_json.set("humidity", humidity);
    alert_json.set("co2", corrected_co2);
    alert_json.set("voc", voc_ppm);
    alert_json.set("location", "Cinnamon Warehouse");
    
    String path = "devices/" + getDeviceID() + "/alerts/" + String(millis());
    
    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &alert_json)) {
        Serial.println("Alert sent to Firebase");
    } else {
        Serial.printf("Failed to send alert: %s\n", fbdo.errorReason().c_str());
    }
}

void updateSystemStatus(unsigned long current_time) {
    uptime_seconds = current_time / 1000;
    free_heap = ESP.getFreeHeap();
    
    if (current_time % 60000 == 0) {
        cpu_temperature = temperatureRead();
    }
}

void manageConnections() {
    if (WiFi.status() != WL_CONNECTED) {
        wifi_connected = false;
        firebase_connected = false;
        
        Serial.println("WiFi disconnected, reconnecting...");
        WiFi.reconnect();
        delay(2000);
        
        if (WiFi.status() == WL_CONNECTED) {
            wifi_connected = true;
            wifi_rssi = WiFi.RSSI();
            Serial.println("WiFi reconnected");
            
            initializeTime();
        }
    }
    
    if (wifi_connected && !firebase_connected) {
        Serial.println("Attempting Firebase reconnection...");
        initializeFirebase();
    }
}

void checkSystemHealth() {
    if (free_heap < 10000) {
        Serial.printf("[WARNING] Low heap memory: %u bytes\n", free_heap);
    }
    
    if (wifi_connected && wifi_rssi < -80) {
        Serial.printf("[WARNING] Weak WiFi signal: %d dBm\n", wifi_rssi);
    }
}

void updateTimeStrings() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        strcpy(current_time_str, "No Time");
        strcpy(current_date_str, "No Date");
        return;
    }
    
    strftime(current_time_str, sizeof(current_time_str), "%H:%M:%S", &timeinfo);
    
    strftime(current_date_str, sizeof(current_date_str), "%Y-%m-%d", &timeinfo);
}

String getDateTimeString() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        return "No Time";
    }
    
    char buffer[30];
    strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", &timeinfo);
    return String(buffer);
}

String getDeviceID() {
    uint64_t chipid = ESP.getEfuseMac();
    char device_id[17];
    snprintf(device_id, sizeof(device_id), "%04X%08X", 
             (uint16_t)(chipid >> 32), (uint32_t)chipid);
    return String(device_id);
}

void handleSerialCommands() {
    if (Serial.available() > 0) {
        String command = Serial.readStringUntil('\n');
        command.trim();
        
        if (command == "help") {
            printHelp();
        } else if (command == "status") {
            logSensorData();
        } else if (command == "calibrate") {
            calibrateLDR();
        } else if (command == "next") {
            current_screen = (current_screen + 1) % 5;
            manual_screen_change = true;
            Serial.printf("Screen changed to: %d\n", current_screen);
        } else if (command == "reset") {
            alert_count = 0;
            alert_active = false;
            Serial.println("Alert counter reset");
        } else if (command == "wifi") {
            Serial.printf("WiFi: %s, RSSI: %d dBm\n", 
                          wifi_connected ? "Connected" : "Disconnected", wifi_rssi);
        } else if (command == "firebase") {
            Serial.printf("Firebase: %s\n", firebase_connected ? "Connected" : "Disconnected");
        } else if (command == "restart") {
            Serial.println("Restarting system...");
            delay(1000);
            ESP.restart();
        } else if (command == "diagnostics") {
            runDiagnostics();
        }
    }
}

void printHelp() {
    Serial.println("\n=== ENVIRONMENTAL MONITOR COMMANDS ===");
    Serial.println("help         - Show this help");
    Serial.println("status       - Show sensor status");
    Serial.println("calibrate    - Calibrate LDR sensor");
    Serial.println("next         - Next display screen");
    Serial.println("reset        - Reset alert counter");
    Serial.println("wifi         - Show WiFi status");
    Serial.println("firebase     - Show Firebase status");
    Serial.println("restart      - Restart the system");
    Serial.println("diagnostics  - Run system diagnostics");
    Serial.println("======================================\n");
}

void calibrateLDR() {
    Serial.println("\n=== LDR CALIBRATION ===");
    Serial.println("1. Cover LDR for DARK calibration (5 seconds)");
    Serial.println("2. Expose to light for BRIGHT calibration (5 seconds)");
    
    if (display_available) {
        displaySplashScreen("LDR Calibration", "Cover LDR for DARK");
    }
    delay(5000);
    
    uint32_t dark_sum = 0;
    for (int i = 0; i < 20; i++) {
        dark_sum += analogRead(LDR_ANALOG_PIN);
        delay(100);
    }
    ldr_dark_calibration = dark_sum / 20;
    
    Serial.printf("DARK reading: %d\n", ldr_dark_calibration);
    
    if (display_available) {
        u8g2.clearBuffer();
        u8g2.drawStr(10, 20, "Dark Reading:");
        snprintf(display_buffer, sizeof(display_buffer), "%d", ldr_dark_calibration);
        u8g2.drawStr(10, 40, display_buffer);
        u8g2.sendBuffer();
    }
    delay(3000);
    
    Serial.println("\nNow expose LDR to bright light...");
    if (display_available) {
        displaySplashScreen("LDR Calibration", "Expose to BRIGHT light");
    }
    delay(5000);
    
    uint32_t bright_sum = 0;
    for (int i = 0; i < 20; i++) {
        bright_sum += analogRead(LDR_ANALOG_PIN);
        delay(100);
    }
    ldr_bright_calibration = bright_sum / 20;
    
    Serial.printf("BRIGHT reading: %d\n", ldr_bright_calibration);
    
    if (display_available) {
        u8g2.clearBuffer();
        u8g2.drawStr(10, 20, "Bright Reading:");
        snprintf(display_buffer, sizeof(display_buffer), "%d", ldr_bright_calibration);
        u8g2.drawStr(10, 40, display_buffer);
        u8g2.sendBuffer();
    }
    delay(3000);
    
    preferences.putUInt("ldr_dark", ldr_dark_calibration);
    preferences.putUInt("ldr_bright", ldr_bright_calibration);
    
    Serial.println("\n=== CALIBRATION RESULTS ===");
    Serial.printf("DARK: %d, BRIGHT: %d\n", ldr_dark_calibration, ldr_bright_calibration);
    Serial.println("Calibration saved to preferences");
    
    if (display_available) {
        displaySplashScreen("Calibration", "Complete!");
    }
    delay(2000);
}

void logSensorData() {
    Serial.println("\n=== SENSOR DATA ===");
    
    if (dht_valid) {
        Serial.printf("Temperature: %.1f°C | Humidity: %.1f%%\n", temperature, humidity);
        Serial.printf("Air Moisture: %.1f%% | Heat Index: %.1f°C\n", humidity, heat_index);
    } else {
        Serial.println("DHT22: Sensor Error");
    }
    
    Serial.printf("Air Quality: CO2=%.0f ppm | VOC=%.0f ppm\n", corrected_co2, voc_ppm);
    Serial.printf("Light: Raw=%d | %d%% | Lux=%.0f | %s\n", 
                  light_raw, brightness_percent, lux, 
                  light_is_bright ? "BRIGHT" : "DARK");
    Serial.printf("Motion: %s | Confidence: %d%%\n",
                  motion_detected ? "DETECTED" : "NO MOTION", motion_confidence);
    Serial.printf("WiFi: %s | RSSI: %d dBm | Firebase: %s\n",
                  wifi_connected ? "Connected" : "Disconnected", wifi_rssi,
                  firebase_connected ? "Connected" : "Disconnected");
    Serial.printf("Uptime: %lu sec | Heap: %u bytes\n", uptime_seconds, free_heap);
    Serial.println("===================\n");
}

void runDiagnostics() {
    Serial.println("\n=== SYSTEM DIAGNOSTICS ===");
    
    Serial.println("1. Sensor Check:");
    Serial.printf("   DHT22: %s\n", dht_valid ? "OK" : "ERROR");
    Serial.printf("   MQ135: ADC=%d\n", analogRead(MQ135_PIN));
    Serial.printf("   LDR: Raw=%d, Bright=%s\n", light_raw, light_is_bright ? "YES" : "NO");
    Serial.printf("   PIR: %s\n", digitalRead(PIR_PIN) == HIGH ? "ACTIVE" : "INACTIVE");
    
    Serial.println("2. System Check:");
    Serial.printf("   Free Heap: %u bytes\n", ESP.getFreeHeap());
    Serial.printf("   Uptime: %lu seconds\n", uptime_seconds);
    Serial.printf("   CPU Temperature: %.1f°C\n", cpu_temperature);
    
    Serial.println("3. Network Check:");
    Serial.printf("   WiFi: %s\n", wifi_connected ? "CONNECTED" : "DISCONNECTED");
    if (wifi_connected) {
        Serial.printf("   IP: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("   RSSI: %d dBm\n", wifi_rssi);
    }
    Serial.printf("   Firebase: %s\n", firebase_connected ? "CONNECTED" : "DISCONNECTED");
    
    Serial.println("4. Readings:");
    Serial.printf("   Successful: %lu\n", successful_readings);
    Serial.printf("   Failed: %lu\n", failed_readings);
    Serial.printf("   Success Rate: %.1f%%\n", 
                  (successful_readings * 100.0f) / (successful_readings + failed_readings));
    
    Serial.println("=== END DIAGNOSTICS ===\n");
}