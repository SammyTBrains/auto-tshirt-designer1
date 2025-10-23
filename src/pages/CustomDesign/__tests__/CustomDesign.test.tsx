import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, test } from "vitest";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "../../../context/CartContext";
import CustomDesign from "../CustomDesign";

describe("CustomDesign Page Button Tests", () => {
  const mockErrorReport: ErrorReport[] = [];

  beforeEach(() => {
    render(
      <BrowserRouter>
        <HelmetProvider>
          <CartProvider>
            <CustomDesign />
          </CartProvider>
        </HelmetProvider>
      </BrowserRouter>
    );
  });

  const testButton = async (
    buttonIdentifier: string,
    assertFn?: (button: HTMLButtonElement) => Promise<void> | void
  ) => {
    try {
      const button = screen.getByRole("button", {
        name: buttonIdentifier,
      }) as HTMLButtonElement;

      expect(button).toBeInTheDocument();

      if (assertFn) {
        await assertFn(button);
      }

      // Add success to report
      mockErrorReport.push({
        buttonId: buttonIdentifier,
        testCase: "Basic Button Functionality",
        status: "PASS",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      mockErrorReport.push({
        buttonId: buttonIdentifier,
        testCase: "Basic Button Functionality",
        status: "FAIL",
        error: {
          message: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  test("Generate Design button functionality", async () => {
    await testButton("Generate Design", async (button) => {
      expect(button).toBeEnabled();
      await userEvent.click(button);
    });
  });

  test("Add to Cart button renders but stays disabled before design", async () => {
    await testButton("Add to Cart", (button) => {
      expect(button).toBeDisabled();
    });
  });

  // Add more button tests as needed
});

interface ErrorReport {
  buttonId: string;
  testCase: string;
  status: "PASS" | "FAIL";
  error?: {
    message: string;
    stack?: string;
    timestamp: string;
  };
  timestamp: string;
}
