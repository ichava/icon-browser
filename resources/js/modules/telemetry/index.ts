// The telemetry bounded context (architecture.md 3.2): the page logger with a child per
// mount, and the dev event bus with a child per store. Other modules and the app reach
// it only through this file.
export { Logger, pageLogger, PAGE_LOG_SOURCE, type LogChannel, type LogEntry, type LogLevel } from './infrastructure/Logger';
export { DevBus, pageDevBus, PAGE_BUS_SOURCE, type DevEvent, type DevEventKind } from './infrastructure/DevBus';
