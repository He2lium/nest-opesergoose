import {IndicesIndexSettings, MappingProperty} from "@opensearch-project/opensearch/api/types";

export namespace OpeserStorageType{
    export interface field {
        key: string
        parent: string
        virtual: MappingProperty
        options: MappingProperty
    }
    export interface schema {
        index?: string
        class: string
        settings?: IndicesIndexSettings
        map: Record<string, MappingProperty>
    }
}