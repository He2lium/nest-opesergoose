import {AggregationsAggregate, SearchResponse} from "@opensearch-project/opensearch/api/types";

export type OpeserSearchResponseType<Hits, Aggs extends AggregationsAggregate> =
    Omit<SearchResponse<Hits>, "aggregations"> & {aggregations?:Aggs}