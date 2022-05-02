import Signal from "../utils/signal";

export interface TraceViewerOptions {
    borderWidthPx: number;
    rowHeightPx: number;
    scrollThicknessPx: number;
    timeSignifierStepPx: number;
}

const defaultOptions: TraceViewerOptions = {
    borderWidthPx: 1,
    rowHeightPx: 20,
    scrollThicknessPx: 10,
    timeSignifierStepPx: 90,
};

export default class TraceViewer {

    private readonly renderContext: CanvasRenderingContext2D;
    private readonly options: TraceViewerOptions;
    private readonly spanRows: Span[][] = [];
    private readonly resizeObserver: ResizeObserver;

    private readonly pointerDownLocation = { x: -1, y: -1 };
    private readonly pointerLocation = { x: -1, y: -1 };

    private zoomRatio = 1;

    private scrollPosition = { x: 0, y: 0 };
    private devicePixelRatio = 1;
    private isDragging = false;

    private startTime = 0;
    private endTime = 0;
    private timeWidth = 0;

    private activeAnimationFrameRequestHandle: number | undefined;

    private isDisposed = false;

    public constructor(
        private readonly canvas: HTMLCanvasElement,
        options?: Partial<TraceViewerOptions>,
    ) {
        this.renderContext = this.canvas.getContext('2d')!;

        this.options = {
            ...defaultOptions,
            ...options,
        };

        this.render = this.render.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerOut = this.onPointerOut.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onWheel = this.onWheel.bind(this);

        this.canvas.addEventListener('pointerdown', this.onPointerDown);
        this.canvas.addEventListener('pointermove', this.onPointerMove);
        this.canvas.addEventListener('pointerout', this.onPointerOut);
        this.canvas.addEventListener('pointerup', this.onPointerUp);
        this.canvas.addEventListener('wheel', this.onWheel);

        this.resizeObserver = new ResizeObserver(this.onSizeChanged.bind(this));
        this.resizeObserver.observe(this.canvas);

        this.setScaling();
    }

    public readonly selectedSpanChanged = new Signal();
    public readonly activeSpanChanged = new Signal();

    public selectedSpan: Span | undefined;
    public activeSpan: Span | undefined;

    public async setReport(root: Span) {
        const allSpans: Span[] = [];

        this.startTime = root.start;
        this.endTime = root.end;

        const toProcess: Span[] = [root];
        while (toProcess.length > 0) {
            const current = toProcess.pop()!;

            if (current.end > this.endTime) {
                this.endTime = current.end;
            }
            if (current.start < this.startTime) {
                this.startTime = current.start;
            }

            allSpans.push(current);

            if (current.children !== undefined) {
                toProcess.push(...current.children);
            }
        }

        this.timeWidth = this.endTime - this.startTime;

        allSpans.sort((a, b) => a.start - b.start);

        this.spanRows.length = 0;

        for (const span of allSpans) {
            let inserted = false;
            for (const spanRow of this.spanRows) {
                if (spanRow[spanRow.length - 1].end >= span.start) {
                    continue;
                }

                spanRow.push(span);
                inserted = true;
                break;
            }

            if (!inserted) {
                this.spanRows.push([span]);
            }
        }

        this.ensureRenderQueued();
    }

    private onWheel(e: WheelEvent) {
        let zoomAmount = 0.8;
        if (e.deltaY > 0) {
            zoomAmount = 1 / zoomAmount;
        }

        const scrollDelta = e.offsetX * (zoomAmount - 1) * this.zoomRatio * this.devicePixelRatio;

        this.zoomRatio = Math.min(1, this.zoomRatio * zoomAmount);
        this.scrollPosition.x = Math.max(0, this.scrollPosition.x - scrollDelta);

        e.preventDefault();

        this.ensureRenderQueued();
    }

    private onPointerDown(e: PointerEvent) {
        if (e.button !== 0) {
            return;
        }

        this.pointerDownLocation.x = e.offsetX
        this.pointerDownLocation.y = e.offsetY;

        this.isDragging = true;
        this.canvas.setPointerCapture(e.pointerId);

        e.preventDefault();
    }

