import { Span, SpanEventType } from "../tracing/traceViewer";

export const testSpan: Span = {
    name: "Task \"Carousel\"",
    id: "986829590787260757",
    start: 1647712363747.5,
    rootId: "986829590787260757",
    children: [
        {
            name: "ExecuteTask",
            parentId: "986829590787260757",
            rootId: "986829590787260757",
            id: "1944969135",
            start: 1647712363752.2,
            data: {
                "TaskCellAddress": "root:Imports:c6c6dd3bfe0748469188cb55685a52c1:Component:Tasks:moveNext:updateIndex",
                "TaskPropertyValue_TaskType": "CellSetRule",
                "TaskPropertyValue_Address": "root:Body:Children:C47615289735568540:CarouselState:ActiveSlideIndex",
                "TaskPropertyValue_Rule": "2"
            },
            events: [
                {
                    type: SpanEventType.Information,
                    name: "TaskPropertyValueFetched",
                    time: 1647712363752.3,
                    data: {
                        propertyName: "TaskType",
                        propertyValue: "CellSetRule"
                    }
                },
                {
                    type: SpanEventType.Information,
                    name: "TaskPropertyValueFetched",
                    time: 1647712363752.7,
                    data: {
                        propertyName: "Address",
                        propertyValue: "root:Body:Children:C47615289735568540:CarouselState:ActiveSlideIndex"
                    }
                },
                {
                    type: SpanEventType.Information,
                    name: "TaskPropertyValueFetched",
                    time: 1647712363753,
                    data: {
                        propertyName: "Rule",
                        propertyValue: "2"
                    }
                }
            ],
            end: 1647712363753.3,
            children: [
                {
                    name: 'child',
                    start: 1647712363752.2,
                    end: 1647712363753.3,
                    id: 'dave',
                    rootId: 'dave',
                    children: [
                        {
                            name: 'child',
                            start: 1647712363752.2,
                            end: 1647712363753.3,
                            id: 'dave',
                            rootId: 'dave',
                            children: [
                                {
                                    name: 'child',
                                    start: 1647712363752.2,
                                    end: 1647712363753.3,
                                    id: 'dave',
                                    rootId: 'dave',
                                    children: [
                                        {
                                            name: 'child',
                                            start: 1647712363752.2,
                                            end: 1647712363753.3,
                                            id: 'dave',
                                            rootId: 'dave',
                                            children: [
                                                {
                                                    name: 'child',
                                                    start: 1647712363752.2,
                                                    end: 1647712363753.3,
                                                    id: 'dave',
                                                    rootId: 'dave', children: [
                                                        {
                                                            name: 'child',
                                                            start: 1647712363752.2,
                                                            end: 1647712363753.3,
                                                            id: 'dave',
                                                            rootId: 'dave', children: [
                                                                {
                                                                    name: 'child',
                                                                    start: 1647712363752.2,
                                                                    end: 1647712363753.3,
                                                                    id: 'dave',
                                                                    rootId: 'dave', children: [
                                                                        {
                                                                            name: 'child',
                                                                            start: 1647712363752.2,
                                                                            end: 1647712363753.3,
                                                                            id: 'dave',
                                                                            rootId: 'dave', children: [
                                                                                {
                                                                                    name: 'child',
                                                                                    start: 1647712363752.2,
                                                                                    end: 1647712363753.3,
                                                                                    id: 'dave',
                                                                                    rootId: 'dave', children: [
                                                                                        {
                                                                                            name: 'child',
                                                                                            start: 1647712363752.2,
                                                                                            end: 1647712363753.3,
                                                                                            id: 'dave',
                                                                                            rootId: 'dave', children: [
                                                                                                {
                                                                                                    name: 'child',
                                                                                                    start: 1647712363752.2,
                                                                                                    end: 1647712363753.3,
                                                                                                    id: 'dave',
                                                                                                    rootId: 'dave',
                                                                                                    children: [
                                                                                                        {
                                                                                                            name: 'child',
                                                                                                            start: 1647712363752.2,
                                                                                                            end: 1647712363753.3,
                                                                                                            id: 'dave',
                                                                                                            rootId: 'dave',
                                                                                                            children: [
                                                                                                                {
                                                                                                                    name: 'child',
                                                                                                                    start: 1647712363752.2,
                                                                                                                    end: 1647712363753.3,
                                                                                                                    id: 'dave',
                                                                                                                    rootId: 'dave', children: [
                                                                                                                        {
                                                                                                                            name: 'Last child',
                                                                                                                            start: 1647712363752.2,
                                                                                                                            end: 1647712363754.4001,
                                                                                                                            id: 'dave',
                                                                                                                            rootId: 'dave',
                                                                                                                        }
                                                                                                                    ],
                                                                                                                }
                                                                                                            ],
                                                                                                        }
                                                                                                    ],
                                                                                                }
                                                                                            ],
                                                                                        }
                                                                                    ],
                                                                                }
                                                                            ],
                                                                        }
                                                                    ],
                                                                }
                                                            ],
                                                        }
                                                    ],
                                                }
                                            ],
                                        }
                                    ],
                                }
                            ],
                        }
                    ],
                }
            ],
        },
        {
            name: "ExecuteTask",
            parentId: "986829590787260757",
            rootId: "986829590787260757",
            id: "1441158028",
            start: 1647712363753.5,
            data: {
                "TaskCellAddress": "root:Imports:c6c6dd3bfe0748469188cb55685a52c1:Component:Tasks:moveNext:setScrollPosition",
                "TaskPropertyValue_TaskType": "CellSetValue",
                "TaskPropertyValue_Address": "root:Body:Children:C47615289735568540:Children:C78647570039225490:Children:E30818874549755070:Children:C75276510340406320:Attributes:HtmlScrollLeft",
                "TaskPropertyValue_Value": "1915"
            },
            events: [
                {
                    type: SpanEventType.Information,
                    name: "TaskPropertyValueFetched",
                    time: 1647712363753.7,
                    data: {
                        propertyName: "TaskType",
                        propertyValue: "CellSetValue"
                    }
                },
                {
                    type: SpanEventType.Information,
                    name: "TaskPropertyValueFetched",
                    time: 1647712363753.8,
                    data: {
                        propertyName: "Address",
                        propertyValue: "root:Body:Children:C47615289735568540:Children:C78647570039225490:Children:E30818874549755070:Children:C75276510340406320:Attributes:HtmlScrollLeft"
                    }
                },
                {
                    type: SpanEventType.Information,
                    name: "TaskPropertyValueFetched",
                    time: 1647712363754.2,
                    data: {
                        propertyName: "Value",
                        propertyValue: "1915"
                    }
                }
            ],
            end: 1647712363754.4001
        }
    ],
    end: 1647712363754.6
};