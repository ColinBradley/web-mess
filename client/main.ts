import './main.css';
import { testSpan } from './testData/testSpan';
import type DatadogTrace from './tracing/datadogTrace';
import { convertToNiceTrace } from './tracing/datadogTrace';
// import './monaco';
// import './babylon';
import TraceViewer from './tracing/traceViewer';

(document.getElementById('trave-view-button') as HTMLButtonElement).addEventListener('click', async () => {
    const testData1 = (await import('./testData/8730446366462510288.json')) as any as DatadogTrace;

    const root = convertToNiceTrace(testData1)!;
    traceView.setReport(root);
});
const canvas = document.getElementById('trace-test') as HTMLCanvasElement;

const traceView = new TraceViewer(canvas);
await traceView.setReport(testSpan);

traceView.activeSpanChanged.on(displaySpanInfo);
traceView.selectedSpanChanged.on(displaySpanInfo);

const spanInfoContainer = document.getElementById('trace-content') as HTMLDivElement;

function displaySpanInfo() {
    const span = traceView.activeSpan ?? traceView.selectedSpan;

    if (span === undefined) {
        spanInfoContainer.textContent = '';
    } else {
        let spanHtml = `<h2>${span.name}</h2>`;

        spanHtml += '<dl>';
        spanHtml += `<dt>Time</dt><dd>${span.end - span.start}ms</dd>`;

        if (span.data !== undefined) {
            for (const [key, value] of Object.entries(span.data)) {
                spanHtml += `<dt>${key}</dt><dd>${value}</dd>`;
            }
        }

        spanHtml += '</dl>';

        if (span.events !== undefined) {
            spanHtml += '<h3>Events</h3><ol>';

            for (const event of span.events) {
                spanHtml += `<li><h4>${event.type}: ${event.name}</h4><dl><dt>Time</dt><dd>${(event.time - span.start).toFixed(2)}ms</dd>`;

                if (event.data !== undefined) {
                    for (const [key, value] of Object.entries(event.data)) {
                        spanHtml += `<dt>${key}</dt><dd>${value}</dd>`;
                    }
                }

                spanHtml += '</dl></li>'
            }

            spanHtml += '</ol>';
        }

        spanInfoContainer.innerHTML = spanHtml;
    }
}
