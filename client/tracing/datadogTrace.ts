import { Span, SpanEvent, SpanEventType } from "./traceViewer.ts";

export default interface DatadogTrace {
    orphaned: [
        {
            spans: Record<string, DatadogSpan>;
        }
    ];
    trace: {
        root_id: string;
        spans: Record<string, DatadogSpan>;
    };
}

export interface DatadogSpan {
    metrics: Record<string, number>;
    resource_hash: string;
    end: number;
    name: string;
    service: string;
    start: number;
    hostname: string;
    org_id: number;
    trace_id: string;
    host_groups: string[];
    parent_id: string | undefined;
    meta: Record<string, string>;
    env: string;
    host_id: number;
    duration: number;
    resource: string;
    children_ids?: string[];
    type: string;
    span_id: string;
}

const eventKeyRegex = /^event(\d+)\.(.+)/;

export function convertToNiceTrace(trace: DatadogTrace) {
    const spansById = new Map<string, Span>();
    const edges = new Map<string, string[]>();

    let root: Span | undefined;

    for (const ddSpan of [...Object.values(trace.orphaned[0].spans), ...Object.values(trace.trace.spans)]) {
        const span: Span = {
            id: ddSpan.span_id,
            start: ddSpan.start,
            end: ddSpan.end,
            name: ddSpan.name,
            rootId: ddSpan.trace_id,
            data: {
                service: ddSpan.service,
            }
        };

        const spanEventEntries: SpanEvent[] = [];
        for (const [key, value] of Object.entries(ddSpan.meta)) {
            const eventMatchResult = eventKeyRegex.exec(key);
            if (eventMatchResult !== null) {
                const index = Number.parseInt(eventMatchResult[1]);
                const key = eventMatchResult[2];

                let entry = spanEventEntries[index];
                if (entry === undefined) {
                    entry = {
                        name: 'unknown',
                        type: SpanEventType.Information,
                        time: ddSpan.start,
                        data: {},
                    };
                    spanEventEntries[index] = entry;
                }

                if (key.startsWith('data.')) {
                    entry.data[key.substring(5)] = value;
                } else {
                    switch (key) {
                        case 'name':
                            entry.name = value;
                            break;
                        case 'type':
                            entry.type = value as any;
                            break;
                        case 'time':
                            entry.time = Number.parseFloat(value);
                            break;
                        default:
                            throw new Error('unknown key');
                    }
                }
            }
        }

        if (spanEventEntries.length > 0) {
            span.events = spanEventEntries;
        }

        spansById.set(ddSpan.span_id, span);
        if (ddSpan.children_ids !== undefined) {
            edges.set(ddSpan.span_id, ddSpan.children_ids);
        }

        if (ddSpan.parent_id === undefined || ddSpan.parent_id.length === 0 || span.id === trace.trace.root_id) {
            root = span;
        }
    }

    for (const [parentId, childIds] of edges.entries()) {
        const span = spansById.get(parentId)!;
        span.children = childIds.map(childId => spansById.get(childId)!);
    }

    return root;
}