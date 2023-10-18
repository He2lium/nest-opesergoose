import {MappingPropertyBase} from "@opensearch-project/opensearch/api/types";

export interface MappingPropertyBaseWithPropertiesFromClass extends MappingPropertyBase {
    propertiesFromClass: any
}