// CSV-based risk action plans for warehouse cinnamon storage
// Maps detected sensor deviations to recommended actions from historical risk patterns

const CSV_ACTION_PLANS = [
  { temp: 20, humidity: 65.9, moisture: 50.1, airQuality: 574.9, co2: 624.5, light: 34.1, motion: 0, voc: 289.5, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 32.4, humidity: 72.2, moisture: 49.4, airQuality: 771.7, co2: 727.5, light: 421.8, motion: 0, voc: 317.1, riskStatus: 1, reason: "High Temperature, Poor Air Quality, Unexpected Light Level", reason_of_risk: "Risk of product degradation and Color may change, risk of Possible dust or smoke, Risk-Color may change", actionPlan: "Increase ventilation/cooling., Ventilate and check air filters., Cover cinnamon stock with opaque sheets" },
  { temp: 24.5, humidity: 74.8, moisture: 49.6, airQuality: 401.9, co2: 466.2, light: 132.1, motion: 0, voc: 80.3, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 23.5, humidity: 65.8, moisture: 48.1, airQuality: 340.2, co2: 578.7, light: 58.7, motion: 0, voc: 371.2, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 19.7, humidity: 69.1, moisture: 46.8, airQuality: 469.5, co2: 492.6, light: 40, motion: 0, voc: 168.2, riskStatus: 2, reason: "Low Temperature", reason_of_risk: "Risk of condensation during temperature fluctuation", actionPlan: "Stabilize temperature gradually and improve storage insulation." },
  { temp: 24.4, humidity: 82.5, moisture: 52.5, airQuality: 593.7, co2: 617, light: 53.6, motion: 0, voc: 285.1, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 23.7, humidity: 72.7, moisture: 46.5, airQuality: 500.5, co2: 661.3, light: 125.5, motion: 0, voc: 33.7, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 23.7, humidity: 72.9, moisture: 50.3, airQuality: 439.3, co2: 724.6, light: 55.8, motion: 0, voc: 497.4, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 10.4, humidity: 77.1, moisture: 49.5, airQuality: 310, co2: 582.9, light: 17.4, motion: 0, voc: 71.7, riskStatus: 2, reason: "Low Temperature, Very Low Light Level", reason_of_risk: "Risk of condensation during temperature fluctuation, Risk of hidden defects and inspection difficulty", actionPlan: "Stabilize temperature gradually and improve storage insulation., Enable controlled low-intensity inspection lighting periodically." },
  { temp: 20.6, humidity: 61.3, moisture: 48.4, airQuality: 542.9, co2: 630.2, light: 33.5, motion: 0, voc: 497.3, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 21.3, humidity: 64, moisture: 47.8, airQuality: 567.8, co2: 572.9, light: 76.6, motion: 0, voc: 187, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 21.4, humidity: 93, moisture: 53.4, airQuality: 794.3, co2: 1358, light: 173.7, motion: 1, voc: 340, riskStatus: 1, reason: "High Humidity, Poor Air Quality, High CO₂ Level, Motion Detected, Unexpected Light Level", reason_of_risk: "Risk of mold, risk of Possible dust or smoke, risk of Poor ventilation, risk of pests, Risk-Color may change", actionPlan: "Activate dehumidifier., Ventilate and check air filters., Improve airflow/ventilation., Check premises immediately., Cover cinnamon stock with opaque sheets" },
  { temp: 20.7, humidity: 46.1, moisture: 54.6, airQuality: 111.6, co2: 509.6, light: 113.3, motion: 0, voc: 21.3, riskStatus: 2, reason: "Low Humidity, Very Low Air Quality Reading", reason_of_risk: "Risk of over-drying and aroma loss, Risk of sensor malfunction or false safety indication", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Inspect, clean, and recalibrate air quality sensors." },
  { temp: 22.2, humidity: 77, moisture: 76.2, airQuality: 485.7, co2: 546.7, light: 60.4, motion: 0, voc: 243.5, riskStatus: 1, reason: "High Moisture Level", reason_of_risk: "Risk of spoilage", actionPlan: "Investigate leaks and dry area." },
  { temp: 22.6, humidity: 67.2, moisture: 53.2, airQuality: 491.2, co2: 604, light: 106.8, motion: 0, voc: 297.8, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 11.2, humidity: 83.2, moisture: 30.7, airQuality: 506.9, co2: 478, light: 33.8, motion: 0, voc: 417.2, riskStatus: 2, reason: "Low Moisture Level, Low Temperature", reason_of_risk: "Risk of excessive dryness and weight loss, Risk of condensation during temperature fluctuation", actionPlan: "Balance humidity levels and avoid direct airflow on cinnamon stock., Stabilize temperature gradually and improve storage insulation." },
  { temp: 22.5, humidity: 80.7, moisture: 46, airQuality: 331.2, co2: 356.3, light: 9.7, motion: 0, voc: 79, riskStatus: 2, reason: "Low CO₂ Level, Very Low Light Level", reason_of_risk: "Risk of excessive ventilation and energy wastage, Risk of hidden defects and inspection difficulty", actionPlan: "Reduce ventilation intensity and maintain balanced airflow., Enable controlled low-intensity inspection lighting periodically." },
  { temp: 24.8, humidity: 75.9, moisture: 51.2, airQuality: 625.3, co2: 497.3, light: 124.3, motion: 1, voc: 203.4, riskStatus: 1, reason: "Poor Air Quality, Motion Detected", reason_of_risk: "risk of Possible dust or smoke, risk of pests", actionPlan: "Ventilate and check air filters., Check premises immediately." },
  { temp: 22.9, humidity: 80.6, moisture: 45.3, airQuality: 561.2, co2: 762.2, light: 20.8, motion: 0, voc: 137, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 20.6, humidity: 71.2, moisture: 54.2, airQuality: 533.5, co2: 555.6, light: 111, motion: 0, voc: 291.6, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 20.3, humidity: 64.1, moisture: 78.8, airQuality: 312.6, co2: 808.2, light: 382.6, motion: 0, voc: 214.2, riskStatus: 1, reason: "High Moisture Level, High CO₂ Level, Unexpected Light Level", reason_of_risk: "Risk of spoilage, risk of Poor ventilation, Risk-Color may change", actionPlan: "Investigate leaks and dry area., Improve airflow/ventilation., Cover cinnamon stock with opaque sheets" },
  { temp: 23.2, humidity: 80.5, moisture: 50.6, airQuality: 445.2, co2: 557.8, light: 131, motion: 0, voc: 440.2, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 22.3, humidity: 75.9, moisture: 53.3, airQuality: 492.2, co2: 646.2, light: 34.9, motion: 1, voc: 404.4, riskStatus: 1, reason: "Motion Detected", reason_of_risk: "risk of pests", actionPlan: "Check premises immediately." },
  { temp: 35.4, humidity: 80.9, moisture: 54.6, airQuality: 863.5, co2: 716.1, light: 211.8, motion: 0, voc: 188, riskStatus: 1, reason: "High Temperature, Poor Air Quality, Unexpected Light Level", reason_of_risk: "Risk of product degradation and Color may change, risk of Possible dust or smoke, Risk-Color may change", actionPlan: "Increase ventilation/cooling., Ventilate and check air filters., Cover cinnamon stock with opaque sheets" },
  { temp: 20.1, humidity: 72.7, moisture: 50.6, airQuality: 545.7, co2: 605.6, light: 21.4, motion: 0, voc: 24.7, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 22.1, humidity: 85.4, moisture: 47, airQuality: 383.4, co2: 1270.7, light: 31.9, motion: 1, voc: 48, riskStatus: 1, reason: "High Humidity, High CO₂ Level, Motion Detected", reason_of_risk: "Risk of mold, risk of Poor ventilation, risk of pests", actionPlan: "Activate dehumidifier., Improve airflow/ventilation., Check premises immediately." },
  { temp: 20.5, humidity: 84.7, moisture: 50.6, airQuality: 848.9, co2: 1095.3, light: 93.4, motion: 0, voc: 233.5, riskStatus: 1, reason: "Poor Air Quality, High CO₂ Level", reason_of_risk: "risk of Possible dust or smoke, risk of Poor ventilation", actionPlan: "Ventilate and check air filters., Improve airflow/ventilation." },
  { temp: 15.2, humidity: 80.3, moisture: 52.3, airQuality: 547.4, co2: 403.1, light: 86.5, motion: 0, voc: 149, riskStatus: 2, reason: "Low Temperature", reason_of_risk: "Risk of condensation during temperature fluctuation", actionPlan: "Stabilize temperature gradually and improve storage insulation." },
  { temp: 24.3, humidity: 81.1, moisture: 46.7, airQuality: 432, co2: 625.9, light: 114.9, motion: 0, voc: 201.7, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 23.3, humidity: 92.4, moisture: 58.7, airQuality: 642.1, co2: 1391.9, light: 146.7, motion: 1, voc: 5.8, riskStatus: 1, reason: "High Humidity, High Moisture Level, Poor Air Quality, High CO₂ Level, Motion Detected", reason_of_risk: "Risk of mold, Risk of spoilage, risk of Possible dust or smoke, risk of Poor ventilation, risk of pests", actionPlan: "Activate dehumidifier., Investigate leaks and dry area., Ventilate and check air filters., Improve airflow/ventilation., Check premises immediately." },
  { temp: 20.1, humidity: 83.7, moisture: 54.7, airQuality: 403.5, co2: 657.1, light: 31.3, motion: 0, voc: 19.6, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 22.6, humidity: 72.5, moisture: 50.9, airQuality: 327.5, co2: 781.4, light: 48.1, motion: 0, voc: 98.4, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 23.2, humidity: 61, moisture: 50.3, airQuality: 564.2, co2: 595.1, light: 71.5, motion: 0, voc: 422.8, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 20.5, humidity: 58.7, moisture: 41.1, airQuality: 298.7, co2: 725.4, light: 21.2, motion: 0, voc: 309.7, riskStatus: 2, reason: "Low Humidity, Low Moisture Level, Very Low Air Quality Reading", reason_of_risk: "Risk of over-drying and aroma loss, Risk of excessive dryness and weight loss, Risk of sensor malfunction or false safety indication", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Balance humidity levels and avoid direct airflow on cinnamon stock., Inspect, clean, and recalibrate air quality sensors." },
  { temp: 24.7, humidity: 74.2, moisture: 50.8, airQuality: 174.3, co2: 398.4, light: 130.9, motion: 0, voc: 52.8, riskStatus: 2, reason: "Very Low Air Quality Reading, Low CO₂ Level", reason_of_risk: "Risk of sensor malfunction or false safety indication, Risk of excessive ventilation and energy wastage", actionPlan: "Inspect, clean, and recalibrate air quality sensors., Reduce ventilation intensity and maintain balanced airflow." },
  { temp: 31.4, humidity: 63.7, moisture: 52.9, airQuality: 701.7, co2: 477.1, light: 29.9, motion: 0, voc: 21.5, riskStatus: 1, reason: "High Temperature, Poor Air Quality", reason_of_risk: "Risk of product degradation and Color may change, risk of Possible dust or smoke", actionPlan: "Increase ventilation/cooling., Ventilate and check air filters." },
  { temp: 22.3, humidity: 63.7, moisture: 45.5, airQuality: 564.9, co2: 454, light: 143, motion: 0, voc: 211.8, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 24.9, humidity: 81, moisture: 30.1, airQuality: 586.1, co2: 547.6, light: 113.7, motion: 0, voc: 6, riskStatus: 2, reason: "Low Moisture Level", reason_of_risk: "Risk of excessive dryness and weight loss", actionPlan: "Balance humidity levels and avoid direct airflow on cinnamon stock." },
  { temp: 21.9, humidity: 95.6, moisture: 49.3, airQuality: 456.4, co2: 1128.1, light: 65.6, motion: 1, voc: 345.3, riskStatus: 1, reason: "High Humidity, High CO₂ Level, Motion Detected", reason_of_risk: "Risk of mold, risk of Poor ventilation, risk of pests", actionPlan: "Activate dehumidifier., Improve airflow/ventilation., Check premises immediately." },
  { temp: 21.8, humidity: 74.5, moisture: 50.5, airQuality: 460.5, co2: 804.2, light: 406.4, motion: 0, voc: 212.6, riskStatus: 1, reason: "High CO₂ Level, Unexpected Light Level", reason_of_risk: "risk of Poor ventilation, Risk-Color may change", actionPlan: "Improve airflow/ventilation., Cover cinnamon stock with opaque sheets" },
  { temp: 20.3, humidity: 82.3, moisture: 49.4, airQuality: 468.5, co2: 656.5, light: 16.7, motion: 0, voc: 493.2, riskStatus: 2, reason: "Very Low Light Level", reason_of_risk: "Risk of hidden defects and inspection difficulty", actionPlan: "Enable controlled low-intensity inspection lighting periodically." },
  { temp: 28.4, humidity: 88, moisture: 67.2, airQuality: 513.8, co2: 1153.1, light: 37.3, motion: 0, voc: 215.3, riskStatus: 1, reason: "High Humidity, High Moisture Level, High Temperature, High CO₂ Level", reason_of_risk: "Risk of mold, Risk of spoilage, Risk of product degradation and Color may change, risk of Poor ventilation", actionPlan: "Activate dehumidifier., Investigate leaks and dry area., Increase ventilation/cooling., Improve airflow/ventilation." },
  { temp: 28.8, humidity: 78.3, moisture: 50.7, airQuality: 417.6, co2: 801.1, light: 59.8, motion: 1, voc: 432.6, riskStatus: 1, reason: "High Temperature, High CO₂ Level, Motion Detected", reason_of_risk: "Risk of product degradation and Color may change, risk of Poor ventilation, risk of pests", actionPlan: "Increase ventilation/cooling., Improve airflow/ventilation., Check premises immediately." },
  { temp: 23.8, humidity: 96.5, moisture: 54.2, airQuality: 325.5, co2: 654.2, light: 96.5, motion: 0, voc: 232, riskStatus: 1, reason: "High Humidity", reason_of_risk: "Risk of mold", actionPlan: "Activate dehumidifier." },
  { temp: 13.6, humidity: 79, moisture: 52.9, airQuality: 472.7, co2: 364.4, light: 7.6, motion: 0, voc: 248, riskStatus: 2, reason: "Low Temperature, Low CO₂ Level, Very Low Light Level", reason_of_risk: "Risk of condensation during temperature fluctuation, Risk of excessive ventilation and energy wastage, Risk of hidden defects and inspection difficulty", actionPlan: "Stabilize temperature gradually and improve storage insulation., Reduce ventilation intensity and maintain balanced airflow., Enable controlled low-intensity inspection lighting periodically." },
  { temp: 22, humidity: 66, moisture: 53.1, airQuality: 185.5, co2: 635.1, light: 144, motion: 0, voc: 72, riskStatus: 2, reason: "Very Low Air Quality Reading", reason_of_risk: "Risk of sensor malfunction or false safety indication", actionPlan: "Inspect, clean, and recalibrate air quality sensors." },
  { temp: 20.3, humidity: 65.6, moisture: 52.6, airQuality: 326.3, co2: 382.2, light: 17.1, motion: 0, voc: 417.3, riskStatus: 2, reason: "Low CO₂ Level, Very Low Light Level", reason_of_risk: "Risk of excessive ventilation and energy wastage, Risk of hidden defects and inspection difficulty", actionPlan: "Reduce ventilation intensity and maintain balanced airflow., Enable controlled low-intensity inspection lighting periodically." },
  { temp: 32.1, humidity: 87.2, moisture: 56.8, airQuality: 812.8, co2: 737.5, light: 100, motion: 1, voc: 258, riskStatus: 1, reason: "High Humidity, High Moisture Level, High Temperature, Poor Air Quality, Motion Detected", reason_of_risk: "Risk of mold, Risk of spoilage, Risk of product degradation and Color may change, risk of Possible dust or smoke, risk of pests", actionPlan: "Activate dehumidifier., Investigate leaks and dry area., Increase ventilation/cooling., Ventilate and check air filters., Check premises immediately." },
  { temp: 37.3, humidity: 69.8, moisture: 48.5, airQuality: 680.2, co2: 467.9, light: 59.7, motion: 0, voc: 72.5, riskStatus: 1, reason: "High Temperature, Poor Air Quality", reason_of_risk: "Risk of product degradation and Color may change, risk of Possible dust or smoke", actionPlan: "Increase ventilation/cooling., Ventilate and check air filters." },
  { temp: 24, humidity: 68.6, moisture: 53.2, airQuality: 427.2, co2: 735.6, light: 40.4, motion: 0, voc: 134.9, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 22.7, humidity: 58.1, moisture: 40.9, airQuality: 288.5, co2: 454.7, light: 52, motion: 0, voc: 191.8, riskStatus: 2, reason: "Low Humidity, Low Moisture Level, Very Low Air Quality Reading", reason_of_risk: "Risk of over-drying and aroma loss, Risk of excessive dryness and weight loss, Risk of sensor malfunction or false safety indication", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Balance humidity levels and avoid direct airflow on cinnamon stock., Inspect, clean, and recalibrate air quality sensors." },
  { temp: 21.3, humidity: 65.5, moisture: 48.4, airQuality: 311.2, co2: 761.8, light: 146.1, motion: 0, voc: 101, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 20.5, humidity: 82.4, moisture: 45.3, airQuality: 502.6, co2: 436.2, light: 49.3, motion: 0, voc: 64.7, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 22.1, humidity: 80.9, moisture: 49, airQuality: 569.5, co2: 492.6, light: 52.2, motion: 0, voc: 370.5, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 32.9, humidity: 81, moisture: 50.3, airQuality: 475.1, co2: 1226.6, light: 126.5, motion: 0, voc: 439.4, riskStatus: 1, reason: "High Temperature, High CO₂ Level", reason_of_risk: "Risk of product degradation and Color may change, risk of Poor ventilation", actionPlan: "Increase ventilation/cooling., Improve airflow/ventilation." },
  { temp: 21.1, humidity: 72.4, moisture: 79.5, airQuality: 313.1, co2: 688.6, light: 355, motion: 0, voc: 438.4, riskStatus: 1, reason: "High Moisture Level, Unexpected Light Level", reason_of_risk: "Risk of spoilage, Risk-Color may change", actionPlan: "Investigate leaks and dry area., Cover cinnamon stock with opaque sheets" },
  { temp: 20.9, humidity: 84.1, moisture: 47.8, airQuality: 373.8, co2: 592.6, light: 46.4, motion: 0, voc: 89.4, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 22, humidity: 32.9, moisture: 44.1, airQuality: 332.6, co2: 464.9, light: 54.2, motion: 0, voc: 23.1, riskStatus: 2, reason: "Low Humidity, Low Moisture Level", reason_of_risk: "Risk of over-drying and aroma loss, Risk of excessive dryness and weight loss", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Balance humidity levels and avoid direct airflow on cinnamon stock." },
  { temp: 21.7, humidity: 64.7, moisture: 65.2, airQuality: 356.4, co2: 734.3, light: 86.3, motion: 0, voc: 47.7, riskStatus: 1, reason: "High Moisture Level", reason_of_risk: "Risk of spoilage", actionPlan: "Investigate leaks and dry area." },
  { temp: 24.6, humidity: 73.1, moisture: 47.2, airQuality: 400.8, co2: 1193.2, light: 125.8, motion: 0, voc: 92.6, riskStatus: 1, reason: "High CO₂ Level", reason_of_risk: "risk of Poor ventilation", actionPlan: "Improve airflow/ventilation." },
  { temp: 24.2, humidity: 75.8, moisture: 53.3, airQuality: 371.4, co2: 454.6, light: 135.2, motion: 0, voc: 374.9, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 20.4, humidity: 65.8, moisture: 51.8, airQuality: 518.4, co2: 610.2, light: 29.3, motion: 0, voc: 314.9, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 21.1, humidity: 60.3, moisture: 52.1, airQuality: 445.7, co2: 312.8, light: 26.5, motion: 0, voc: 435.6, riskStatus: 2, reason: "Low CO₂ Level", reason_of_risk: "Risk of excessive ventilation and energy wastage", actionPlan: "Reduce ventilation intensity and maintain balanced airflow." },
  { temp: 24.4, humidity: 74.6, moisture: 45.4, airQuality: 263.2, co2: 565.5, light: 44.9, motion: 0, voc: 319.6, riskStatus: 2, reason: "Very Low Air Quality Reading", reason_of_risk: "Risk of sensor malfunction or false safety indication", actionPlan: "Inspect, clean, and recalibrate air quality sensors." },
  { temp: 20.5, humidity: 46.4, moisture: 41.4, airQuality: 160.3, co2: 761.2, light: 96.5, motion: 0, voc: 287.8, riskStatus: 2, reason: "Low Humidity, Low Moisture Level, Very Low Air Quality Reading", reason_of_risk: "Risk of over-drying and aroma loss, Risk of excessive dryness and weight loss, Risk of sensor malfunction or false safety indication", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Balance humidity levels and avoid direct airflow on cinnamon stock., Inspect, clean, and recalibrate air quality sensors." },
  { temp: 24.3, humidity: 84.7, moisture: 47, airQuality: 304, co2: 521.8, light: 94.3, motion: 1, voc: 223.5, riskStatus: 1, reason: "Motion Detected", reason_of_risk: "risk of pests", actionPlan: "Check premises immediately." },
  { temp: 28.9, humidity: 66.8, moisture: 75.2, airQuality: 723.7, co2: 1409.7, light: 266.4, motion: 1, voc: 76, riskStatus: 1, reason: "High Moisture Level, High Temperature, Poor Air Quality, High CO₂ Level, Motion Detected, Unexpected Light Level", reason_of_risk: "Risk of spoilage, Risk of product degradation and Color may change, risk of Possible dust or smoke, risk of Poor ventilation, risk of pests, Risk-Color may change", actionPlan: "Investigate leaks and dry area., Increase ventilation/cooling., Ventilate and check air filters., Improve airflow/ventilation., Check premises immediately., Cover cinnamon stock with opaque sheets" },
  { temp: 21.3, humidity: 78.2, moisture: 50.9, airQuality: 387.8, co2: 582.6, light: 48.3, motion: 0, voc: 110.4, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 39.9, humidity: 61.6, moisture: 56.7, airQuality: 428.7, co2: 438.8, light: 94.4, motion: 0, voc: 304.6, riskStatus: 1, reason: "High Moisture Level, High Temperature", reason_of_risk: "Risk of spoilage, Risk of product degradation and Color may change", actionPlan: "Investigate leaks and dry area., Increase ventilation/cooling." },
  { temp: 23.9, humidity: 72.1, moisture: 51.9, airQuality: 523, co2: 761.1, light: 45.5, motion: 0, voc: 440.8, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 24.2, humidity: 69.2, moisture: 51.9, airQuality: 496.3, co2: 496.6, light: 36, motion: 0, voc: 268.3, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 20.1, humidity: 84.9, moisture: 54.4, airQuality: 308.8, co2: 690.5, light: 50, motion: 0, voc: 498.1, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 16.4, humidity: 63.2, moisture: 54, airQuality: 527, co2: 414.7, light: 29.5, motion: 0, voc: 481.4, riskStatus: 2, reason: "Low Temperature", reason_of_risk: "Risk of condensation during temperature fluctuation", actionPlan: "Stabilize temperature gradually and improve storage insulation." },
  { temp: 23.3, humidity: 72, moisture: 77.8, airQuality: 873.2, co2: 588.9, light: 45.5, motion: 0, voc: 267.9, riskStatus: 1, reason: "High Moisture Level, Poor Air Quality", reason_of_risk: "Risk of spoilage, risk of Possible dust or smoke", actionPlan: "Investigate leaks and dry area., Ventilate and check air filters." },
  { temp: 22.9, humidity: 76.2, moisture: 47.6, airQuality: 454.4, co2: 674.8, light: 121.1, motion: 0, voc: 4.2, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 21.8, humidity: 75.2, moisture: 48.6, airQuality: 533.4, co2: 463.4, light: 1.3, motion: 0, voc: 436.4, riskStatus: 2, reason: "Very Low Light Level", reason_of_risk: "Risk of hidden defects and inspection difficulty", actionPlan: "Enable controlled low-intensity inspection lighting periodically." },
  { temp: 17, humidity: 50.7, moisture: 47.2, airQuality: 447.3, co2: 614.6, light: 90.3, motion: 0, voc: 138, riskStatus: 2, reason: "Low Humidity, Low Temperature", reason_of_risk: "Risk of over-drying and aroma loss, Risk of condensation during temperature fluctuation", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Stabilize temperature gradually and improve storage insulation." },
  { temp: 18.7, humidity: 74.1, moisture: 53.3, airQuality: 165.7, co2: 506.3, light: 90, motion: 0, voc: 117.9, riskStatus: 2, reason: "Low Temperature, Very Low Air Quality Reading", reason_of_risk: "Risk of condensation during temperature fluctuation, Risk of sensor malfunction or false safety indication", actionPlan: "Stabilize temperature gradually and improve storage insulation., Inspect, clean, and recalibrate air quality sensors." },
  { temp: 39.5, humidity: 80.7, moisture: 48.2, airQuality: 803.9, co2: 736.6, light: 424.8, motion: 0, voc: 375.3, riskStatus: 1, reason: "High Temperature, Poor Air Quality, Unexpected Light Level", reason_of_risk: "Risk of product degradation and Color may change, risk of Possible dust or smoke, Risk-Color may change", actionPlan: "Increase ventilation/cooling., Ventilate and check air filters., Cover cinnamon stock with opaque sheets" },
  { temp: 23, humidity: 92.6, moisture: 48.4, airQuality: 447.4, co2: 847.4, light: 83.8, motion: 1, voc: 451.3, riskStatus: 1, reason: "High Humidity, High CO₂ Level, Motion Detected", reason_of_risk: "Risk of mold, risk of Poor ventilation, risk of pests", actionPlan: "Activate dehumidifier., Improve airflow/ventilation., Check premises immediately." },
  { temp: 20.8, humidity: 40.3, moisture: 43.3, airQuality: 423.2, co2: 730.1, light: 74.9, motion: 0, voc: 285.4, riskStatus: 2, reason: "Low Humidity, Low Moisture Level", reason_of_risk: "Risk of over-drying and aroma loss, Risk of excessive dryness and weight loss", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Balance humidity levels and avoid direct airflow on cinnamon stock." },
  { temp: 24.6, humidity: 77.3, moisture: 40.9, airQuality: 593, co2: 599.7, light: 106.6, motion: 0, voc: 349.5, riskStatus: 2, reason: "Low Moisture Level", reason_of_risk: "Risk of excessive dryness and weight loss", actionPlan: "Balance humidity levels and avoid direct airflow on cinnamon stock." },
  { temp: 24.4, humidity: 73, moisture: 64, airQuality: 552.4, co2: 554.8, light: 183.8, motion: 0, voc: 247.7, riskStatus: 1, reason: "High Moisture Level, Unexpected Light Level", reason_of_risk: "Risk of spoilage, Risk-Color may change", actionPlan: "Investigate leaks and dry area., Cover cinnamon stock with opaque sheets" },
  { temp: 24.6, humidity: 80.6, moisture: 54.5, airQuality: 314.6, co2: 433.6, light: 47.7, motion: 0, voc: 269.8, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 27.4, humidity: 94.7, moisture: 53.7, airQuality: 353.1, co2: 1328, light: 82, motion: 0, voc: 335, riskStatus: 1, reason: "High Humidity, High Temperature, High CO₂ Level", reason_of_risk: "Risk of mold, Risk of product degradation and Color may change, risk of Poor ventilation", actionPlan: "Activate dehumidifier., Increase ventilation/cooling., Improve airflow/ventilation." },
  { temp: 24.2, humidity: 75.2, moisture: 46, airQuality: 257.4, co2: 661.6, light: 56.1, motion: 0, voc: 417.7, riskStatus: 2, reason: "Very Low Air Quality Reading", reason_of_risk: "Risk of sensor malfunction or false safety indication", actionPlan: "Inspect, clean, and recalibrate air quality sensors." },
  { temp: 23.3, humidity: 67.5, moisture: 54.7, airQuality: 370.1, co2: 401.9, light: 27.4, motion: 0, voc: 165.1, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 21.6, humidity: 77, moisture: 53.1, airQuality: 575.1, co2: 405.9, light: 132.8, motion: 0, voc: 60.6, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 21.4, humidity: 80.2, moisture: 54.8, airQuality: 342.3, co2: 426.3, light: 120.8, motion: 1, voc: 285.9, riskStatus: 1, reason: "Motion Detected", reason_of_risk: "risk of pests", actionPlan: "Check premises immediately." },
  { temp: 23.1, humidity: 80.7, moisture: 47.9, airQuality: 419.7, co2: 443.8, light: 143, motion: 0, voc: 122.9, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 21.8, humidity: 83.8, moisture: 46.2, airQuality: 184.6, co2: 441, light: 24.7, motion: 0, voc: 263.6, riskStatus: 2, reason: "Very Low Air Quality Reading", reason_of_risk: "Risk of sensor malfunction or false safety indication", actionPlan: "Inspect, clean, and recalibrate air quality sensors." },
  { temp: 36.7, humidity: 62, moisture: 46.7, airQuality: 529.5, co2: 472.4, light: 55.6, motion: 0, voc: 350.1, riskStatus: 1, reason: "High Temperature", reason_of_risk: "Risk of product degradation and Color may change", actionPlan: "Increase ventilation/cooling." },
  { temp: 24.3, humidity: 71.9, moisture: 45.4, airQuality: 323.6, co2: 632.9, light: 103.5, motion: 0, voc: 316, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 22.1, humidity: 74.6, moisture: 49.1, airQuality: 305.2, co2: 409, light: 72.2, motion: 0, voc: 390.9, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 20.5, humidity: 78.7, moisture: 47.5, airQuality: 332.7, co2: 743.8, light: 100.4, motion: 0, voc: 457.5, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 18.9, humidity: 64.6, moisture: 46.1, airQuality: 112.6, co2: 343.2, light: 97.6, motion: 0, voc: 79.7, riskStatus: 2, reason: "Low Temperature, Very Low Air Quality Reading, Low CO₂ Level", reason_of_risk: "Risk of condensation during temperature fluctuation, Risk of sensor malfunction or false safety indication, Risk of excessive ventilation and energy wastage", actionPlan: "Stabilize temperature gradually and improve storage insulation., Inspect, clean, and recalibrate air quality sensors., Reduce ventilation intensity and maintain balanced airflow." },
  { temp: 21.3, humidity: 79.1, moisture: 54.8, airQuality: 404.9, co2: 665.6, light: 129.2, motion: 0, voc: 75.2, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 21.4, humidity: 91.3, moisture: 54, airQuality: 834.9, co2: 441, light: 89.1, motion: 0, voc: 342.6, riskStatus: 1, reason: "High Humidity, Poor Air Quality", reason_of_risk: "Risk of mold, risk of Possible dust or smoke", actionPlan: "Activate dehumidifier., Ventilate and check air filters." },
  { temp: 21.2, humidity: 79.6, moisture: 50.3, airQuality: 421.1, co2: 688, light: 82.1, motion: 0, voc: 399, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 24, humidity: 61.7, moisture: 51.4, airQuality: 421.6, co2: 845.3, light: 193.9, motion: 0, voc: 480.2, riskStatus: 1, reason: "High CO₂ Level, Unexpected Light Level", reason_of_risk: "risk of Poor ventilation, Risk-Color may change", actionPlan: "Improve airflow/ventilation., Cover cinnamon stock with opaque sheets" },
  { temp: 24.4, humidity: 77.7, moisture: 54.6, airQuality: 178.2, co2: 483.4, light: 17.1, motion: 0, voc: 446.6, riskStatus: 2, reason: "Very Low Air Quality Reading, Very Low Light Level", reason_of_risk: "Risk of sensor malfunction or false safety indication, Risk of hidden defects and inspection difficulty", actionPlan: "Inspect, clean, and recalibrate air quality sensors., Enable controlled low-intensity inspection lighting periodically." },
  { temp: 22.6, humidity: 72.1, moisture: 46.8, airQuality: 457.5, co2: 562.5, light: 29.8, motion: 0, voc: 423.4, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 33.4, humidity: 91.8, moisture: 48.8, airQuality: 394.9, co2: 1094.4, light: 107.8, motion: 0, voc: 379.3, riskStatus: 1, reason: "High Humidity, High Temperature, High CO₂ Level", reason_of_risk: "Risk of mold, Risk of product degradation and Color may change, risk of Poor ventilation", actionPlan: "Activate dehumidifier., Increase ventilation/cooling., Improve airflow/ventilation." },
  { temp: 20.5, humidity: 64.6, moisture: 52.9, airQuality: 399.2, co2: 1097.6, light: 106.7, motion: 0, voc: 180.2, riskStatus: 1, reason: "High CO₂ Level", reason_of_risk: "risk of Poor ventilation", actionPlan: "Improve airflow/ventilation." },
  { temp: 22.8, humidity: 85, moisture: 51.5, airQuality: 430.9, co2: 664.4, light: 3.9, motion: 0, voc: 4.7, riskStatus: 2, reason: "Very Low Light Level", reason_of_risk: "Risk of hidden defects and inspection difficulty", actionPlan: "Enable controlled low-intensity inspection lighting periodically." },
  { temp: 21.7, humidity: 62.5, moisture: 54.9, airQuality: 672.3, co2: 511.7, light: 36.4, motion: 1, voc: 376, riskStatus: 1, reason: "Poor Air Quality, Motion Detected", reason_of_risk: "risk of Possible dust or smoke, risk of pests", actionPlan: "Ventilate and check air filters., Check premises immediately." },
  { temp: 20.7, humidity: 81.3, moisture: 53.5, airQuality: 575.5, co2: 642.1, light: 48.4, motion: 0, voc: 234.3, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 22, humidity: 75.6, moisture: 69.2, airQuality: 888.4, co2: 1427.7, light: 137.9, motion: 0, voc: 392.9, riskStatus: 1, reason: "High Moisture Level, Poor Air Quality, High CO₂ Level", reason_of_risk: "Risk of spoilage, risk of Possible dust or smoke, risk of Poor ventilation", actionPlan: "Investigate leaks and dry area., Ventilate and check air filters., Improve airflow/ventilation." },
  { temp: 22.7, humidity: 66.9, moisture: 51.1, airQuality: 344.8, co2: 486.1, light: 78.6, motion: 0, voc: 221.4, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 19.6, humidity: 43.6, moisture: 44.1, airQuality: 593.6, co2: 602.4, light: 149, motion: 0, voc: 390.5, riskStatus: 2, reason: "Low Humidity, Low Moisture Level, Low Temperature", reason_of_risk: "Risk of over-drying and aroma loss, Risk of excessive dryness and weight loss, Risk of condensation during temperature fluctuation", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Balance humidity levels and avoid direct airflow on cinnamon stock., Stabilize temperature gradually and improve storage insulation." },
  { temp: 24.6, humidity: 64.7, moisture: 50.8, airQuality: 467.1, co2: 553.7, light: 29.1, motion: 0, voc: 331.8, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 22.8, humidity: 82.6, moisture: 50.8, airQuality: 333.7, co2: 776.3, light: 56, motion: 0, voc: 2.1, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 21.7, humidity: 78.7, moisture: 52.4, airQuality: 419.2, co2: 414.7, light: 114.7, motion: 0, voc: 371.6, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 18.9, humidity: 69.6, moisture: 36.1, airQuality: 511.2, co2: 438.9, light: 18.7, motion: 0, voc: 15.1, riskStatus: 2, reason: "Low Moisture Level, Low Temperature, Very Low Light Level", reason_of_risk: "Risk of excessive dryness and weight loss, Risk of condensation during temperature fluctuation, Risk of hidden defects and inspection difficulty", actionPlan: "Balance humidity levels and avoid direct airflow on cinnamon stock., Stabilize temperature gradually and improve storage insulation., Enable controlled low-intensity inspection lighting periodically." },
  { temp: 30.1, humidity: 98.9, moisture: 46.7, airQuality: 494.5, co2: 577, light: 68.6, motion: 0, voc: 93.6, riskStatus: 1, reason: "High Humidity, High Temperature", reason_of_risk: "Risk of mold, Risk of product degradation and Color may change", actionPlan: "Activate dehumidifier., Increase ventilation/cooling." },
  { temp: 21.8, humidity: 33.3, moisture: 46.4, airQuality: 415.1, co2: 496.7, light: 126.2, motion: 0, voc: 61.5, riskStatus: 2, reason: "Low Humidity", reason_of_risk: "Risk of over-drying and aroma loss", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity." },
  { temp: 23.5, humidity: 82.2, moisture: 47.3, airQuality: 566, co2: 454.2, light: 53.6, motion: 0, voc: 336, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 19.6, humidity: 65.2, moisture: 31.3, airQuality: 549.6, co2: 322.2, light: 3.6, motion: 0, voc: 70.5, riskStatus: 2, reason: "Low Moisture Level, Low Temperature, Low CO₂ Level, Very Low Light Level", reason_of_risk: "Risk of excessive dryness and weight loss, Risk of condensation during temperature fluctuation, Risk of excessive ventilation and energy wastage, Risk of hidden defects and inspection difficulty", actionPlan: "Balance humidity levels and avoid direct airflow on cinnamon stock., Stabilize temperature gradually and improve storage insulation., Reduce ventilation intensity and maintain balanced airflow., Enable controlled low-intensity inspection lighting periodically." },
  { temp: 22.9, humidity: 72.3, moisture: 45.7, airQuality: 415.2, co2: 529.2, light: 130.2, motion: 0, voc: 103.6, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 20.2, humidity: 82.1, moisture: 54.7, airQuality: 312.8, co2: 677.8, light: 357.7, motion: 1, voc: 2.5, riskStatus: 1, reason: "Motion Detected, Unexpected Light Level", reason_of_risk: "risk of pests, Risk-Color may change", actionPlan: "Check premises immediately., Cover cinnamon stock with opaque sheets" },
  { temp: 24.8, humidity: 30.8, moisture: 53.2, airQuality: 481.5, co2: 606.3, light: 16.4, motion: 0, voc: 492.4, riskStatus: 2, reason: "Low Humidity, Very Low Light Level", reason_of_risk: "Risk of over-drying and aroma loss, Risk of hidden defects and inspection difficulty", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Enable controlled low-intensity inspection lighting periodically." },
  { temp: 23, humidity: 82.9, moisture: 51, airQuality: 368.4, co2: 713.7, light: 78, motion: 0, voc: 360.4, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 16.9, humidity: 55.5, moisture: 31.1, airQuality: 460, co2: 329.7, light: 89.1, motion: 0, voc: 303, riskStatus: 2, reason: "Low Humidity, Low Moisture Level, Low Temperature, Low CO₂ Level", reason_of_risk: "Risk of over-drying and aroma loss, Risk of excessive dryness and weight loss, Risk of condensation during temperature fluctuation, Risk of excessive ventilation and energy wastage", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Balance humidity levels and avoid direct airflow on cinnamon stock., Stabilize temperature gradually and improve storage insulation., Reduce ventilation intensity and maintain balanced airflow." },
  { temp: 11.4, humidity: 76.1, moisture: 50.5, airQuality: 402.9, co2: 467.9, light: 16.1, motion: 0, voc: 417.5, riskStatus: 2, reason: "Low Temperature, Very Low Light Level", reason_of_risk: "Risk of condensation during temperature fluctuation, Risk of hidden defects and inspection difficulty", actionPlan: "Stabilize temperature gradually and improve storage insulation., Enable controlled low-intensity inspection lighting periodically." },
  { temp: 20.5, humidity: 95.3, moisture: 50.2, airQuality: 322, co2: 807.6, light: 363.3, motion: 0, voc: 412.1, riskStatus: 1, reason: "High Humidity, High CO₂ Level, Unexpected Light Level", reason_of_risk: "Risk of mold, risk of Poor ventilation, Risk-Color may change", actionPlan: "Activate dehumidifier., Improve airflow/ventilation., Cover cinnamon stock with opaque sheets" },
  { temp: 24.9, humidity: 65.8, moisture: 51.2, airQuality: 504.3, co2: 412.5, light: 102.5, motion: 0, voc: 87.7, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 24.4, humidity: 66.9, moisture: 53.8, airQuality: 551.6, co2: 421.8, light: 32.2, motion: 0, voc: 279.5, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 39.4, humidity: 82.4, moisture: 52.5, airQuality: 883.6, co2: 727.3, light: 404.8, motion: 1, voc: 179, riskStatus: 1, reason: "High Temperature, Poor Air Quality, Motion Detected, Unexpected Light Level", reason_of_risk: "Risk of product degradation and Color may change, risk of Possible dust or smoke, risk of pests, Risk-Color may change", actionPlan: "Increase ventilation/cooling., Ventilate and check air filters., Check premises immediately., Cover cinnamon stock with opaque sheets" },
  { temp: 21.9, humidity: 82.9, moisture: 45.4, airQuality: 504.6, co2: 611.4, light: 53.9, motion: 0, voc: 70.7, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 22.7, humidity: 74.4, moisture: 45.3, airQuality: 505.8, co2: 635.1, light: 71.1, motion: 0, voc: 449.4, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 20.9, humidity: 82.6, moisture: 53.5, airQuality: 589.4, co2: 769.8, light: 26.4, motion: 0, voc: 107.8, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 15.6, humidity: 66.7, moisture: 51.6, airQuality: 347.5, co2: 210, light: 10, motion: 0, voc: 317.7, riskStatus: 2, reason: "Low Temperature, Low CO₂ Level, Very Low Light Level", reason_of_risk: "Risk of condensation during temperature fluctuation, Risk of excessive ventilation and energy wastage, Risk of hidden defects and inspection difficulty", actionPlan: "Stabilize temperature gradually and improve storage insulation., Reduce ventilation intensity and maintain balanced airflow., Enable controlled low-intensity inspection lighting periodically." },
  { temp: 20.8, humidity: 57.4, moisture: 46, airQuality: 157.8, co2: 298, light: 140.6, motion: 0, voc: 352.2, riskStatus: 2, reason: "Low Humidity, Very Low Air Quality Reading, Low CO₂ Level", reason_of_risk: "Risk of over-drying and aroma loss, Risk of sensor malfunction or false safety indication, Risk of excessive ventilation and energy wastage", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Inspect, clean, and recalibrate air quality sensors., Reduce ventilation intensity and maintain balanced airflow." },
  { temp: 23, humidity: 79.6, moisture: 52.8, airQuality: 499.6, co2: 447.3, light: 26.9, motion: 0, voc: 109.1, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 23.2, humidity: 67.3, moisture: 53.1, airQuality: 327.9, co2: 604.2, light: 121.1, motion: 0, voc: 111, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 18.6, humidity: 42.2, moisture: 51.2, airQuality: 397, co2: 668.7, light: 122, motion: 0, voc: 376.2, riskStatus: 2, reason: "Low Humidity, Low Temperature", reason_of_risk: "Risk of over-drying and aroma loss, Risk of condensation during temperature fluctuation", actionPlan: "Reduce dehumidifier usage and slightly increase ambient humidity., Stabilize temperature gradually and improve storage insulation." },
  { temp: 25.9, humidity: 81.4, moisture: 48.8, airQuality: 314.4, co2: 642.5, light: 108.3, motion: 0, voc: 383.3, riskStatus: 1, reason: "High Temperature", reason_of_risk: "Risk of product degradation and Color may change", actionPlan: "Increase ventilation/cooling." },
  { temp: 34.2, humidity: 92.7, moisture: 50, airQuality: 570.9, co2: 503.5, light: 23.2, motion: 0, voc: 442.9, riskStatus: 1, reason: "High Humidity, High Temperature", reason_of_risk: "Risk of mold, Risk of product degradation and Color may change", actionPlan: "Activate dehumidifier., Increase ventilation/cooling." },
  { temp: 24.4, humidity: 60.3, moisture: 55, airQuality: 471.6, co2: 563.9, light: 58.4, motion: 0, voc: 373.6, riskStatus: 0, reason: "No issues detected", reason_of_risk: "no", actionPlan: "No action required." },
  { temp: 21.5, humidity: 81.2, moisture: 53.5, airQuality: 860.6, co2: 549.1, light: 104.3, motion: 0, voc: 186, riskStatus: 1, reason: "Poor Air Quality", reason_of_risk: "risk of Possible dust or smoke", actionPlan: "Ventilate and check air filters." },
  { temp: 23.3, humidity: 63.6, moisture: 49.8, airQuality: 891.4, co2: 769.4, light: 29.4, motion: 0, voc: 287.4, riskStatus: 1, reason: "Poor Air Quality", reason_of_risk: "risk of Possible dust or smoke", actionPlan: "Ventilate and check air filters." }

];

// Calculate similarity score between current sensor data and CSV patterns
function calculateSimilarityScore(currentData, csvRow) {
  const THRESHOLDS = {
    temperature: 5,
    humidity: 10,
    moisture: 10,
    airQuality: 150,
    co2: 150,
    light: 100,
    voc: 100,
    motion: 0.5
  };

  let score = 0;
  let maxScore = 0;

  // Temperature
  if (Math.abs(currentData.temperature - csvRow.temp) <= THRESHOLDS.temperature) {
    score += 20;
  }
  maxScore += 20;

  // Humidity
  if (Math.abs(currentData.humidity - csvRow.humidity) <= THRESHOLDS.humidity) {
    score += 20;
  }
  maxScore += 20;

  // Moisture
  if (currentData.moisture_level !== undefined && Math.abs(currentData.moisture_level - csvRow.moisture) <= THRESHOLDS.moisture) {
    score += 15;
  }
  maxScore += 15;

  // Air Quality
  if (currentData.air_quality_adc !== undefined && Math.abs(currentData.air_quality_adc - csvRow.airQuality) <= THRESHOLDS.airQuality) {
    score += 15;
  }
  maxScore += 15;

  // CO2
  if (Math.abs(currentData.co2 - csvRow.co2) <= THRESHOLDS.co2) {
    score += 15;
  }
  maxScore += 15;

  // Light
  if (Math.abs(currentData.light - csvRow.light) <= THRESHOLDS.light) {
    score += 10;
  }
  maxScore += 10;

  // Motion
  if (currentData.motion_detected === (csvRow.motion === 1)) {
    score += 5;
  }
  maxScore += 5;

  return (score / maxScore) * 100;
}

// Get action plan from CSV based on current sensor readings
export function getCSVActionPlan(sensorData) {
  if (!sensorData || sensorData.temperature === null) {
    return null;
  }

  // Find the best matching row
  let bestMatch = null;
  let highestScore = 0;

  CSV_ACTION_PLANS.forEach(row => {
    const score = calculateSimilarityScore(sensorData, row);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = row;
    }
  });

  // Only return if we have a reasonable match (>40% similarity)
  if (bestMatch && highestScore >= 40) {
    return {
      reason: bestMatch.reason,
      reason_of_risk: bestMatch.reason_of_risk,
      actionPlan: bestMatch.actionPlan,
      riskStatus: bestMatch.riskStatus,
      matchScore: highestScore
    };
  }

  return null;
}

// Get high-risk patterns
export function getHighRiskPatterns() {
  return CSV_ACTION_PLANS.filter(row => row.riskStatus === 1);
}

// Get low-risk patterns
export function getLowRiskPatterns() {
  return CSV_ACTION_PLANS.filter(row => row.riskStatus === 2);
}

// Search patterns by keyword
export function searchActionPatterns(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return CSV_ACTION_PLANS.filter(row => 
    row.reason.toLowerCase().includes(lowerKeyword) ||
    row.actionPlan.toLowerCase().includes(lowerKeyword)
  );
}
