import {MappingPropertyBaseWithPropertiesFromClass} from "../types/opeser-decorator.type";
import {OpeserStorageType} from "../types/opeser-storage.type";
import {OpeserMappingStorage} from "../storage/opeser-mapping.storage";
import schema = OpeserStorageType.schema;

export function GetFieldMapUtil(options: MappingPropertyBaseWithPropertiesFromClass) {
    if (options.propertiesFromClass) {

        // Get built schema from deeper tree branches
        const nestedSchema: schema = OpeserMappingStorage.getSchemaByClass(
            options.propertiesFromClass.name
        );

        // Union the field options with deeper mapping properties of nested class
        const map = {
            ...options,
            properties: nestedSchema.map,
        };

        // Delete special custom field
        delete map["propertiesFromClass"];

        return {map, analysis: nestedSchema.settings.analysis};
    } else
        return {map: options};
}
