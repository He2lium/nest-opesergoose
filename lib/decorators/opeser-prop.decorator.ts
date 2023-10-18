import {MappingProperty} from "@opensearch-project/opensearch/api/types";
import {MappingPropertyBaseWithPropertiesFromClass} from "../types/opeser-decorator.type";
import {ESMapGlobalStorage} from "../storage/opeser-mapping.storage";

export const OgProp = (
    options: MappingPropertyBaseWithPropertiesFromClass | MappingProperty,
    virtual?: MappingPropertyBaseWithPropertiesFromClass | MappingProperty,
) => {
    return function (target: any, propertyKey: string) {
        ESMapGlobalStorage.setProp({
            key: propertyKey,
            parent: target.constructor.name,
            options,
            virtual,
        })
    }
}