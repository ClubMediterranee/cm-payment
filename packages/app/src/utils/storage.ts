/**
 * Session Storage utilities for storing and retrieving JSON data
 */

import type { SessionStorageValues } from '../types/SessionStorage.js';

/**
 * Store a JSON object in session storage with the given key
 * @param key - The key to store the data under
 * @param data - The data to store (will be JSON stringified)
 * @returns true if successful, false otherwise
 */
export function setSessionItem<
  Key extends keyof SessionStorageValues,
  Value = SessionStorageValues[Key],
>(key: Key, data: Value): boolean {
  try {
    const jsonString = JSON.stringify(data);
    sessionStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    console.error(`Failed to store data in session storage for key "${key}":`, error);
    return false;
  }
}

/**
 * Retrieve and parse JSON data from session storage
 * @param key - The key to retrieve data from
 * @returns The parsed data or null if not found or invalid
 */
export function getSessionItem<
  Key extends keyof SessionStorageValues,
  Value = SessionStorageValues[Key],
>(key: Key): Value | null {
  try {
    const jsonString = sessionStorage.getItem(key);
    if (jsonString === null) {
      return null;
    }
    return JSON.parse(jsonString) as Value;
  } catch (error) {
    console.error(`Failed to retrieve or parse data from session storage for key "${key}":`, error);
    return null;
  }
}

/**
 * Remove an item from session storage
 * @param key - The key to remove
 * @returns true if the key existed and was removed, false otherwise
 */
export function removeSessionItem<Key extends keyof SessionStorageValues>(key: Key): boolean {
  try {
    const existed = sessionStorage.getItem(key) !== null;
    sessionStorage.removeItem(key);
    return existed;
  } catch (error) {
    console.error(`Failed to remove data from session storage for key "${key}":`, error);
    return false;
  }
}

/**
 * Check if a key exists in session storage
 * @param key - The key to check
 * @returns true if the key exists, false otherwise
 */
export function hasSessionItem<Key extends keyof SessionStorageValues>(key: Key): boolean {
  try {
    return sessionStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Failed to check session storage for key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all data from session storage
 * @returns true if successful, false otherwise
 */
export function clearSessionStorage(): boolean {
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear session storage:', error);
    return false;
  }
}

/**
 * Get all keys from session storage
 * @returns Array of all keys in session storage
 */
export function getSessionKeys(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('Failed to get session storage keys:', error);
    return [];
  }
}
