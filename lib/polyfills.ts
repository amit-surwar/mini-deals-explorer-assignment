/**
 * Runtime polyfills Hermes needs before msw/native can load: URL,
 * TextEncoder/TextDecoder, and the DOM event classes MSW's interceptors
 * reference at import time. Must be imported first in app/_layout.tsx.
 *
 * Instance properties are created with Object.defineProperty rather than
 * plain field assignment: MSW subclasses these events and declares getter-only
 * accessors (e.g. defaultPrevented), and a base-class assignment through such
 * a getter throws in Hermes. defineProperty shadows the getter safely.
 */
// Spec-compliant fetch family (fetch/Headers/Request/Response with readable
// streams). RN's built-in whatwg-fetch stub can't stream response bodies, so
// MSW-mocked responses would arrive empty without these. Order matters:
// encoding and streams must exist before the fetch polyfill applies.
import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding";
import { polyfill as polyfillFetch } from "react-native-polyfill-globals/src/fetch";
import { polyfill as polyfillReadableStream } from "react-native-polyfill-globals/src/readable-stream";
import { polyfill as polyfillUrl } from "react-native-polyfill-globals/src/url";

polyfillEncoding();
polyfillUrl();
polyfillReadableStream();
const ResponseBeforeFetchPolyfill = (globalThis as Record<string, unknown>).Response;
polyfillFetch();

/**
 * react-native-fetch-api's `body` getter is broken for non-stream bodies: it
 * runs `new Uint8Array(text)` on a string (garbage) and enqueues individual
 * numbers instead of byte chunks, so MSW re-wrapping a mocked response via
 * `response.body` would produce an empty body. Replace the getter with a
 * correct single-chunk stream. Applied only when the fetch polyfill actually
 * installed (never under Jest, where Node's spec-compliant classes are used).
 */
type BodyInternals = {
  _bodyReadableStream?: unknown;
  _bodyArrayBuffer?: ArrayBuffer | ArrayBufferView;
  _bodyBlob?: Blob;
  _bodyFormData?: { toString(): string };
  _bodyText?: string;
};

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
    reader.readAsArrayBuffer(blob);
  });
}

