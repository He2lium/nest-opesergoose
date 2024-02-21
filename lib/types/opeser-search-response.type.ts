import {AggregationsAggregate, SearchResponse} from "@opensearch-project/opensearch/api/types";

export type OpeserSearchResponseType<Hits=any, Aggs=AggregationsAggregate> =
    Omit<SearchResponse<Hits>, "aggregations"> & {aggregations?:Aggs}