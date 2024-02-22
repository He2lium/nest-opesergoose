import {IndicesIndexSettings, MappingProperty} from "@opensearch-project/opensearch/api/types";
import {TransformDocumentFunctionType} from "./opeser-decorator.type";

export namespace OpeserStorageType{
    export interface field {
        key: string
        parent: string
        options: MappingProperty
    }
    export interface schema {
        index?: string
        class: string
        settings?: IndicesIndexSettings
        map: Record<string, MappingProperty>,
        transform?: TransformDocumentFunctionType
    }
}