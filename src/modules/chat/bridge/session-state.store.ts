import * as fs from 'fs';
import * as path from 'path';
import { DedicatedSessionState } from './superpower-bridge.types';

/**
 * Persists and loads {@link DedicatedSessionState} to a JSON file.
 */
export class SessionStateStore {
  constructor(private readonly filePath: string) {}

  /**
   * Loads session state from the file.
   * @returns The parsed state, or `null` if the file does not exist or is invalid.
   */
  load(): DedicatedSessionState | null {
    try {
      if (!fs.existsSync(this.filePath)) {
        return null;
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(raw) as DedicatedSessionState;
    } catch {
      return null;
    }
  }

  /**
   * Persists session state to the file, creating parent directories if needed.
   * @throws Error if the file cannot be written; the error carries the underlying I/O cause.
   */
  save(state: DedicatedSessionState): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2), 'utf-8');
    } catch (cause) {
      throw new Error(`Failed to persist session state to "${this.filePath}"`, { cause });
    }
  }
}
