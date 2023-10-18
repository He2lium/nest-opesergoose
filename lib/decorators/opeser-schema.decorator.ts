import {IndicesIndexSettings, MappingProperty} from "@opensearch-project/opensearch/api/types";
import {ESMapGlobalStorage} from "../storage/opeser-mapping.storage";
import {OpeserStorageType} from "../types/opeser-storage.type";
import field = OpeserStorageType.field;
import {GetFiledMapUtil} from "../utils/get-filed-map.util";

export const OgSchema = (
    index?: string,
    settings?: IndicesIndexSettings,
) => {
    return function (target: any) {
        const fields: field[] = ESMapGlobalStorage.getProps(target.name)
        let mapping: Record<string, MappingProperty> = {}
        for (let field of fields) {
            mapping[field.key] = GetFiledMapUtil(field.options)
            if (field.virtual) mapping[`_${field.key}`] = GetFiledMapUtil(field.virtual)
        }
        ESMapGlobalStorage.setSchema({
            index,
            class: target.name,
            settings,
            map: mapping,
        })
    }
}