    private onPointerMove(e: PointerEvent) {
        this.pointerLocation.x = e.offsetX;
        this.pointerLocation.y = e.offsetY;

        if (this.isDragging) {
            this.scrollPosition.x = Math.max(0, this.scrollPosition.x - e.movementX * this.zoomRatio);
            this.scrollPosition.y = Math.max(0, this.scrollPosition.y - e.movementY);
        }

        this.ensureRenderQueued();
    }

    private onPointerOut() {
        this.pointerLocation.x = -1;
        this.pointerLocation.y = -1;

        this.ensureRenderQueued();
    }

    private onPointerUp(e: PointerEvent) {
        this.isDragging = false;
        this.canvas.releasePointerCapture(e.pointerId);

        if (Math.abs(this.pointerDownLocation.x - e.offsetX) < 5 && Math.abs(this.pointerDownLocation.y - e.offsetY) < 5) {
            if (this.activeSpan !== this.selectedSpan) {
                this.selectedSpan = this.activeSpan;
                this.selectedSpanChanged.raise();

                this.ensureRenderQueued();
            }
        }
    }

    private onSizeChanged() {
        this.canvas.width = this.canvas.clientWidth * this.devicePixelRatio;
        this.canvas.height = this.canvas.clientHeight * this.devicePixelRatio;

        this.ensureRenderQueued();
    }

    private ensureRenderQueued() {
        if (this.activeAnimationFrameRequestHandle === undefined) {
            this.activeAnimationFrameRequestHandle = requestAnimationFrame(this.render)
        }
    }

    private render(timeStamp: DOMHighResTimeStamp) {
        this.activeAnimationFrameRequestHandle = undefined;

        const maxScrollY = Math.max(0, (this.spanRows.length + 1) * (this.options.rowHeightPx * this.devicePixelRatio) - this.canvas.height + (this.options.scrollThicknessPx * this.devicePixelRatio));
        const maxScrollX = this.canvas.width;
        if (this.scrollPosition.x > maxScrollX) {
            this.scrollPosition.x = maxScrollX;
        }
        if (this.scrollPosition.y > maxScrollY) {
            this.scrollPosition.y = maxScrollY;
        }

        const canvasWidth = this.canvas.width / this.devicePixelRatio;
        const rowHeight = this.options.rowHeightPx;
        const halfRowHeight = rowHeight / 2;
        const borderWidth = this.options.borderWidthPx;
        const doubleBorderWidth = borderWidth * 2;

        const spanTitleTextSize = rowHeight - doubleBorderWidth;
        const spanTitleFont = spanTitleTextSize.toString() + 'px monospace';
        const spanTimeFont = (spanTitleTextSize * 0.7).toString() + 'px monospace';

        this.renderContext.clearRect(0, 0, canvasWidth, this.canvas.height / this.devicePixelRatio);
        this.renderContext.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
        this.renderContext.lineWidth = borderWidth;

        this.renderContext.font = spanTitleFont;
        const characterWidthSpanTitle = this.renderContext.measureText('|').width;

        const originalActiveSpan = this.activeSpan;
        this.activeSpan = undefined;

        for (const { span, top, left, right, isHovered } of this.getSpansWithLocations(this.pointerLocation)) {
            const isSelected = span === this.selectedSpan;
            if (isHovered) {
                this.activeSpan = span;
            }

            this.renderContext.beginPath();
            this.renderContext.rect(left, top, right - left, rowHeight);

            this.renderContext.fillStyle = isHovered ? '#888' : isSelected ? '#1e90ff88' : '#8888';
            this.renderContext.fill();

            this.renderContext.lineWidth = borderWidth;
            this.renderContext.strokeStyle = '#000';
            this.renderContext.stroke();

            if (span.events !== undefined) {
                const spanTime = span.end - span.start;
                this.renderContext.lineWidth = borderWidth * 2;

                for (const event of span.events) {
                    const spanWidth = right - left;
                    const eventLeft = left + spanWidth * ((event.time - span.start) / spanTime);
                    this.renderContext.beginPath();
                    this.renderContext.moveTo(eventLeft, top);
                    this.renderContext.lineTo(eventLeft, top + rowHeight);
                    this.renderContext.strokeStyle = event.type === SpanEventType.Information ? '#FFF8' : '#F008';
                    this.renderContext.stroke();
                }
            }


            const textLeft = Math.max(left + borderWidth, 0);
            const textMaxWidth = right - textLeft - borderWidth;
            const nameText = TraceViewer.truncateText(span.name, characterWidthSpanTitle, textMaxWidth);

            this.renderContext.fillStyle = isSelected ? '#FFF' : '#000';
            this.renderContext.font = spanTitleFont;
            this.renderContext.textBaseline = 'middle';
            this.renderContext.textAlign = 'start';
            this.renderContext.fillText(
                nameText.text,
                textLeft,
                top + halfRowHeight + (borderWidth * 2),
                textMaxWidth,
            );

            if (nameText.fits) {
                const timeMaxWidth = textMaxWidth - this.renderContext.measureText(span.name).width;
                if (timeMaxWidth >= (characterWidthSpanTitle * 3)) {
                    const timeText = (span.end - span.start).toFixed(1) + 'ms';

                    this.renderContext.font = spanTimeFont;
                    this.renderContext.textBaseline = 'bottom';
                    this.renderContext.textAlign = 'end';
                    this.renderContext.fillText(
                        timeText,
                        right - borderWidth,
                        top + rowHeight,
                        timeMaxWidth,
                    );
                }
            }
        }

        if (this.activeSpan !== originalActiveSpan) {
            this.activeSpanChanged.raise();

            this.canvas.title = this.activeSpan?.name ?? '';
        }

        this.render_timeSignifiers(spanTimeFont);
        this.render_scrollBars(maxScrollX, maxScrollY);
    }

