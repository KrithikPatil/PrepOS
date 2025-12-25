/**
 * PrepOS Services Index
 * Re-exports all services for easy importing
 */

export { default as api } from './api';
export { default as authService } from './authService';
export { default as testService } from './testService';
export { default as agentService } from './agentService';
export { default as studentService } from './studentService';
export { default as questionService } from './questionService';

// Also export as named exports for convenience
export * from './authService';
export * from './testService';
export * from './agentService';
export * from './studentService';
export * from './questionService';

