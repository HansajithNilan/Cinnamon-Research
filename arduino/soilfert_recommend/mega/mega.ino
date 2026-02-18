#include <ModbusMaster.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define RS485_RE_DE 4
#define STATUS_LED 13

#define ESP32_BAUD_RATE 115200

#define SCAN_BAUDS 4
#define SCAN_ADDRESSES 20
#define SCAN_REGISTERS 20

long baudRates[SCAN_BAUDS] = {4800, 9600, 19200, 38400};
uint8_t addresses[SCAN_ADDRESSES] = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20};
uint16_t registers[SCAN_REGISTERS] = {
  0x0000, 0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009,
  0x0064, 0x0065, 0x0066, 0x0067, 0x0068, 0x0069, 0x0100, 0x0101, 0x0200, 0x0201
};

#define ANALYSIS_TIME 30000
#define READ_INTERVAL 2000
#define AVERAGE_COUNT 5
#define RESULTS_DISPLAY_TIME 30000
#define DATA_CLEAR_TIME 5000
#define SCAN_DELAY 200
#define FIREBASE_SEND_INTERVAL 10000

#define BYPASS_VALIDATION true  // Set to true to skip validation, false for normal mode

#define MIN_TEMP 0.0
#define MAX_TEMP 60.0
#define MIN_MOISTURE 1.0
#define MAX_MOISTURE 80.0
#define MIN_EC 0.0
#define MAX_EC 50.0
#define MIN_PH 3.0
#define MAX_PH 10.0
#define MIN_NPK 1
#define MAX_NPK 2000

struct SensorConfig {
  long baudRate;
  uint8_t address;
  uint16_t startRegister;
  bool valid;
  uint8_t tempRegister;
  uint8_t moistureRegister;
  uint8_t ecRegister;
  uint8_t nRegister;
  uint8_t pRegister;
  uint8_t kRegister;
  uint8_t phRegister;
  float tempScale;
  float moistureScale;
  float ecScale;
  float phScale;
  float npkScale;
};

struct SensorData {
  float temperature;
  float moisture;
  float ec;
  uint16_t nitrogen;
  uint16_t phosphorus;
  uint16_t potassium;
  float ph;
  bool valid;
  bool inSoil;
  unsigned long timestamp;
  uint8_t measurementNumber;
};

struct Measurement {
  SensorData readings[AVERAGE_COUNT];
  SensorData averaged;
  uint8_t count;
  bool complete;
};

LiquidCrystal_I2C lcd(0x27, 20, 4);

ModbusMaster node;

enum SystemState {
  STATE_SCANNING,
  STATE_ANALYZING_SOIL,
  STATE_TAKE_MEASUREMENTS,
  STATE_DISPLAY_RESULTS,
  STATE_CLEAR_DATA,
  STATE_ERROR
};

SystemState systemState = STATE_SCANNING;
unsigned long stateStartTime = 0;
unsigned long lastReadTime = 0;
unsigned long lastFirebaseSend = 0;
unsigned long lastESP32Heartbeat = 0;
uint8_t measurementNumber = 1;
uint8_t successfulAnalysis = 0;
bool esp32Connected = false;

SensorConfig sensorConfig;
Measurement currentMeasurement;
SensorData currentReading;

char tempStr[8], moistStr[8], ecStr[8], phStr[8];
char nStr[8], pStr[8], kStr[8];

uint8_t currentBaudIndex = 0;
uint8_t currentAddressIndex = 0;
uint8_t currentRegisterIndex = 0;
bool scanComplete = false;

void initializeSystem();
bool scanForSensor();
bool testConfiguration(long baud, uint8_t addr, uint16_t reg);
void analyzeRegisterMapping(uint16_t* rawData);
bool analyzeSensorData(uint16_t* data, int count);
bool validateSensorData(SensorData* data);
void autoCalibrateScaling();
void resetMeasurement();
bool readSensor();
bool checkSoilConditions();
void takeMeasurementReading();
void calculateMeasurementAverage();
void formatAllValues();
void showScanningScreen();
void showScanResultsScreen();
void showAnalyzingScreen();
void showTakingMeasurementsScreen();
void showResultsScreen();
void showClearDataScreen();
void showErrorScreen(const char* error);
void clearLine(int line);
void centerText(int line, const char* text);
void formatFloat(char* buf, float value, int decimals, int width);
void formatInt(char* buf, uint16_t value, int width);
void preTransmission();
void postTransmission();
void sendToESP32();
void sendDataToFirebase();
void checkESP32Connection();
void sendHeartbeat();
void processESP32Commands();