    private render_timeSignifiers(font: string) {
        this.renderContext.clearRect(0, 0, this.canvas.width, this.options.rowHeightPx);

        const timeSignifierStepPx = this.options.timeSignifierStepPx;
        const right = (this.canvas.width - (this.options.scrollThicknessPx * this.devicePixelRatio)) / this.zoomRatio / this.devicePixelRatio;
        const top = this.options.rowHeightPx / 2 + this.options.borderWidthPx;
        const stepPxRatio = timeSignifierStepPx / right;
        const stepTime = this.timeWidth * stepPxRatio;
        const scrollPositionX = this.scrollPosition.x / this.zoomRatio / this.devicePixelRatio;
        const startLeft = Math.floor(scrollPositionX / this.options.timeSignifierStepPx);

        this.renderContext.font = font;
        this.renderContext.fillStyle = '#000';
        this.renderContext.textBaseline = 'middle';
        this.renderContext.textAlign = 'start';

        const endStepIndex = startLeft + Math.ceil(this.canvas.width / timeSignifierStepPx) + 1;
        for (let stepIndex = startLeft; stepIndex < endStepIndex; stepIndex++) {
            const left = (stepIndex * timeSignifierStepPx) - scrollPositionX;
            if (left > right) {
                break;
            }

            const time = stepIndex * stepTime;

            this.renderContext.fillText(`${time.toFixed(1)}ms`, left, top);
        }
    }

    private render_scrollBars(maxScrollX: number, maxScrollY: number) {
        const scrollThicknessPx = this.options.scrollThicknessPx * this.devicePixelRatio;
        const verticalLeft = (this.canvas.width - scrollThicknessPx) / this.devicePixelRatio;
        const verticalMaxHeight = ((this.canvas.height - (this.options.rowHeightPx * this.devicePixelRatio) - scrollThicknessPx) / this.devicePixelRatio);

        const verticalScrollRatio = maxScrollY === 0 ? 0 : this.scrollPosition.y / maxScrollY;
        const verticalVisibleRatio = this.canvas.height / (maxScrollY + this.canvas.height);
        const verticalHeight = verticalMaxHeight * verticalVisibleRatio;

        this.renderContext.fillStyle = '#8888';
        this.renderRoundRect(
            verticalLeft,
            this.options.rowHeightPx + ((verticalMaxHeight - verticalHeight) * verticalScrollRatio),
            scrollThicknessPx / this.devicePixelRatio,
            verticalHeight,
            this.options.scrollThicknessPx / 2,
        );
    }

