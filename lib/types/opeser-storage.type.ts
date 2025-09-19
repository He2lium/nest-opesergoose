import {IndicesIndexSettings, MappingProperty} from "@opensearch-project/opensearch/api/types";
import {MappingPropertyBaseWithPropertiesFromClass} from "./opeser-decorator.type";

export namespace OpeserStorageType {
    export interface field {
        key: string
        parent: string
        options: MappingPropertyBaseWithPropertiesFromClass
    }

    export interface schema {
        index?: string
        class: string
        settings?: IndicesIndexSettings
        map: Record<string, MappingProperty>,
    }
}