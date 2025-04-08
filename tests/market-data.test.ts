/**
 * @description
 * This file contains unit tests for the market data fetch action.
 * It verifies that the fetchMarketDataAction function properly retrieves and parses
 * candlestick data from the BingX API, handles error responses, and validates the data.
 *
 * Key features:
 * - Mocks the global fetch method to simulate different API responses.
 * - Tests successful API responses, non-OK responses, and invalid data scenarios.
 *
 * @dependencies
 * - Jest for the testing framework.
 * - The fetchMarketDataAction function from "@/actions/market-data/fetch-market-data".
 *
 * @notes
 * - Ensure that Jest is installed and configured.
 * - These tests run in a Node environment with the appropriate environment variables set.
 */

import { fetchMarketDataAction, type Candlestick } from "@/actions/market-data/fetch-market-data"

describe("fetchMarketDataAction", () => {
  beforeEach(() => {
    // Set dummy environment variables required by the action.
    process.env.BINGX_API_URL = "http://dummy-api.com"
    process.env.BINGX_API_KEY = "dummy-key"
    process.env.BINGX_API_SECRET = "dummy-secret"
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("should fetch and parse valid market data", async () => {
    // Sample candlestick data returned as strings (except time, which is numeric)
    const sampleData = [
      {
        open: "100",
        close: "110",
        high: "115",
        low: "95",
        volume: "1000",
        time: 1670000000000
      },
      {
        open: "110",
        close: "120",
        high: "125",
        low: "105",
        volume: "2000",
        time: 1670000060000
      },
      {
        open: "120",
        close: "130",
        high: "135",
        low: "115",
        volume: "1500",
        time: 1670000120000
      }
    ]

    // Create a fake response simulating a successful API call.
    const fakeResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: sampleData })
    }
    global.fetch = jest.fn().mockResolvedValue(fakeResponse as any)

    const result = await fetchMarketDataAction()

    // Expect a successful response with data transformed (and reversed) correctly.
    expect(result.isSuccess).toBe(true)
    expect(result.data).toEqual(
      sampleData.reverse().map((item) => ({
        open: parseFloat(item.open),
        close: parseFloat(item.close),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        volume: parseFloat(item.volume),
        time: item.time
      }))
    )
  })

  it("should return error if fetch response is not ok", async () => {
    // Simulate an error response from the API.
    const fakeResponse = {
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue("Internal Server Error")
    }
    global.fetch = jest.fn().mockResolvedValue(fakeResponse as any)

    const result = await fetchMarketDataAction()

    expect(result.isSuccess).toBe(false)
    expect(result.message).toContain("El API de BingX respondió con el estado 500")
  })

  it("should return error if data validation fails", async () => {
    // Provide invalid data (e.g., missing the 'time' property) to force validation failure.
    const invalidData = [
      {
        open: "100",
        close: "110",
        high: "115",
        low: "95",
        volume: "1000"
        // missing time property
      }
    ]
    const fakeResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ data: invalidData })
    }
    global.fetch = jest.fn().mockResolvedValue(fakeResponse as any)

    const result = await fetchMarketDataAction()
    expect(result.isSuccess).toBe(false)
    expect(result.message).toContain("El formato de datos de candlestick recibido es inválido.")
  })
})
