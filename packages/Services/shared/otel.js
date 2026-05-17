const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');

const { logs, SeverityNumber } = require('@opentelemetry/api-logs');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || 'unknown-service',
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4318/v1/traces',
  }),
  logRecordProcessor: new SimpleLogRecordProcessor(
    new OTLPLogExporter({
      url: 'http://otel-collector:4318/v1/logs',
    })
  ),
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK
sdk.start();

// Hook into console.log and console.error to send them to OTEL Logs
const logger = logs.getLogger(process.env.SERVICE_NAME || 'unknown-service');

const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  originalLog(...args);
  logger.emit({
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
    body: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '),
  });
};

console.error = (...args) => {
  originalError(...args);
  logger.emit({
    severityNumber: SeverityNumber.ERROR,
    severityText: 'ERROR',
    body: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '),
  });
};

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('SDK shut down successfully'))
    .catch((err) => console.log('Error shutting down SDK', err))
    .finally(() => process.exit(0));
});

module.exports = sdk;
