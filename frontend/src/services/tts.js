import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TTS settings storage keys
const TTS_SPEED_KEY = 'tts_speed';
const TTS_PITCH_KEY = 'tts_pitch';
const TTS_VOICE_KEY = 'tts_voice';

// Default TTS settings
const DEFAULT_SPEED = 1.0;
const DEFAULT_PITCH = 1.0;
const DEFAULT_VOICE = null; // Use system default voice

/**
 * Text-to-Speech service
 */
class TTSService {
  constructor() {
    this.speed = DEFAULT_SPEED;
    this.pitch = DEFAULT_PITCH;
    this.voice = DEFAULT_VOICE;
    this.isSpeaking = false;
    this.availableVoices = [];
    
    // Load saved settings
    this.loadSettings();
    
    // Get available voices
    this.getAvailableVoices();
  }

  /**
   * Load saved TTS settings from AsyncStorage
   */
  async loadSettings() {
    try {
      const [speedStr, pitchStr, voice] = await Promise.all([
        AsyncStorage.getItem(TTS_SPEED_KEY),
        AsyncStorage.getItem(TTS_PITCH_KEY),
        AsyncStorage.getItem(TTS_VOICE_KEY)
      ]);

      this.speed = speedStr ? parseFloat(speedStr) : DEFAULT_SPEED;
      this.pitch = pitchStr ? parseFloat(pitchStr) : DEFAULT_PITCH;
      this.voice = voice || DEFAULT_VOICE;
    } catch (error) {
      console.error('Failed to load TTS settings:', error);
      // Use defaults if loading fails
      this.speed = DEFAULT_SPEED;
      this.pitch = DEFAULT_PITCH;
      this.voice = DEFAULT_VOICE;
    }
  }

  /**
   * Save TTS settings to AsyncStorage
   */
  async saveSettings() {
    try {
      await Promise.all([
        AsyncStorage.setItem(TTS_SPEED_KEY, this.speed.toString()),
        AsyncStorage.setItem(TTS_PITCH_KEY, this.pitch.toString()),
        AsyncStorage.setItem(TTS_VOICE_KEY, this.voice || '')
      ]);
    } catch (error) {
      console.error('Failed to save TTS settings:', error);
    }
  }

  /**
   * Get available voices for TTS
   * @returns {Promise<Array>} - List of available voices
   */
  async getAvailableVoices() {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      this.availableVoices = voices;
      return voices;
    } catch (error) {
      console.error('Failed to get available voices:', error);
      return [];
    }
  }

  /**
   * Set TTS speed
   * @param {number} speed - Speed value (0.1 to 16.0)
   */
  async setSpeed(speed) {
    // Ensure speed is within valid range
    const validSpeed = Math.max(0.1, Math.min(16.0, speed));
    this.speed = validSpeed;
    await this.saveSettings();
  }

  /**
   * Set TTS pitch
   * @param {number} pitch - Pitch value (0.5 to 2.0)
   */
  async setPitch(pitch) {
    // Ensure pitch is within valid range
    const validPitch = Math.max(0.5, Math.min(2.0, pitch));
    this.pitch = validPitch;
    await this.saveSettings();
  }

  /**
   * Set TTS voice
   * @param {string} voice - Voice identifier
   */
  async setVoice(voice) {
    this.voice = voice;
    await this.saveSettings();
  }

  /**
   * Speak text using TTS
   * @param {string} text - Text to speak
   * @returns {Promise<void>}
   */
  async speak(text) {
    try {
      // Stop any ongoing speech
      await this.stop();

      // Prepare speech options
      const options = {
        rate: this.speed,
        pitch: this.pitch,
        ...(this.voice && { voice: this.voice })
      };

      // Start speaking
      this.isSpeaking = true;
      await Speech.speak(text, {
        ...options,
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: (error) => {
          console.error('TTS error:', error);
          this.isSpeaking = false;
        }
      });
    } catch (error) {
      console.error('Failed to speak text:', error);
      this.isSpeaking = false;
    }
  }

  /**
   * Stop ongoing speech
   * @returns {Promise<void>}
   */
  async stop() {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }

  /**
   * Check if TTS is currently speaking
   * @returns {boolean} - True if speaking, false otherwise
   */
  isCurrentlySpeaking() {
    return this.isSpeaking;
  }

  /**
   * Get current TTS settings
   * @returns {Object} - Current settings
   */
  getSettings() {
    return {
      speed: this.speed,
      pitch: this.pitch,
      voice: this.voice,
      availableVoices: this.availableVoices
    };
  }
}

export default new TTSService();