    private renderRoundRect(left: number, top: number, width: number, height: number, radius: number) {
        this.renderContext.beginPath();
        this.renderContext.moveTo(left + radius, top);
        this.renderContext.arcTo(left + width, top, left + width, top + height, radius);
        this.renderContext.arcTo(left + width, top + height, left, top + height, radius);
        this.renderContext.arcTo(left, top + height, left, top, radius);
        this.renderContext.arcTo(left, top, left + width, top, radius);
        this.renderContext.closePath();

        this.renderContext.fill();
    }

    private setScaling() {
        this.devicePixelRatio = window.devicePixelRatio;

        this.canvas.width = this.canvas.clientWidth * this.devicePixelRatio;
        this.canvas.height = this.canvas.clientHeight * this.devicePixelRatio;

        matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
            .addEventListener(
                'change',
                () => {
                    if (this.isDisposed) {
                        return;
                    }

                    this.setScaling();
                    this.ensureRenderQueued();
                },
                {
                    once: true
                });
    }

    private getSpanFromLocation(pointerLocation: { x: number, y: number }) {
        for (const spanWithLocation of this.getSpansWithLocations(pointerLocation)) {
            if (spanWithLocation.isHovered) {
                return spanWithLocation.span;
            }
        }

        return undefined;
    }

    private * getSpansWithLocations(pointerLocation: { x: number, y: number }) {
        const rowHeight = this.options.rowHeightPx;
        const canvasWidth = (this.canvas.width - this.options.borderWidthPx) / this.devicePixelRatio - this.options.scrollThicknessPx;
        let rowIndex = 0;

        for (const spanRow of this.spanRows) {
            const top = (rowIndex + 1) * rowHeight - (this.scrollPosition.y / this.devicePixelRatio);

            const isPointerInY = pointerLocation.y > top && pointerLocation.y < top + rowHeight;

            for (const span of spanRow) {
                const left = (Math.round((span.start - this.startTime) / this.timeWidth * canvasWidth) - (this.scrollPosition.x / this.devicePixelRatio)) / this.zoomRatio;
                const right = (Math.round((span.end - this.startTime) / this.timeWidth * canvasWidth) - (this.scrollPosition.x / this.devicePixelRatio)) / this.zoomRatio;

                const isHovered = isPointerInY && pointerLocation.x > left && pointerLocation.x < right;

                yield {
                    span,
                    isHovered,
                    left,
                    right,
                    top,
                };
            }

            rowIndex++;
        }
    }

    public dispose() {
        this.isDisposed = true;

        if (this.activeAnimationFrameRequestHandle !== undefined) {
            cancelAnimationFrame(this.activeAnimationFrameRequestHandle);
        }

        this.resizeObserver.disconnect();

        this.canvas.addEventListener('pointerdown', this.onPointerDown);
        this.canvas.addEventListener('pointermove', this.onPointerMove);
        this.canvas.addEventListener('pointerout', this.onPointerOut);
        this.canvas.addEventListener('pointerup', this.onPointerUp);
        this.canvas.addEventListener('wheel', this.onWheel);
    }

    private static truncateText(text: string, characterWidth: number, maxWidth: number) {
        const maxCharacters = Math.floor(maxWidth / characterWidth);
        if (text.length <= maxCharacters) {
            return { text, fits: true };
        }

        return { text: text.substring(0, maxCharacters - 3) + '...', fits: false };
    }
}

export interface Span {
    name: string;
    id: string;
    rootId: string;
    start: number;
    end: number;
    parentId?: string;
    data?: Record<string, string>;
    events?: SpanEvent[];
    children?: Span[];
};

export interface SpanEvent {
    type: SpanEventType;
    name: string;
    time: number;
    data: Record<string, string>;
}

export enum SpanEventType {
    Information = 'info',
    Error = 'error',
}
