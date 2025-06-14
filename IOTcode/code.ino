#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// WiFi credentials
const char* ssid = "Redmi 12 5G";  // Replace with your WiFi SSID
const char* password = "Maki1306";              // Replace with your WiFi password

// Server endpoint
const char* serverUrl = "http://150.242.201.153:4000/machinedataroute/add";  // Replace with your backend URL

// Sensor pin
const int sensorPin = A0;  // ACS712 OUT connected to A0

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  // Read analog value from ACS712
  int adcValue = analogRead(sensorPin);
  float voltage = (adcValue * 3.3) / 1023.0;

  float offset = 2.5;  // Calibrate this offset according to your module
  float current = -(voltage - offset) / 0.185;  // For ACS712-5A, sensitivity = 185 mV/A

  // Avoid sending extremely noisy values when sensor is idle
  if (abs(current) < 0.1) {
    current = 0;
  }

  Serial.printf("ADC: %d, Voltage: %.2f V, Current: %.2f A\n", adcValue, voltage, current);

  // Create JSON payload
  int machine_id = 1;  // You can change this if needed
  String payload = "{\"machine_id\": " + String(machine_id) + ", \"data\": " + String(current, 3) + "}";

  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(payload);

    Serial.print("POST Response Code: ");
    Serial.println(httpCode);

    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Server Response:");
      Serial.println(response);
    } else {
      Serial.println("Error sending POST request.");
    }

    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }

  delay(5000);  // Wait 5 seconds before next reading
}