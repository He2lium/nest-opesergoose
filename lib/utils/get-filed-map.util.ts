import {MappingProperty} from "@opensearch-project/opensearch/api/types";
import {MappingPropertyBaseWithPropertiesFromClass} from "../types/opeser-decorator.type";
import {OpeserStorageType} from "../types/opeser-storage.type";
import schema = OpeserStorageType.schema;
import {OpeserMappingStorage} from "../storage/opeser-mapping.storage";

export function GetFiledMapUtil(options: MappingProperty) {
    if ((options as MappingPropertyBaseWithPropertiesFromClass).propertiesFromClass) {
        const nestedSchema: schema = OpeserMappingStorage.getSchemaByClass(
            (options as MappingPropertyBaseWithPropertiesFromClass).propertiesFromClass.name,
        )
        const map = {
            ...options,
            properties: nestedSchema.map,
        }
        delete map['propertiesFromClass']
        return map
    } else return options
}