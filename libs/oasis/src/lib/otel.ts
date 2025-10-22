import { context, type Span, SpanStatusCode, trace } from "@opentelemetry/api";

export type { Span };

const LIB_NAME = "@navikt/oasis";

/**
 * Wraps an async function in a span. Lets you receive the active
 * span to add additional attributes or events.
 */
export async function spanAsync<Result>(
  name: string,
  fn: (span: Span) => Promise<Result>,
): Promise<Result> {
  const tracer = trace.getTracer(LIB_NAME, LIB_VERSION);
  const span = tracer.startSpan(`${name}`);

  return context.with(trace.setSpan(context.active(), span), async () =>
    fn(span).finally(() => span.end()),
  );
}

/**
 * Marks the span as failed, as well as logs the exception.
 */
export function failSpan(span: Span, what: string): void;
export function failSpan(
  span: Span,
  what: string,
  error: Error | unknown,
): void;
export function failSpan(
  span: Span,
  what: string,
  error?: Error | unknown,
): void {
  if (error && error instanceof Error) {
    span.recordException(error);
    // OTEL does not support `cause`, but multiple recordException will create multiple events on the span
    if (error.cause != null) {
      span.recordException(
        error.cause instanceof Error
          ? error.cause
          : new Error(error.cause as string),
      );
    }
  }

  span.setStatus({ code: SpanStatusCode.ERROR, message: what });
}

export const OtelTaxonomy = {
  TokenVerifyIssuer: "token.verify.issuer",
  TokenVerifyAudience: "token.verify.audience",
  OboExchangeTarget: "token.exchange.obo.target",
  OboExchangeProvider: "token.exchange.obo.provider",
  M2MExchangeTarget: "token.exchange.m2m.target",
  M2MExchangeProvider: "token.exchange.m2m.provider",
};
