export type IotConnectedDevice = {
     id: string
     deviceName: string
     deviceType: string
}

export type IotBoard = {
     id: string
     boardName: string
     boardType: string
     devices: IotConnectedDevice[]
}

// TODO: Replace this mock source with API data from BE when endpoint is ready.
// Expected shape per board: { id, boardName, boardType, devices[] }
export const MOCK_IOT_BOARDS: IotBoard[] = [
     {
          id: "esp32-a-001",
          boardName: "ESP32 - A101",
          boardType: "ESP32",
          devices: [
               { id: "flame-01", deviceName: "Cảm biến nhiệt độ", deviceType: "sensor" },
               { id: "light-01", deviceName: "Đèn 1", deviceType: "switch" },
               { id: "light-02", deviceName: "Đèn 2", deviceType: "switch" },
               { id: "curtain-01", deviceName: "Rèm 1", deviceType: "switch" },
               { id: "door-01", deviceName: "Cửa chính 1", deviceType: "switch" },
          ],
     },
     {
          id: "esp32-b-002",
          boardName: "ESP32 - A102",
          boardType: "ESP32",
          devices: [
               { id: "dev-door-01", deviceName: "Cảm biến cửa", deviceType: "sensor" },
               { id: "dev-motion-01", deviceName: "Cảm biến chuyển động", deviceType: "sensor" },
          ],
     },
     {
          id: "esp32-c-003",
          boardName: "ESP32 - A103",
          boardType: "ESP32",
          devices: [],
     },
]