void preTransmission() {
  digitalWrite(RS485_RE_DE, HIGH);
  delayMicroseconds(1000);
}

void postTransmission() {
  digitalWrite(RS485_RE_DE, LOW);
  delayMicroseconds(1000);
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(ESP32_BAUD_RATE);
  
  Serial.println("\n==================================================");
  Serial.println("   SN-3002 PROFESSIONAL REGISTER SCANNER");
  Serial.println("==================================================");
  Serial.println("System Initializing...");
  
  Wire.begin();
  pinMode(RS485_RE_DE, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(RS485_RE_DE, LOW);
  digitalWrite(STATUS_LED, LOW);
  
  lcd.init();
  lcd.backlight();
  lcd.clear();
  
  memset(&sensorConfig, 0, sizeof(sensorConfig));
  sensorConfig.tempScale = 10.0;
  sensorConfig.moistureScale = 10.0;
  sensorConfig.ecScale = 10.0;
  sensorConfig.phScale = 10.0;
  sensorConfig.npkScale = 1.0;
  
  resetMeasurement();
  stateStartTime = millis();
  lastFirebaseSend = millis();
  lastESP32Heartbeat = millis();
  
  Serial2.println("MEGA:INIT:READY");
  delay(1000);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SN-3002 PROFESSIONAL");
  lcd.setCursor(0, 1);
  lcd.print("Soil Sensor System");
  lcd.setCursor(0, 3);
  lcd.print("Initializing...");
  delay(2000);
}

void loop() {
  unsigned long currentTime = millis();
  unsigned long stateElapsed = currentTime - stateStartTime;
  
  checkESP32Connection();
  
  processESP32Commands();
  
  switch (systemState) {
    case STATE_SCANNING:
      showScanningScreen();
      digitalWrite(STATUS_LED, (currentTime % 200) < 100);
      
      if (!scanComplete) {
        if (currentTime - lastReadTime >= SCAN_DELAY) {
          lastReadTime = currentTime;
          
          if (scanForSensor()) {
            scanComplete = true;
            systemState = STATE_ANALYZING_SOIL;
            stateStartTime = currentTime;
            lcd.clear();
            Serial.println("\n=== SCAN COMPLETE ===");
            Serial.println("Proceeding to soil analysis...");
            
            Serial2.println("MEGA:SCAN_COMPLETE");
          }
        }
      }
      break;
      
    case STATE_ANALYZING_SOIL:
      showAnalyzingScreen();
      digitalWrite(STATUS_LED, (currentTime % 1000) < 500);
      
      if (currentTime - lastReadTime >= READ_INTERVAL) {
        lastReadTime = currentTime;
        
        if (readSensor()) {
          if (checkSoilConditions()) {
            successfulAnalysis++;
            
            Serial.print("Valid reading ");
            Serial.print(successfulAnalysis);
            Serial.print("/5 - T:");
            Serial.print(currentReading.temperature, 1);
            Serial.print("C M:");
            Serial.print(currentReading.moisture, 1);
            Serial.println("%");
            
            if (successfulAnalysis >= 5) {
              systemState = STATE_TAKE_MEASUREMENTS;
              stateStartTime = currentTime;
              lcd.clear();
              Serial.println("\n=== SOIL ANALYSIS COMPLETE ===");
              Serial.println("Proceeding to measurements...");
              
              Serial2.println("MEGA:ANALYSIS_COMPLETE");
            }
          } else {
            successfulAnalysis = 0;
          }
        }
      }
      
      if (stateElapsed > 60000) {
        Serial.println("\n=== SOIL ANALYSIS TIMEOUT ===");
        Serial.println("Sensor may not be properly inserted in soil.");
        systemState = STATE_ERROR;
        stateStartTime = currentTime;
        lcd.clear();
        Serial2.println("MEGA:ERROR:SOIL_TIMEOUT");
      }
      break;
      
    case STATE_TAKE_MEASUREMENTS:
      showTakingMeasurementsScreen();
      digitalWrite(STATUS_LED, (currentTime % 600) < 300);
      
      if (currentTime - lastReadTime >= READ_INTERVAL) {
        lastReadTime = currentTime;
        
        if (readSensor() && checkSoilConditions()) {
          takeMeasurementReading();
          
          sendToESP32();
          
          Serial.print("Measurement ");
          Serial.print(currentMeasurement.count);
          Serial.print("/");
          Serial.print(AVERAGE_COUNT);
          Serial.print(" - ");
          Serial.print("T:");
          Serial.print(currentReading.temperature, 1);
          Serial.print("C M:");
          Serial.print(currentReading.moisture, 1);
          Serial.print("% EC:");
          Serial.print(currentReading.ec, 1);
          Serial.print(" pH:");
          Serial.print(currentReading.ph, 1);
          Serial.print(" N:");
          Serial.print(currentReading.nitrogen);
          Serial.print(" P:");
          Serial.print(currentReading.phosphorus);
          Serial.print(" K:");
          Serial.println(currentReading.potassium);
          
          if (currentMeasurement.count >= AVERAGE_COUNT) {
            calculateMeasurementAverage();
            formatAllValues();
            systemState = STATE_DISPLAY_RESULTS;
            stateStartTime = currentTime;
            lcd.clear();
            
            sendDataToFirebase();
            
            Serial.println("\n=== MEASUREMENT COMPLETE ===");
            Serial.print("MEASUREMENT #");
            Serial.println(measurementNumber);
            Serial.print("Configuration: Baud=");
            Serial.print(sensorConfig.baudRate);
            Serial.print(", Addr=");
            Serial.print(sensorConfig.address);
            Serial.print(", Reg=0x");
            Serial.println(sensorConfig.startRegister, HEX);
            Serial.println("Final Averaged Results:");
            Serial.print("Temperature:  ");
            Serial.print(currentMeasurement.averaged.temperature, 1);
            Serial.println(" °C");
            Serial.print("Moisture:     ");
            Serial.print(currentMeasurement.averaged.moisture, 1);
            Serial.println(" %");
            Serial.print("EC:            ");
            Serial.print(currentMeasurement.averaged.ec, 1);
            Serial.println(" mS/cm");
            Serial.print("pH:            ");
            Serial.println(currentMeasurement.averaged.ph, 1);
            Serial.print("Nitrogen (N): ");
            Serial.print(currentMeasurement.averaged.nitrogen);
            Serial.println(" mg/kg");
            Serial.print("Phosphorus (P): ");
            Serial.print(currentMeasurement.averaged.phosphorus);
            Serial.println(" mg/kg");
            Serial.print("Potassium (K):  ");
            Serial.print(currentMeasurement.averaged.potassium);
            Serial.println(" mg/kg");
            Serial.println("========================================");
            
            Serial2.println("MEGA:MEASUREMENT_COMPLETE");
          }
        }
      }
      break;
      
    case STATE_DISPLAY_RESULTS:
      showResultsScreen();
      digitalWrite(STATUS_LED, (currentTime % 400) < 200);
      
      if (currentTime - lastFirebaseSend >= FIREBASE_SEND_INTERVAL) {
        sendDataToFirebase();
        lastFirebaseSend = currentTime;
      }
      
      if (stateElapsed >= RESULTS_DISPLAY_TIME) {
        systemState = STATE_CLEAR_DATA;
        stateStartTime = currentTime;
        lcd.clear();
        Serial.println("\nResults displayed. Clearing data in 5 seconds...");
        Serial2.println("MEGA:CLEARING_DATA");
      }
      break;
      
    case STATE_CLEAR_DATA:
      showClearDataScreen();
      digitalWrite(STATUS_LED, (currentTime % 200) < 100);
      
      if (stateElapsed >= DATA_CLEAR_TIME) {
        resetMeasurement();
        successfulAnalysis = 0;
        measurementNumber++;
        systemState = STATE_ANALYZING_SOIL;
        stateStartTime = currentTime;
        lcd.clear();
        Serial.println("\n=== DATA CLEARED ===");
        Serial.print("Starting new analysis for Measurement #");
        Serial.println(measurementNumber);
        Serial2.println("MEGA:DATA_CLEARED");
      }
      break;
      
    case STATE_ERROR:
      showErrorScreen("Check Sensor");
      digitalWrite(STATUS_LED, (currentTime % 100) < 50);
      
      if (stateElapsed >= 10000) {
        systemState = STATE_ANALYZING_SOIL;
        stateStartTime = currentTime;
        successfulAnalysis = 0;
        lcd.clear();
        Serial.println("\nRetrying soil analysis...");
        Serial2.println("MEGA:RETRYING");
      }
      break;
  }
  
  if (currentTime - lastESP32Heartbeat >= 5000) {
    sendHeartbeat();
    lastESP32Heartbeat = currentTime;
  }
}

void checkESP32Connection() {
  static unsigned long lastCheck = 0;
  
  if (millis() - lastCheck >= 10000) { 
    lastCheck = millis();
    
    if (!esp32Connected) {
      Serial.println("ESP32 not connected. Attempting to connect...");
      Serial2.println("MEGA:PING");
    }
  }
}

void sendHeartbeat() {
  Serial2.print("MEGA:HEARTBEAT:");
  Serial2.println(millis());
}

void processESP32Commands() {
  if (Serial2.available() > 0) {
    String command = Serial2.readStringUntil('\n');
    command.trim();
    
    if (command.length() > 0) {
      Serial.print("ESP32: ");
      Serial.println(command);
      
      if (command.startsWith("ESP32:PONG")) {
        esp32Connected = true;
        Serial.println("ESP32 Connected!");
        lcd.setCursor(13, 3);
        lcd.print("ESP:ON ");
      }
      else if (command.startsWith("ESP32:READY")) {
        esp32Connected = true;
        Serial.println("ESP32 Ready!");
      }
      else if (command.startsWith("ESP32:REQ_DATA")) {
        sendDataToFirebase();
      }
      else if (command.startsWith("ESP32:STATUS")) {
        Serial2.print("MEGA:STATUS:");
        Serial2.print("MEASUREMENT:");
        Serial2.print(measurementNumber);
        Serial2.print(",COUNT:");
        Serial2.print(currentMeasurement.count);
        Serial2.print(",STATE:");
        Serial2.println(systemState);
      }
      else if (command.startsWith("ESP32:RESET")) {
        resetMeasurement();
        measurementNumber = 1;
        systemState = STATE_ANALYZING_SOIL;
        stateStartTime = millis();
        Serial2.println("MEGA:RESET:DONE");
      }
      else if (command.startsWith("ESP32:DATA_SENT")) {
        Serial.println("ESP32 confirmed data sent to Firebase");
      }
    }
  }
}

void sendToESP32() {
  Serial2.print("MEGA:RT_DATA:");
  Serial2.print("T:");
  Serial2.print(currentReading.temperature, 1);
  Serial2.print(",M:");
  Serial2.print(currentReading.moisture, 1);
  Serial2.print(",EC:");
  Serial2.print(currentReading.ec, 1);
  Serial2.print(",PH:");
  Serial2.print(currentReading.ph, 1);
  Serial2.print(",N:");
  Serial2.print(currentReading.nitrogen);
  Serial2.print(",P:");
  Serial2.print(currentReading.phosphorus);
  Serial2.print(",K:");
  Serial2.print(currentReading.potassium);
  Serial2.print(",TIME:");
  Serial2.print(millis());
  Serial2.println();
}

void sendDataToFirebase() {
  if (!currentMeasurement.complete) {
    Serial.println("Cannot send: Measurement not complete");
    return;
  }
  
  if (!esp32Connected) {
    Serial.println("Cannot send: ESP32 not connected");
    return;
  }
  
  Serial2.print("MEGA:FIREBASE:");
  Serial2.print(measurementNumber);
  Serial2.print(",");
  Serial2.print(currentMeasurement.averaged.temperature, 1);
  Serial2.print(",");
  Serial2.print(currentMeasurement.averaged.moisture, 1);
  Serial2.print(",");
  Serial2.print(currentMeasurement.averaged.ec, 1);
  Serial2.print(",");
  Serial2.print(currentMeasurement.averaged.ph, 1);
  Serial2.print(",");
  Serial2.print(currentMeasurement.averaged.nitrogen);
  Serial2.print(",");
  Serial2.print(currentMeasurement.averaged.phosphorus);
  Serial2.print(",");
  Serial2.print(currentMeasurement.averaged.potassium);
  Serial2.print(",");
  Serial2.print(millis());
  Serial2.print(",");
  Serial2.print(sensorConfig.baudRate);
  Serial2.print(",");
  Serial2.print(sensorConfig.address);
  Serial2.print(",");
  Serial2.print(sensorConfig.startRegister, HEX);
  Serial2.println();
  
  Serial.println("Data sent to ESP32 for Firebase upload");
}

bool scanForSensor() {
  static bool configFound = false;
  
  if (configFound) return true;
  
  long baud = baudRates[currentBaudIndex];
  uint8_t addr = addresses[currentAddressIndex];
  uint16_t reg = registers[currentRegisterIndex];
  
  showScanningScreen();
  
  if (testConfiguration(baud, addr, reg)) {
    configFound = true;
    
    sensorConfig.baudRate = baud;
    sensorConfig.address = addr;
    sensorConfig.startRegister = reg;
    sensorConfig.valid = true;
    
    Serial1.begin(baud);
    node.begin(addr, Serial1);
    node.preTransmission(preTransmission);
    node.postTransmission(postTransmission);
    
    Serial.println("\n=== SENSOR FOUND ===");
    Serial.print("Baud Rate: ");
    Serial.println(baud);
    Serial.print("Address: ");
    Serial.println(addr);
    Serial.print("Start Register: 0x");
    Serial.println(reg, HEX);
    
    autoCalibrateScaling();
    
    Serial2.print("MEGA:SENSOR_FOUND:");
    Serial2.print(baud);
    Serial2.print(",");
    Serial2.print(addr);
    Serial2.print(",0x");
    Serial2.println(reg, HEX);
    
    return true;
  }
  
  currentRegisterIndex++;
  if (currentRegisterIndex >= SCAN_REGISTERS) {
    currentRegisterIndex = 0;
    currentAddressIndex++;
    if (currentAddressIndex >= SCAN_ADDRESSES) {
      currentAddressIndex = 0;
      currentBaudIndex++;
      if (currentBaudIndex >= SCAN_BAUDS) {
        Serial.println("\n=== SCAN FAILED ===");
        Serial.println("No valid sensor configuration found.");
        Serial2.println("MEGA:SCAN_FAILED");
        
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("SCAN FAILED");
        lcd.setCursor(0, 1);
        lcd.print("Check wiring");
        lcd.setCursor(0, 2);
        lcd.print("and power");
        delay(5000);
        currentBaudIndex = 0;
      }
    }
  }
  
  return false;
}

bool testConfiguration(long baud, uint8_t addr, uint16_t reg) {
  Serial1.end();
  delay(50);
  Serial1.begin(baud);
  
  node.begin(addr, Serial1);
  node.preTransmission(preTransmission);
  node.postTransmission(postTransmission);
  
  delay(100);
  
  uint8_t result = node.readHoldingRegisters(reg, 10);
  
  if (result == node.ku8MBSuccess) {
    uint16_t rawData[10];
    for (int i = 0; i < 10; i++) {
      rawData[i] = node.getResponseBuffer(i);
    }
    
    if (analyzeSensorData(rawData, 10)) {
      analyzeRegisterMapping(rawData);
      return true;
    }
  }
  
  return false;
}

bool analyzeSensorData(uint16_t* data, int count) {
  int validCount = 0;
  
  for (int i = 0; i < count; i++) {
    if (data[i] > 0 && data[i] < 600) validCount++;
    if (data[i] > 0 && data[i] < 1000) validCount++;
    if (data[i] > 0 && data[i] < 140) validCount++;
    if (data[i] > 0 && data[i] < 2000) validCount++;
  }
  
  return (validCount >= 5);
}

void analyzeRegisterMapping(uint16_t* rawData) {
  for (int i = 0; i < 7; i++) {
    if (rawData[i] > 150 && rawData[i] < 300) {
      sensorConfig.tempRegister = i;
      break;
    }
  }
  
  for (int i = 0; i < 7; i++) {
    if (i != sensorConfig.tempRegister && rawData[i] > 50 && rawData[i] < 800) {
      sensorConfig.moistureRegister = i;
      break;
    }
  }
  
  for (int i = 0; i < 7; i++) {
    if (i != sensorConfig.tempRegister && i != sensorConfig.moistureRegister) {
      sensorConfig.ecRegister = i;
      break;
    }
  }
  
  for (int i = 0; i < 7; i++) {
    if (i != sensorConfig.tempRegister && i != sensorConfig.moistureRegister && 
        i != sensorConfig.ecRegister && rawData[i] < 140) {
      sensorConfig.phRegister = i;
      break;
    }
  }
  
  uint8_t npkIndex = 0;
  for (int i = 0; i < 7; i++) {
    if (i != sensorConfig.tempRegister && i != sensorConfig.moistureRegister && 
        i != sensorConfig.ecRegister && i != sensorConfig.phRegister) {
      if (npkIndex == 0) sensorConfig.nRegister = i;
      else if (npkIndex == 1) sensorConfig.pRegister = i;
      else if (npkIndex == 2) sensorConfig.kRegister = i;
      npkIndex++;
    }
  }
  
  Serial.println("=== REGISTER MAPPING ===");
  Serial.print("Temp: R");
  Serial.println(sensorConfig.tempRegister);
  Serial.print("Moisture: R");
  Serial.println(sensorConfig.moistureRegister);
  Serial.print("EC: R");
  Serial.println(sensorConfig.ecRegister);
  Serial.print("pH: R");
  Serial.println(sensorConfig.phRegister);
  Serial.print("N: R");
  Serial.println(sensorConfig.nRegister);
  Serial.print("P: R");
  Serial.println(sensorConfig.pRegister);
  Serial.print("K: R");
  Serial.println(sensorConfig.kRegister);
}

void autoCalibrateScaling() {
  uint8_t result = node.readHoldingRegisters(sensorConfig.startRegister, 10);
  
  if (result == node.ku8MBSuccess) {
    uint16_t rawData[10];
    for (int i = 0; i < 10; i++) {
      rawData[i] = node.getResponseBuffer(i);
    }
    
    uint16_t tempRaw = rawData[sensorConfig.tempRegister];
    if (tempRaw > 200 && tempRaw < 300) {
      sensorConfig.tempScale = 10.0;
    } else if (tempRaw > 2000 && tempRaw < 3000) {
      sensorConfig.tempScale = 100.0;
    } else {
      sensorConfig.tempScale = 1.0;
    }
    
    uint16_t moistureRaw = rawData[sensorConfig.moistureRegister];
    if (moistureRaw > 200 && moistureRaw < 800) {
      sensorConfig.moistureScale = 10.0;
    } else if (moistureRaw > 2000 && moistureRaw < 8000) {
      sensorConfig.moistureScale = 100.0;
    } else {
      sensorConfig.moistureScale = 1.0;
    }
    
    Serial.println("=== SCALING FACTORS ===");
    Serial.print("Temp Scale: 1/");
    Serial.println(sensorConfig.tempScale);
    Serial.print("Moisture Scale: 1/");
    Serial.println(sensorConfig.moistureScale);
  }
}

bool readSensor() {
  if (!sensorConfig.valid) return false;
  
  uint8_t result = node.readHoldingRegisters(sensorConfig.startRegister, 10);
  
  if (result == node.ku8MBSuccess) {
    uint16_t rawData[10];
    for (int i = 0; i < 10; i++) {
      rawData[i] = node.getResponseBuffer(i);
    }
    
    currentReading.temperature = rawData[sensorConfig.tempRegister] / sensorConfig.tempScale;
    currentReading.moisture = rawData[sensorConfig.moistureRegister] / sensorConfig.moistureScale;
    currentReading.ec = rawData[sensorConfig.ecRegister] / sensorConfig.ecScale;
    currentReading.nitrogen = rawData[sensorConfig.nRegister] / sensorConfig.npkScale;
    currentReading.phosphorus = rawData[sensorConfig.pRegister] / sensorConfig.npkScale;
    currentReading.potassium = rawData[sensorConfig.kRegister] / sensorConfig.npkScale;
    currentReading.ph = rawData[sensorConfig.phRegister] / sensorConfig.phScale;
    currentReading.measurementNumber = measurementNumber;
    
    currentReading.timestamp = millis();
    currentReading.valid = true;
    
    return validateSensorData(&currentReading);
  }
  
  currentReading.valid = false;
  return false;
}

bool validateSensorData(SensorData* data) {
  if (!data->valid) return false;

  // BYPASS MODE: Skip validation if enabled
  if (BYPASS_VALIDATION) {
    data->inSoil = true;
    return true;
  }

  bool tempOK = (data->temperature >= MIN_TEMP && data->temperature <= MAX_TEMP);
  bool moistureOK = (data->moisture >= MIN_MOISTURE && data->moisture <= MAX_MOISTURE);
  bool ecOK = (data->ec >= MIN_EC && data->ec <= MAX_EC);
  bool phOK = (data->ph >= MIN_PH && data->ph <= MAX_PH);
  bool nOK = (data->nitrogen >= MIN_NPK && data->nitrogen <= MAX_NPK);
  bool pOK = (data->phosphorus >= MIN_NPK && data->phosphorus <= MAX_NPK);
  bool kOK = (data->potassium >= MIN_NPK && data->potassium <= MAX_NPK);
  
  data->inSoil = (tempOK && moistureOK && ecOK && phOK && nOK && pOK && kOK);
  
  return data->inSoil;
}

bool checkSoilConditions() {
  return currentReading.inSoil;
}

void takeMeasurementReading() {
  if (currentMeasurement.count < AVERAGE_COUNT) {
    currentMeasurement.readings[currentMeasurement.count] = currentReading;
    currentMeasurement.count++;
  }
}

void calculateMeasurementAverage() {
  if (currentMeasurement.count == 0) return;
  
  float tempSum = 0, moistSum = 0, ecSum = 0, phSum = 0;
  uint32_t nSum = 0, pSum = 0, kSum = 0;
  
  for (int i = 0; i < currentMeasurement.count; i++) {
    tempSum += currentMeasurement.readings[i].temperature;
    moistSum += currentMeasurement.readings[i].moisture;
    ecSum += currentMeasurement.readings[i].ec;
    phSum += currentMeasurement.readings[i].ph;
    nSum += currentMeasurement.readings[i].nitrogen;
    pSum += currentMeasurement.readings[i].phosphorus;
    kSum += currentMeasurement.readings[i].potassium;
  }
  
  currentMeasurement.averaged.temperature = tempSum / currentMeasurement.count;
  currentMeasurement.averaged.moisture = moistSum / currentMeasurement.count;
  currentMeasurement.averaged.ec = ecSum / currentMeasurement.count;
  currentMeasurement.averaged.ph = phSum / currentMeasurement.count;
  currentMeasurement.averaged.nitrogen = nSum / currentMeasurement.count;
  currentMeasurement.averaged.phosphorus = pSum / currentMeasurement.count;
  currentMeasurement.averaged.potassium = kSum / currentMeasurement.count;
  currentMeasurement.averaged.measurementNumber = measurementNumber;
  currentMeasurement.averaged.timestamp = millis();
  currentMeasurement.averaged.valid = true;
  currentMeasurement.complete = true;
}

void resetMeasurement() {
  memset(&currentMeasurement, 0, sizeof(currentMeasurement));
  currentMeasurement.count = 0;
  currentMeasurement.complete = false;
}

void formatAllValues() {
  formatFloat(tempStr, currentMeasurement.averaged.temperature, 1, 5);
  formatFloat(moistStr, currentMeasurement.averaged.moisture, 1, 5);
  formatFloat(ecStr, currentMeasurement.averaged.ec, 1, 5);
  formatFloat(phStr, currentMeasurement.averaged.ph, 1, 5);
  formatInt(nStr, currentMeasurement.averaged.nitrogen, 4);
  formatInt(pStr, currentMeasurement.averaged.phosphorus, 4);
  formatInt(kStr, currentMeasurement.averaged.potassium, 4);
}

void showScanningScreen() {
  static unsigned long lastUpdate = 0;
  static int animStep = 0;
  
  if (millis() - lastUpdate > 300) {
    lastUpdate = millis();
    animStep = (animStep + 1) % 4;
    lcd.clear();
  }
  
  lcd.setCursor(0, 0);
  lcd.print("SCANNING SENSOR");
  
  lcd.setCursor(0, 1);
  lcd.print("Baud:");
  lcd.print(baudRates[currentBaudIndex]);
  
  lcd.setCursor(0, 2);
  lcd.print("Addr:");
  lcd.print(addresses[currentAddressIndex]);
  
  lcd.setCursor(0, 3);
  lcd.print("Reg:0x");
  lcd.print(registers[currentRegisterIndex], HEX);
  lcd.print(" ");
  
  for (int i = 0; i < 3; i++) {
    lcd.print(i < animStep ? "." : " ");
  }
}

void showAnalyzingScreen() {
  lcd.setCursor(0, 0);
  lcd.print("ANALYZING SOIL");
  lcd.setCursor(15, 0);
  lcd.print("#");
  lcd.print(measurementNumber);
  
  lcd.setCursor(0, 1);
  lcd.print("Valid:");
  lcd.print(successfulAnalysis);
  lcd.print("/5");
  
  if (currentReading.valid) {
    lcd.setCursor(0, 2);
    lcd.print("T:");
    lcd.print(currentReading.temperature, 1);
    lcd.print("C M:");
    lcd.print(currentReading.moisture, 1);
    lcd.print("%");
    
    lcd.setCursor(0, 3);
    lcd.print("pH:");
    lcd.print(currentReading.ph, 1);
    lcd.print(" EC:");
    lcd.print(currentReading.ec, 1);
  } else {
    lcd.setCursor(0, 2);
    lcd.print("Reading sensor...");
  }
}

void showTakingMeasurementsScreen() {
  lcd.setCursor(0, 0);
  lcd.print("MEASURING");
  lcd.setCursor(10, 0);
  lcd.print("#");
  lcd.print(measurementNumber);
  
  lcd.setCursor(0, 1);
  lcd.print("Reading ");
  lcd.print(currentMeasurement.count);
  lcd.print("/");
  lcd.print(AVERAGE_COUNT);
  
  if (currentReading.valid) {
    lcd.setCursor(0, 2);
    lcd.print("T:");
    lcd.print(currentReading.temperature, 1);
    lcd.print("C M:");
    lcd.print(currentReading.moisture, 1);
    lcd.print("%");
    
    lcd.setCursor(0, 3);
    lcd.print("pH:");
    lcd.print(currentReading.ph, 1);
    lcd.print(" N:");
    lcd.print(currentReading.nitrogen);
  }
}

void showResultsScreen() {
  unsigned long elapsed = (millis() - stateStartTime) / 1000;
  unsigned long remaining = (RESULTS_DISPLAY_TIME / 1000) - elapsed;
  
  lcd.setCursor(0, 0);
  lcd.print("#");
  lcd.print(measurementNumber);
  lcd.print(" T:");
  lcd.print(tempStr);
  lcd.print("C");
  
  lcd.setCursor(0, 1);
  lcd.print("M:");
  lcd.print(moistStr);
  lcd.print("% EC:");
  lcd.print(ecStr);
  
  lcd.setCursor(0, 2);
  lcd.print("pH:");
  lcd.print(phStr);
  lcd.print(" N:");
  lcd.print(nStr);
  
  lcd.setCursor(0, 3);
  lcd.print("P:");
  lcd.print(pStr);
  lcd.print(" K:");
  lcd.print(kStr);
}

void showClearDataScreen() {
  unsigned long elapsed = (millis() - stateStartTime) / 1000;
  unsigned long remaining = (DATA_CLEAR_TIME / 1000) - elapsed;
  
  lcd.setCursor(0, 0);
  lcd.print("CLEARING DATA");
  
  lcd.setCursor(0, 1);
  lcd.print("Next: #");
  lcd.print(measurementNumber + 1);
  
  static int animStep = 0;
  static unsigned long lastAnim = 0;
  
  if (millis() - lastAnim > 200) {
    lastAnim = millis();
    animStep = (animStep + 1) % 8;
    
    lcd.setCursor(0, 2);
    lcd.print("Clearing ");
    for (int i = 0; i < 8; i++) {
      lcd.print(i < animStep ? "." : " ");
    }
  }
  
  lcd.setCursor(0, 3);
  lcd.print("Time: ");
  lcd.print(remaining);
  lcd.print("s");
}

void showErrorScreen(const char* error) {
  static unsigned long lastBlink = 0;
  static bool showMessage = true;
  
  if (millis() - lastBlink > 1000) {
    lastBlink = millis();
    showMessage = !showMessage;
    lcd.clear();
  }
  
  if (showMessage) {
    centerText(0, "ERROR");
    centerText(1, error);
    centerText(2, "Check sensor");
    centerText(3, "Retrying...");
  } else {
    centerText(1, "Insert sensor");
    centerText(2, "in soil properly");
  }
}

void clearLine(int line) {
  lcd.setCursor(0, line);
  for (int i = 0; i < 20; i++) lcd.print(" ");
}

void centerText(int line, const char* text) {
  int len = strlen(text);
  int pos = max(0, (20 - len) / 2);
  lcd.setCursor(pos, line);
  lcd.print(text);
}

void formatFloat(char* buf, float value, int decimals, int width) {
  char temp[10];
  dtostrf(value, width, decimals, temp);
  
  int i = 0;
  while (temp[i] == ' ') i++;
  
  int j = 0;
  while (temp[i] != '\0') {
    buf[j++] = temp[i++];
  }
  buf[j] = '\0';
}

void formatInt(char* buf, uint16_t value, int width) {
  char temp[10];
  sprintf(temp, "%d", value);
  
  int len = strlen(temp);
  if (len < width) {
    int spaces = width - len;
    for (int i = 0; i < spaces; i++) {
      buf[i] = ' ';
    }
    strcpy(buf + spaces, temp);
  } else {
    strcpy(buf, temp);
  }
  buf[width] = '\0';
}