"use client";

import type { UploadCategory } from "@/lib/uploads/types";

export type PendingBookingUpload = {
  category: UploadCategory;
  file: File;
};

const pendingUploadsBySession = new Map<string, Map<UploadCategory, File>>();

function getOrCreateSessionMap(bookingSessionId: string): Map<UploadCategory, File> {
  const existing = pendingUploadsBySession.get(bookingSessionId);
  if (existing) {
    return existing;
  }

  const created = new Map<UploadCategory, File>();
  pendingUploadsBySession.set(bookingSessionId, created);
  return created;
}

export function setPendingBookingUpload(bookingSessionId: string, category: UploadCategory, file: File): void {
  getOrCreateSessionMap(bookingSessionId).set(category, file);
}

export function clearPendingBookingUpload(bookingSessionId: string, category: UploadCategory): void {
  const sessionUploads = pendingUploadsBySession.get(bookingSessionId);
  if (!sessionUploads) {
    return;
  }

  sessionUploads.delete(category);
  if (sessionUploads.size === 0) {
    pendingUploadsBySession.delete(bookingSessionId);
  }
}

export function collectPendingBookingUploads(bookingSessionId: string): PendingBookingUpload[] {
  const sessionUploads = pendingUploadsBySession.get(bookingSessionId);
  if (!sessionUploads) {
    return [];
  }

  return Array.from(sessionUploads.entries()).map(([category, file]) => ({ category, file }));
}

export function clearPendingBookingSessionUploads(bookingSessionId: string): void {
  pendingUploadsBySession.delete(bookingSessionId);
}
