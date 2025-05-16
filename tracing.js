// tracing.js (antes de require de tu app)
const { NodeSDK } = require('@opentelemetry/sdk-node')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')

// configuración por defecto manda a localhost:6831 (UDP)
const exporter = new JaegerExporter({
  serviceName: 'payments-api'
})

new NodeSDK({
  traceExporter: exporter,
  instrumentations: [ getNodeAutoInstrumentations() ]
}).start()
