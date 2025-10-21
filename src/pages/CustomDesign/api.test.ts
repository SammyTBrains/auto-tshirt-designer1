import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkLocalServer,
  loadPreviousDesigns,
  handleGenerateDesign,
} from "./api";
import { DesignService } from "../../services/designService";

// Mock DesignService
vi.mock("../../services/designService", () => ({
  DesignService: {
    checkHealth: vi.fn(),
    loadDesignHistory: vi.fn(),
    generateDesign: vi.fn(),
  },
}));

describe("API Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkLocalServer", () => {
    it("should log success when server is available", async () => {
      // Mock successful health check
      vi.mocked(DesignService.checkHealth).mockResolvedValueOnce(true);
      const consoleSpy = vi.spyOn(console, "log");

      await checkLocalServer();

      expect(consoleSpy).toHaveBeenCalledWith("API is available");
      expect(DesignService.checkHealth).toHaveBeenCalledTimes(1);
    });

    it("should log failure when server is not available", async () => {
      // Mock failed health check
      vi.mocked(DesignService.checkHealth).mockResolvedValueOnce(false);
      const consoleSpy = vi.spyOn(console, "error");

      await checkLocalServer();

      expect(consoleSpy).toHaveBeenCalledWith(
        "API is not available - falling back to backup endpoints"
      );
      expect(DesignService.checkHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe("loadPreviousDesigns", () => {
    const mockSetPreviousDesigns = vi.fn();
    const mockSetIsLoadingHistory = vi.fn();

    beforeEach(() => {
      mockSetPreviousDesigns.mockClear();
      mockSetIsLoadingHistory.mockClear();
    });

    it("should load previous designs successfully", async () => {
      vi.mocked(DesignService.loadDesignHistory).mockResolvedValueOnce([
        {
          id: "1",
          image_data: "design1",
          created_at: "",
          prompt: "",
          transform: undefined,
        },
        {
          id: "2",
          image_data: "design2",
          created_at: "",
          prompt: "",
          transform: undefined,
        },
      ]);

      await loadPreviousDesigns(
        mockSetPreviousDesigns,
        mockSetIsLoadingHistory
      );

      expect(mockSetPreviousDesigns).toHaveBeenCalledWith([
        "design1",
        "design2",
      ]);
      expect(mockSetIsLoadingHistory).toHaveBeenCalledTimes(2);
      expect(mockSetIsLoadingHistory).toHaveBeenNthCalledWith(1, true);
      expect(mockSetIsLoadingHistory).toHaveBeenNthCalledWith(2, false);
    });

    it("should handle errors when loading designs", async () => {
      vi.mocked(DesignService.loadDesignHistory).mockRejectedValueOnce(
        new Error("Failed to load")
      );
      const consoleSpy = vi.spyOn(console, "error");

      await loadPreviousDesigns(
        mockSetPreviousDesigns,
        mockSetIsLoadingHistory
      );

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockSetIsLoadingHistory).toHaveBeenCalledTimes(2);
      expect(mockSetIsLoadingHistory).toHaveBeenNthCalledWith(1, true);
      expect(mockSetIsLoadingHistory).toHaveBeenNthCalledWith(2, false);
      expect(mockSetPreviousDesigns).toHaveBeenCalledWith([]);
    });
  });

  describe("handleGenerateDesign", () => {
    const mockSetIsGenerating = vi.fn();
    const mockSetError = vi.fn();
    const mockSetDesignTexture = vi.fn();

    beforeEach(() => {
      mockSetIsGenerating.mockClear();
      mockSetError.mockClear();
      mockSetDesignTexture.mockClear();
    });

    it("should generate design successfully", async () => {
      const mockDesign = "generated-design-data";
      vi.mocked(DesignService.generateDesign).mockResolvedValueOnce(mockDesign);

      await handleGenerateDesign(
        "test prompt",
        mockSetIsGenerating,
        mockSetError,
        mockSetDesignTexture
      );

      expect(mockSetIsGenerating).toHaveBeenCalledTimes(2);
      expect(mockSetIsGenerating).toHaveBeenNthCalledWith(1, true);
      expect(mockSetIsGenerating).toHaveBeenNthCalledWith(2, false);
      expect(mockSetError).toHaveBeenCalledWith(null);
      expect(mockSetDesignTexture).toHaveBeenCalledWith(mockDesign);
    });

    it("should handle generation errors", async () => {
      vi.mocked(DesignService.generateDesign).mockRejectedValueOnce(
        new Error("Generation failed")
      );

      await handleGenerateDesign(
        "test prompt",
        mockSetIsGenerating,
        mockSetError,
        mockSetDesignTexture
      );

      expect(mockSetIsGenerating).toHaveBeenCalledTimes(2);
      expect(mockSetIsGenerating).toHaveBeenNthCalledWith(1, true);
      expect(mockSetIsGenerating).toHaveBeenNthCalledWith(2, false);
      expect(mockSetError).toHaveBeenCalledWith("Generation failed");
      expect(mockSetDesignTexture).toHaveBeenCalledWith(null);
    });
  });
});
