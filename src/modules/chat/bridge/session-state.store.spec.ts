import * as fs from 'fs';
import * as path from 'path';
import { SessionStateStore } from './session-state.store';
import { DedicatedSessionState } from './superpower-bridge.types';

describe('SessionStateStore', () => {
  const tmpDir = path.join(__dirname, '__tmp_session_state_store__');
  const stateFilePath = path.join(tmpDir, 'session-state.json');

  beforeAll(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    if (fs.existsSync(stateFilePath)) {
      fs.unlinkSync(stateFilePath);
    }
  });

  describe('load()', () => {
    it('should return null when file does not exist', () => {
      const store = new SessionStateStore(stateFilePath);
      expect(store.load()).toBeNull();
    });

    it('should load and return parsed DedicatedSessionState', () => {
      const state: DedicatedSessionState = {
        sessionKey: 'test-key',
        sessionId: 'session-123',
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:01.000Z',
      };
      fs.writeFileSync(stateFilePath, JSON.stringify(state), 'utf-8');

      const store = new SessionStateStore(stateFilePath);
      const loaded = store.load();

      expect(loaded).toEqual(state);
    });

    it('should return null when file contains invalid JSON', () => {
      fs.writeFileSync(stateFilePath, 'not valid json{', 'utf-8');

      const store = new SessionStateStore(stateFilePath);
      expect(store.load()).toBeNull();
    });
  });

  describe('save()', () => {
    it('should persist DedicatedSessionState to disk', () => {
      const store = new SessionStateStore(stateFilePath);
      const state: DedicatedSessionState = {
        sessionKey: 'saved-key',
        sessionId: 'session-456',
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:02.000Z',
      };

      store.save(state);

      const raw = fs.readFileSync(stateFilePath, 'utf-8');
      expect(JSON.parse(raw)).toEqual(state);
    });

    it('should overwrite existing file', () => {
      const store = new SessionStateStore(stateFilePath);

      const state1: DedicatedSessionState = {
        sessionKey: 'key-1',
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      };
      store.save(state1);

      const state2: DedicatedSessionState = {
        sessionKey: 'key-2',
        sessionId: 'session-789',
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:03.000Z',
      };
      store.save(state2);

      const raw = fs.readFileSync(stateFilePath, 'utf-8');
      expect(JSON.parse(raw)).toEqual(state2);
    });
  });

  describe('persistence round-trip', () => {
    it('should survive a save followed by reload', () => {
      const store = new SessionStateStore(stateFilePath);
      const original: DedicatedSessionState = {
        sessionKey: 'round-trip-key',
        sessionId: 'session-round-trip',
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:05.000Z',
      };

      store.save(original);

      // Simulate re-instantiation (as would happen on next request)
      const reloadedStore = new SessionStateStore(stateFilePath);
      const reloaded = reloadedStore.load();

      expect(reloaded).toEqual(original);
    });
  });
});
