"use client";

import { useEffect, useState } from "react";
import type { Vehicle } from "@/features/vehicles/data/vehicles";
import { fetchVehicleBySlug, fetchVehicles } from "@/features/vehicles/lib/vehicles-api";

type UseVehiclesResult = {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
};

type UseVehicleResult = {
  vehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
};

type UseVehiclesOptions = {
  enabled?: boolean;
};

export function useVehicles(options: UseVehiclesOptions = {}): UseVehiclesResult {
  const { enabled = true } = options;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    const loadVehicles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchVehicles(controller.signal);
        if (!controller.signal.aborted) {
          setVehicles(data);
        }
      } catch (caught) {
        if (controller.signal.aborted) return;
        if (process.env.NODE_ENV !== "production") {
          console.error("[useVehicles] Failed to fetch vehicles", caught);
        }
        setError("Unable to load vehicles right now. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    void loadVehicles();

    return () => controller.abort();
  }, [enabled]);

  if (!enabled) {
    return { vehicles: [], isLoading: false, error: null };
  }

  return { vehicles, isLoading, error };
}

export function useVehicle(slug: string): UseVehicleResult {
  const normalizedSlug = slug.trim();
  const shouldFetch = normalizedSlug.length > 0;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldFetch) {
      return;
    }

    const controller = new AbortController();
    const loadVehicle = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchVehicleBySlug(normalizedSlug, controller.signal);
        if (!controller.signal.aborted) {
          setVehicle(data);
        }
      } catch (caught) {
        if (controller.signal.aborted) return;
        if (process.env.NODE_ENV !== "production") {
          console.error("[useVehicle] Failed to fetch vehicle", { slug: normalizedSlug, error: caught });
        }
        setError("Unable to load this vehicle right now. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    void loadVehicle();

    return () => controller.abort();
  }, [normalizedSlug, shouldFetch]);

  if (!shouldFetch) {
    return { vehicle: null, isLoading: false, error: "Vehicle not found." };
  }

  return { vehicle, isLoading, error };
}