function patchBodyStreamGetter(ctor: unknown): void {
  const proto = (ctor as { prototype?: object } | undefined)?.prototype;
  if (!proto) {
    return;
  }
  const ReadableStreamCtor = (globalThis as Record<string, unknown>)
    .ReadableStream as new (underlyingSource: {
    start(controller: {
      enqueue(chunk: Uint8Array): void;
      close(): void;
      error(reason: unknown): void;
    }): void | Promise<void>;
  }) => unknown;

  Object.defineProperty(proto, "body", {
    configurable: true,
    enumerable: false,
    get(this: BodyInternals & { _body?: BodyInternals }) {
      // Response/Request delegate to an internal Body at `_body`.
      const internals = this._body ?? this;
      if (internals._bodyReadableStream) {
        return internals._bodyReadableStream;
      }
      return new ReadableStreamCtor({
        async start(controller) {
          try {
            let bytes: Uint8Array;
            if (internals._bodyArrayBuffer) {
              bytes = ArrayBuffer.isView(internals._bodyArrayBuffer)
                ? new Uint8Array(
                    internals._bodyArrayBuffer.buffer as ArrayBuffer,
                  )
                : new Uint8Array(internals._bodyArrayBuffer);
            } else if (internals._bodyBlob) {
              bytes = new Uint8Array(await readBlobAsArrayBuffer(internals._bodyBlob));
            } else {
              const text =
                internals._bodyFormData?.toString() ?? internals._bodyText ?? "";
              bytes = new TextEncoder().encode(text);
            }
            if (bytes.byteLength > 0) {
              controller.enqueue(bytes);
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });
    },
  });
}

if ((globalThis as Record<string, unknown>).Response !== ResponseBeforeFetchPolyfill) {
  patchBodyStreamGetter((globalThis as Record<string, unknown>).Response);
  patchBodyStreamGetter((globalThis as Record<string, unknown>).Request);
}

const globalScope = globalThis as unknown as Record<string, unknown>;

type EventLike = { type: string };
type EventListenerLike = (event: EventLike) => void;

function defineValue(target: object, key: string, value: unknown): void {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

if (typeof globalScope.Event === "undefined") {
  class EventPolyfill {

    constructor(type: string, init?: { bubbles?: boolean; cancelable?: boolean }) {
      defineValue(this, "type", type);
      defineValue(this, "bubbles", init?.bubbles ?? false);
      defineValue(this, "cancelable", init?.cancelable ?? false);
      defineValue(this, "defaultPrevented", false);
    }

    preventDefault(): void {
      defineValue(this, "defaultPrevented", true);
    }

    stopPropagation(): void {}

    stopImmediatePropagation(): void {}
  }
  globalScope.Event = EventPolyfill;
}

if (typeof globalScope.EventTarget === "undefined") {
  class EventTargetPolyfill {
    private readonly listeners = new Map<string, Set<EventListenerLike>>();

    addEventListener(type: string, listener: EventListenerLike | null): void {
      if (!listener) {
        return;
      }
      const existing = this.listeners.get(type) ?? new Set<EventListenerLike>();
      existing.add(listener);
      this.listeners.set(type, existing);
    }

    removeEventListener(type: string, listener: EventListenerLike | null): void {
      if (!listener) {
        return;
      }
      this.listeners.get(type)?.delete(listener);
    }

    dispatchEvent(event: EventLike): boolean {
      const listeners = this.listeners.get(event.type);
      if (listeners) {
        for (const listener of [...listeners]) {
          listener(event);
        }
      }
      return true;
    }
  }
  globalScope.EventTarget = EventTargetPolyfill;
}

const BaseEvent = globalScope.Event as new (
  type: string,
  init?: { bubbles?: boolean; cancelable?: boolean },
) => EventLike;

if (typeof globalScope.MessageEvent === "undefined") {
  class MessageEventPolyfill extends BaseEvent {

    constructor(
      type: string,
      init?: {
        data?: unknown;
        origin?: string;
        lastEventId?: string;
        bubbles?: boolean;
        cancelable?: boolean;
      },
    ) {
      super(type, init);
      defineValue(this, "data", init?.data ?? null);
      defineValue(this, "origin", init?.origin ?? "");
      defineValue(this, "lastEventId", init?.lastEventId ?? "");
    }
  }
  globalScope.MessageEvent = MessageEventPolyfill;
}

if (typeof globalScope.BroadcastChannel === "undefined") {
  type MessageListener = (event: { type: string; data: unknown }) => void;
  const channelsByName = new Map<string, Set<BroadcastChannelPolyfill>>();

  class BroadcastChannelPolyfill {
    readonly name: string;
    onmessage: MessageListener | null = null;
    onmessageerror: MessageListener | null = null;
    private readonly listeners = new Set<MessageListener>();
    private closed = false;

    constructor(name: string) {
      this.name = name;
      const peers = channelsByName.get(name) ?? new Set<BroadcastChannelPolyfill>();
      peers.add(this);
      channelsByName.set(name, peers);
    }

    postMessage(data: unknown): void {
      if (this.closed) {
        return;
      }
      const peers = channelsByName.get(this.name);
      if (!peers) {
        return;
      }
      for (const peer of peers) {
        if (peer === this || peer.closed) {
          continue;
        }
        const event = { type: "message", data };
        peer.onmessage?.(event);
        for (const listener of [...peer.listeners]) {
          listener(event);
        }
      }
    }

    addEventListener(type: string, listener: MessageListener | null): void {
      if (type === "message" && listener) {
        this.listeners.add(listener);
      }
    }

    removeEventListener(type: string, listener: MessageListener | null): void {
      if (type === "message" && listener) {
        this.listeners.delete(listener);
      }
    }

    close(): void {
      this.closed = true;
      channelsByName.get(this.name)?.delete(this);
    }
  }

  globalScope.BroadcastChannel = BroadcastChannelPolyfill;
}

// RN's XMLHttpRequest returns null from getAllResponseHeaders() where the
// spec says empty string; MSW's interceptor calls .split() on the result.
const XhrCtor = globalScope.XMLHttpRequest as
  | { prototype: { getAllResponseHeaders: () => string | null } }
  | undefined;
if (XhrCtor?.prototype?.getAllResponseHeaders) {
  const originalGetAllResponseHeaders = XhrCtor.prototype.getAllResponseHeaders;
  XhrCtor.prototype.getAllResponseHeaders = function getAllResponseHeaders(
    this: unknown,
  ): string {
    return originalGetAllResponseHeaders.call(this) ?? "";
  };
}

if (typeof globalScope.XMLHttpRequestUpload === "undefined") {
  // Referenced by MSW's XHR interceptor; RN's XMLHttpRequest never exposes it.
  const EventTargetCtor = globalScope.EventTarget as new () => object;
  class XMLHttpRequestUploadPolyfill extends EventTargetCtor {}
  globalScope.XMLHttpRequestUpload = XMLHttpRequestUploadPolyfill;
}

if (typeof globalScope.CloseEvent === "undefined") {
  class CloseEventPolyfill extends BaseEvent {

    constructor(
      type: string,
      init?: {
        code?: number;
        reason?: string;
        wasClean?: boolean;
        bubbles?: boolean;
        cancelable?: boolean;
      },
    ) {
      super(type, init);
      defineValue(this, "code", init?.code ?? 0);
      defineValue(this, "reason", init?.reason ?? "");
      defineValue(this, "wasClean", init?.wasClean ?? false);
    }
  }
  globalScope.CloseEvent = CloseEventPolyfill;
}
